// Wind rings for the Somorrostro buoy.
//
// Two views over the same set of concentric rings, swapping every few seconds:
// PAST shows the buoy's own measurements (one ring per 15 min, older rings
// bigger and fainter), FUTURE expands them past the edge of the window and
// grows the OpenWeather forecast out of the centre instead. All the geometry
// is CSS (see style.css); this file loads the data and lays the rings out.

// Buoy location, same values as the main app's main.js
const LATITUDE = 41.375694;
const LONGITUDE = 2.216194;

const PROXY_URL = 'https://api.icatmar.cat/proxy/';
const ERDDAP = {
  int: 'https://hebe.icm.csic.es/erddap',
  ext: 'https://erddap.icatmar.cat/erddap',
};
const DATASET = 'BUOY_SOMO_METEO';
// GitHub Pages is not on the proxy's allowlist, but it serves the file with
// access-control-allow-origin: * (and an exposed Last-Modified), so it is
// fetched directly instead of through the proxy.
const REPO_URL = 'https://icatmar.github.io/data/observational/insitu/Boies/SOMO/BoiaSomorrostro_cr1000xs_Meteo.dat';
const OPENWEATHER_URL = 'https://api.icatmar.cat/openWeatherAPI';

const MINUTE = 60 * 1000;
const BUOY_STEP_MINUTES = 15;       // the buoy reports every 15 min
const PAST_HOURS = 6;               // how much history to ask ERDDAP for
const FRESH_LIMIT = 15 * MINUTE;    // data younger than this needs no refetch
const STALE_LIMIT = 30 * MINUTE;    // ERDDAP older than this: check the repo too
const BUOY_INTERVAL = 5 * MINUTE;
const BUOY_RETRY = 1 * MINUTE;      // when no buoy data could be loaded at all
const FORECAST_INTERVAL = 30 * MINUTE;
const FORECAST_RETRY = 5 * MINUTE;
const VIEW_INTERVAL = 30 * 1000;     // PAST <-> FUTURE swap

// Wind speed colour scale, copied from ../Assets/Scripts/data/colorLegends.js.
// Stops are normalized over the displayed unit's range (see colorForSpeed).
const WIND_LEGEND = [
  [0.00, [255, 255, 255]], // 0
  [0.15, [0, 255, 255]],   // 6 kn
  [0.25, [0, 180, 0]],     // 10 kn
  [0.50, [255, 255, 0]],   // 20 kn
  [0.75, [255, 0, 0]],     // 30 kn
  [1.00, [255, 0, 255]],   // 40 kn
];

// Same options and ranges as the main app's units.js, kn first (the default
// here). Data is stored in m/s, toDisplay converts out of it.
const UNITS = [
  { unit: 'kn', decimals: 1, range: [0, 40], toDisplay: v => v * 1.94384 },
  { unit: 'm/s', decimals: 1, range: [0, 20], toDisplay: v => v },
  { unit: 'km/h', decimals: 0, range: [0, 70], toDisplay: v => v * 3.6 },
];

// The eight traditional Mediterranean winds, from N clockwise
const WIND_NAMES = ['Tramuntana', 'Gregal', 'Llevant', 'Xaloc', 'Migjorn', 'Garbí', 'Ponent', 'Mestral'];

const MESSAGES = {
  checking: 'Comprovant que les dades existeixen a ERDDAP i que són actuals',
  erddapFresh: 'Les dades existeixen i són actuals, descarregant les dades',
  erddapStale: 'Les dades existeixen a l\'ERDDAP però no són actuals, comprovant les dades al repositori',
  erddapMissing: 'Les dades no existeixen a l\'ERDDAP, comprovant les dades al repositori',
  forecast: 'Descarregant les dades de previsió',
  forecastOnly: 'No s\'han trobat les dades de la boia, descarregant dades de previsió',
};

// --------------------------------------------------------------------- STATE

let dataBuoy = {};      // ISO timestamp -> { WDIR (deg), WSPD (m/s) }
let dataForecast = [];  // [{ date, WDIR, WSPD }], oldest first

// 'loading' | 'ok' | 'nodata' | 'offline' | 'skipped', shown in the bottom
// corner. 'skipped' is only the repository's: when ERDDAP has current data it
// is never asked, and saying so beats leaving it on "Comprovant..." forever.
const status = { int: 'loading', ext: 'loading', repo: 'loading', forecast: 'loading' };

let unitIndex = 0;
let animationOn = true; // automatic PAST <-> FUTURE swap (see the toggle)
let geom = { maxRadius: 0, outerPast: 0, outerFuture: 0 }; // see layout()
let panX = 0, panY = 0; // stage offset, only used when the rings overflow
let nextBuoyFetch = 0;
let nextForecastFetch = 0;
let nextViewSwap = 0;
let futureView = false;
let lastTick = 0;    // last second the corner and the labels were refreshed on
let timeLabels = []; // [{ el, date }], refreshed every second by updateClock

const el = id => document.getElementById(id);

// ------------------------------------------------------------------ FETCHING

const proxied = url => PROXY_URL + '?url=' + encodeURIComponent(url);

// Both sources timestamp their rows with the buoy's own wall clock, even
// though ERDDAP labels the column UTC: at the time of writing the repository
// file's HTTP Last-Modified is 08:10 UTC while its newest row reads 09:45, so
// the rows are Europe/Madrid (UTC+2 in summer, +1 in winter), not UTC. Taking
// them at face value puts every measurement an hour or two in the future and
// makes "fa X min" nonsense, so they are converted to the real instant here,
// at the only two places timestamps enter. Drop this if the sources are ever
// fixed to emit real UTC.
const BUOY_TIMEZONE = 'Europe/Madrid';

function parseBuoyDate(wallClock) {
  const asIfUTC = new Date(wallClock + 'Z');
  const offset = new Date(asIfUTC.toLocaleString('en-US', { timeZone: 'UTC' }))
    - new Date(asIfUTC.toLocaleString('en-US', { timeZone: BUOY_TIMEZONE }));
  return new Date(asIfUTC.getTime() + offset);
}

// ERDDAP's own catalogue: every dataset on the server with its latest time.
// Returns the buoy's maxTime, or undefined if the server has no such dataset.
// Throws if the server itself cannot be reached.
async function fetchMaxTime(server) {
  const url = `${ERDDAP[server]}/tabledap/allDatasets.jsonlKVP?datasetID,maxTime`;
  const text = await fetch(proxied(url)).then(res => {
    if (!res.ok) throw new Error(res.status);
    return res.text();
  });
  const row = text.trim().split('\n')
    .map(line => JSON.parse(line))
    .find(d => d.datasetID === DATASET);
  return row && row.maxTime ? parseBuoyDate(row.maxTime.replace('Z', '')) : undefined;
}

// Checks one server and records its status, so a server that is down or has
// dropped the dataset shows up in the corner instead of failing silently.
async function checkERDDAP(server) {
  try {
    const maxTime = await fetchMaxTime(server);
    status[server] = maxTime ? 'ok' : 'nodata';
    return maxTime;
  } catch (e) {
    console.error(`Could not reach ${ERDDAP[server]}`, e);
    status[server] = 'offline';
    return undefined;
  }
}

// ERDDAP CSV: line 1 = column names, line 2 = units, then time,WDIR,WSPD rows.
// Missing values arrive as NaN or as an empty cell, and are skipped.
function parseERDDAPCSV(text) {
  const entries = {};
  text.trim().split(/\r?\n/).slice(2).forEach(line => {
    const [time, dir, speed] = line.split(',');
    const WDIR = parseFloat(dir);
    const WSPD = parseFloat(speed);
    if (isNaN(WDIR) || isNaN(WSPD)) return;
    entries[parseBuoyDate(time.replace('Z', '')).toISOString()] = { WDIR, WSPD };
  });
  return entries;
}

// The last PAST_HOURS of wind from one server. Anchored on "now", but retried
// against the dataset's own maxTime if that window comes back empty - a server
// can hold data that lags well behind the clock.
async function fetchERDDAPData(server, maxTime) {
  // `from` is a real instant while ERDDAP's own time column runs ahead of it
  // (see parseBuoyDate), so the bound reaches back an hour or two further than
  // asked. Harmless - a couple of extra rows, never a missing recent one.
  const request = async from => {
    const url = `${ERDDAP[server]}/tabledap/${DATASET}.csv?time,WDIR,WSPD`
      + `&time>=${from.toISOString()}`;
    const res = await fetch(proxied(url));
    if (!res.ok) return {}; // ERDDAP answers 404 when a query matches no rows
    return parseERDDAPCSV(await res.text());
  };

  const window = PAST_HOURS * 60 * MINUTE;
  let entries = await request(new Date(Date.now() - window));
  if (Object.keys(entries).length === 0 && maxTime && Date.now() - maxTime > window) {
    entries = await request(new Date(maxTime.getTime() - window));
  }
  return entries;
}

// When the file the repository serves was last written. A HEAD, not the
// ~600 kB file itself, so this is a cheap way to tell whether downloading it
// would actually get us anything newer than ERDDAP already has.
async function fetchRepoDate() {
  const res = await fetch(REPO_URL, { method: 'HEAD', cache: 'no-cache' });
  if (!res.ok) throw new Error(res.status);
  const lastModified = res.headers.get('Last-Modified');
  return lastModified ? new Date(lastModified) : undefined;
}

// TOA5 logger file: line 1 = file metadata, line 2 = quoted column names,
// lines 3-4 = units and aggregation, then one row per timestamp (buoy wall
// clock, see parseBuoyDate). Only the tail is parsed - the file holds months
// of data and only the last few hours are ever drawn.
function parseRepoFile(text) {
  const lines = text.trim().split(/\r?\n/); // the logger writes CRLF
  const columns = lines[1].split(',').map(name => name.replace(/"/g, ''));
  const iTime = columns.indexOf('TIMESTAMP');
  const iDir = columns.indexOf('Corr_WindDir');
  const iSpeed = columns.indexOf('Corr_WindS');
  if (iTime < 0 || iDir < 0 || iSpeed < 0) throw new Error('Unexpected columns in the repository file');

  const rows = PAST_HOURS * 60 / BUOY_STEP_MINUTES;
  const entries = {};
  lines.slice(Math.max(4, lines.length - rows)).forEach(line => {
    const cells = line.split(',');
    const WDIR = parseFloat(cells[iDir]);
    const WSPD = parseFloat(cells[iSpeed]);
    if (isNaN(WDIR) || isNaN(WSPD)) return;
    const date = parseBuoyDate(cells[iTime].replace(/"/g, '').replace(' ', 'T'));
    entries[date.toISOString()] = { WDIR, WSPD };
  });
  return entries;
}

async function fetchRepoData() {
  const res = await fetch(REPO_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(res.status);
  return parseRepoFile(await res.text());
}

// ---------------------------------------------------------- LOADING THE DATA

// Newest measurement currently held, or undefined when nothing is loaded
function latestEntry() {
  const times = Object.keys(dataBuoy);
  if (times.length === 0) return undefined;
  const date = new Date(Math.max(...times.map(t => new Date(t))));
  return { date, ...dataBuoy[date.toISOString()] };
}

const isEmpty = entries => !entries || Object.keys(entries).length === 0;

// Picks a source and loads the last few hours of wind from it: whichever
// ERDDAP is furthest ahead if it is current, otherwise whichever of that
// server and the repository holds the more recent data.
async function loadBuoyData() {
  setMessage(MESSAGES.checking);
  status.int = status.ext = 'loading';
  const [intMax, extMax] = await Promise.all([checkERDDAP('int'), checkERDDAP('ext')]);

  const server = !intMax && !extMax ? undefined
    : !extMax || (intMax && intMax >= extMax) ? 'int' : 'ext';
  const maxTime = server === 'int' ? intMax : extMax;

  let entries;
  status.repo = 'skipped';
  if (maxTime && Date.now() - maxTime < STALE_LIMIT) {
    setMessage(MESSAGES.erddapFresh);
    entries = await fetchERDDAPData(server, maxTime).catch(e => {
      console.error('Could not load the ERDDAP data', e);
      status[server] = 'offline';
      return undefined;
    });
  }

  // No usable ERDDAP data, or what it has is old enough that the repository
  // may already be further ahead - the repo is written straight from the
  // logger, ERDDAP ingests from it.
  if (isEmpty(entries)) {
    setMessage(maxTime ? MESSAGES.erddapStale : MESSAGES.erddapMissing);
    const repoDate = await fetchRepoDate().catch(e => {
      console.error('Could not reach the repository', e);
      status.repo = 'offline';
      return undefined;
    });

    if (repoDate && (!maxTime || repoDate > maxTime)) {
      entries = await fetchRepoData().catch(e => {
        console.error('Could not load the repository file', e);
        status.repo = 'offline';
        return undefined;
      });
      if (entries) status.repo = isEmpty(entries) ? 'nodata' : 'ok';
    } else if (repoDate) {
      status.repo = 'nodata'; // reachable, but behind what ERDDAP already has
    }

    // The repository could not do better: fall back to the stale ERDDAP data
    if (isEmpty(entries) && server) {
      entries = await fetchERDDAPData(server, maxTime).catch(() => undefined);
    }
  }

  if (!isEmpty(entries)) dataBuoy = entries;

  const latest = latestEntry();
  nextBuoyFetch = Date.now() + (latest ? BUOY_INTERVAL : BUOY_RETRY);
  return latest !== undefined;
}

// Only actually refetches when what we hold has gone stale - the buoy reports
// every 15 min, so a 5-minute tick usually has nothing new to ask for.
async function refreshBuoyData() {
  const latest = latestEntry();
  if (latest && Date.now() - latest.date < FRESH_LIMIT) {
    nextBuoyFetch = Date.now() + BUOY_INTERVAL;
    return;
  }
  await loadBuoyData();
  render();
}

// 5 day / 3 hour atmospheric forecast at the buoy location
// (https://openweathermap.org/forecast5)
async function loadForecastData() {
  try {
    const url = `${OPENWEATHER_URL}?lat=${LATITUDE}&lon=${LONGITUDE}`;
    const json = await fetch(url).then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    });
    dataForecast = json.list.map(e => ({
      date: new Date(e.dt * 1000),
      WSPD: e.wind.speed,
      WDIR: e.wind.deg,
    }));
    status.forecast = 'ok';
    nextForecastFetch = Date.now() + FORECAST_INTERVAL;
  } catch (e) {
    console.error('Could not load the OpenWeather forecast', e);
    status.forecast = 'offline';
    nextForecastFetch = Date.now() + FORECAST_RETRY;
  }
}

// ---------------------------------------------------------------- FORMATTING

const currentUnit = () => UNITS[unitIndex];

function speedText(speed) {
  const { toDisplay, decimals } = currentUnit();
  return toDisplay(speed).toFixed(decimals);
}

// Interpolated WIND_LEGEND colour, normalized over the displayed unit's range
// so the scale keeps its meaning when the unit changes.
function colorForSpeed(speed) {
  const { range, toDisplay } = currentUnit();
  const t = Math.min(Math.max((toDisplay(speed) - range[0]) / (range[1] - range[0]), 0), 1);
  for (let i = 0; i < WIND_LEGEND.length - 1; i++) {
    const [t0, c0] = WIND_LEGEND[i];
    const [t1, c1] = WIND_LEGEND[i + 1];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0);
      const channel = j => Math.round(c0[j] + (c1[j] - c0[j]) * f);
      return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
    }
  }
  const [, last] = WIND_LEGEND[WIND_LEGEND.length - 1];
  return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

function windName(direction) {
  const step = 360 / WIND_NAMES.length;
  const bearing = ((direction % 360) + 360) % 360;
  return WIND_NAMES[Math.floor((bearing + step / 2) / step) % WIND_NAMES.length];
}

const pad = n => String(n).padStart(2, '0');
const hourText = date => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// "fa 1 h 23 min" for measurements, "d'aquí 4 h" for the forecast. How much
// detail to keep follows how far apart the rings being labelled are, not how
// big the number is: past rings are 15 min apart and every minute has to stay
// in or neighbours collapse onto the same label, while forecast rings are 3 h
// apart and "d'aquí 21 h 40 min" is just noise (see `coarse`).
function timeFromNow(date, coarse) {
  const minutes = Math.round((date - Date.now()) / MINUTE);
  const abs = Math.abs(minutes);
  if (abs < 1) return 'ara';
  const rest = abs % 60;
  let amount;
  if (abs < 60) amount = `${abs} min`;
  else if (coarse) amount = `${Math.round(abs / 60)} h`;
  else amount = rest ? `${(abs - rest) / 60} h ${rest} min` : `${abs / 60} h`;
  return minutes < 0 ? `fa ${amount}` : `d'aquí ${amount}`;
}

// A ring's own clock time: solid on the hour, dashed at :30, dotted at :15/:45
function ringBorder(date) {
  const minute = Math.round(date.getMinutes() / BUOY_STEP_MINUTES) * BUOY_STEP_MINUTES % 60;
  if (minute === 0) return { style: 'solid', width: '2px' };
  if (minute === 30) return { style: 'dashed', width: '1px' };
  return { style: 'dotted', width: '1px' };
}

// ------------------------------------------------------------------ GEOMETRY

// Half-width of the widest ring label, and the limits on the wedge cut out of
// a ring for it (see the mask on #past .ring). The same label covers a much
// wider angle on a small ring than on a big one, hence the asin.
const LABEL_HALF_WIDTH = 44;
const GAP_MIN = 6;
const GAP_MAX = 46;

const NOW_RADIUS = 90;   // half of the 180x180 centre ring
const EDGE_MARGIN = 24;  // keeps the outermost ring off the window edge
// The tightest the rings are allowed to get. Above it they spread to fill the
// window; below it they stop shrinking and overflow instead, which is what
// makes a phone pannable while a short laptop still fits all of them.
const MIN_RING_GAP = 30;
const PAST_COUNT = 8;      // 2 h of history, at 15 min a ring
const FORECAST_COUNT = 8;  // 24 h ahead, at one forecast step (3 h) a ring

// Where every ring sits. Both sets are always drawn in full: the rings are
// spread to fill the window when they fit, and on a window too small for that
// (a phone, mostly) they keep MIN_RING_GAP and overflow instead, with the
// stage becoming draggable so the outer ones stay reachable (see setupPan).
// --now-scale is how much the centre ring has to grow to become the boundary
// the forecast rings sit inside.
function layout() {
  const maxRadius = Math.min(window.innerWidth, window.innerHeight) / 2 - EDGE_MARGIN;
  const pastStep = Math.max(MIN_RING_GAP, (maxRadius - NOW_RADIUS) / PAST_COUNT);
  const forecastStep = Math.max(MIN_RING_GAP, maxRadius / FORECAST_COUNT);
  const outerPast = NOW_RADIUS + PAST_COUNT * pastStep;
  const outerFuture = FORECAST_COUNT * forecastStep;

  geom = { maxRadius, pastStep, forecastStep, outerPast, outerFuture };
  // Both are static: the transition reads them as its end state, it never
  // animates them (see the group transforms in style.css).
  el('stage').style.setProperty('--now-scale', String(outerFuture / NOW_RADIUS));
  el('stage').style.setProperty('--now-d', outerFuture * 2 + 'px');
  el('stage').classList.toggle('pannable', Math.max(outerPast, outerFuture) > maxRadius);
  setPan(panX, panY); // the limits just moved with the geometry
  return geom;
}

// How far the stage can be dragged: enough to bring the outermost ring of the
// view being shown into the window, and no further.
function panLimit() {
  const outer = futureView ? geom.outerFuture : geom.outerPast;
  return Math.max(0, outer - geom.maxRadius + EDGE_MARGIN);
}

function setPan(x, y) {
  const limit = panLimit();
  panX = Math.min(limit, Math.max(-limit, x));
  panY = Math.min(limit, Math.max(-limit, y));
  el('stage').style.setProperty('--pan-x', panX + 'px');
  el('stage').style.setProperty('--pan-y', panY + 'px');
}

// ----------------------------------------------------------------- RENDERING

// One ring outline plus, when there is a measurement for it, the value chip
// and the two labels (clock time below, time from now above). `fade` only
// applies to the history rings, which dim as they go back in time.
function addRing({ parent, radius, date, entry, fade, coarse }) {
  const border = ringBorder(date);
  const ring = document.createElement('div');
  ring.className = 'ring';
  ring.style.setProperty('--d', radius * 2 + 'px');
  const gap = Math.asin(Math.min(1, LABEL_HALF_WIDTH / radius)) * 180 / Math.PI;
  ring.style.setProperty('--gap', Math.min(GAP_MAX, Math.max(GAP_MIN, gap)) + 'deg');
  ring.style.borderStyle = border.style;
  ring.style.borderWidth = border.width;
  if (fade !== undefined) ring.style.setProperty('--fade', fade);
  parent.appendChild(ring);

  const label = (side, text) => {
    const div = document.createElement('div');
    div.className = 'ring-label';
    div.style.setProperty('--r', radius + 'px');
    div.style.setProperty('--side', side);
    if (fade !== undefined) div.style.setProperty('--fade', fade);
    div.textContent = text;
    parent.appendChild(div);
    return div;
  };

  label(1, hourText(date));
  // Kept so the tick can refresh it in place as time passes (see updateClock)
  timeLabels.push({ el: label(-1, timeFromNow(date, coarse)), date, coarse });

  if (!entry) return;
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.style.setProperty('--r', radius + 'px');
  chip.style.setProperty('--dir', (entry.WDIR-90) + 'deg');
  chip.style.setProperty('--text-flip', entry.WDIR > 180 ? '180deg' : '0deg');
  chip.style.setProperty('--color', colorForSpeed(entry.WSPD));
  if (fade !== undefined) chip.style.setProperty('--fade', fade);
  chip.innerHTML = `<span>${speedText(entry.WSPD)}</span>`;
  chip.title = `${speedText(entry.WSPD)} ${currentUnit().unit}, ${entry.WDIR}º`
  parent.appendChild(chip);
}

// One ring per 15-min step back from the newest measurement, growing outward
// and fading as they go.
function renderPast(geometry) {
  const past = el('past');
  past.innerHTML = '';
  const latest = latestEntry();
  if (!latest) return;

  for (let i = 1; i <= PAST_COUNT; i++) {
    const date = new Date(latest.date.getTime() - i * BUOY_STEP_MINUTES * MINUTE);
    addRing({
      parent: past,
      radius: NOW_RADIUS + i * geometry.pastStep,
      date,
      entry: dataBuoy[date.toISOString()],
      fade: 0.85 - 0.55 * (i - 1) / (PAST_COUNT - 1),
    });
  }
}

// One ring per forecast step ahead, growing out of the centre and staying
// inside the expanded centre ring.
function renderForecast(geometry) {
  const forecast = el('forecast');
  forecast.innerHTML = '';
  dataForecast
    .filter(f => f.date > Date.now())
    .slice(0, FORECAST_COUNT)
    .forEach((f, i) => addRing({
      parent: forecast,
      radius: (i + 1) * geometry.forecastStep,
      date: f.date,
      entry: f,
      fade: 0.9 - 0.5 * i / (FORECAST_COUNT - 1),
      coarse: true,
    }));
}

// Each name's distance from the centre, by bearing. The labels are far wider
// than they are tall, so the ones due east and west need more room to clear
// the ring while the ones due north and south can sit closer in.
const COMPASS_RADIUS = { 0: 100, 90: 110, 180: 100, 270: 110 };
const COMPASS_RADIUS_DEFAULT = 108; // the four diagonals

// The eight wind names around the centre ring. Fixed, so only built once.
function renderCompass() {
  const compass = el('compass');
  if (compass.children.length) return;
  compass.innerHTML = WIND_NAMES.map((name, i) => {
    const dir = i * 360 / WIND_NAMES.length;
    const radius = COMPASS_RADIUS[dir] || COMPASS_RADIUS_DEFAULT;
    return `<div class="ring-label" style="--dir: ${dir}deg; --r: ${radius}px">${name}</div>`;
  }).join('');
}

function renderNow() {
  const latest = latestEntry();
  // Same -90 as the chips: the arrow is pushed out along the x axis, so a
  // bearing of 0 has to be turned a quarter circle to point north.
  const arrow = el('now-arrow');
  arrow.classList.toggle('no-data', !latest);
  if (latest) arrow.style.setProperty('--dir', (latest.WDIR - 90) + 'deg');

  el('now-speed').textContent = latest ? speedText(latest.WSPD) : '--';
  el('now-unit').textContent = currentUnit().unit;
  el('now-name').textContent = latest ? windName(latest.WDIR) : 'Sense dades';
  el('now-ago').textContent = latest ? timeFromNow(latest.date) : '';
  el('now-date').textContent = latest ? latest.date.toISOString().substring(0,16) + 'Z' : '';
}

const STATUS_TEXT = { loading: 'Comprovant…', ok: 'OK', nodata: 'No té dades', offline: 'Offline', skipped: 'No consultat' };
const STATUS_CLASS = { loading: '', ok: 'status-ok', nodata: 'status-warn', offline: 'status-error', skipped: '' };

// Where each line's data actually comes from, so the label can link to it
const STATUS_LINK = {
  int: ERDDAP.int + '/index.html',
  ext: ERDDAP.ext + '/index.html',
  repo: 'https://github.com/ICATMAR/data',
  forecast: 'https://openweathermap.org/api',
};

function renderStatus() {
  const minutes = Math.max(0, Math.ceil((nextBuoyFetch - Date.now()) / MINUTE));
  const line = (label, key) =>
    `<div><a href="${STATUS_LINK[key]}" target="_blank" rel="noopener">${label}</a>: `
    + `<span class="${STATUS_CLASS[status[key]]}">${STATUS_TEXT[status[key]]}</span></div>`;
  el('status').innerHTML =
    `<div>Propera actualització en ${minutes} min</div>`
    + line('ERDDAP Intern', 'int')
    + line('ERDDAP Extern', 'ext')
    + line('Repositori', 'repo')
    + line('Previsió', 'forecast');
}

// The animation toggle and, while it is on, how long until the view flips
function renderControls() {
  el('unit-value').textContent = currentUnit().unit;
  el('animation-toggle').textContent = `Animació ${animationOn ? 'On' : 'Off'}`;
  const seconds = Math.max(0, Math.ceil((nextViewSwap - Date.now()) / 1000));
  el('next-view').textContent = animationOn
    ? `${futureView ? 'Dades boia' : 'Previsió'} en ${seconds} s`
    : '';
}

function render() {
  const geometry = layout();
  timeLabels = [];
  renderPast(geometry);
  renderForecast(geometry);
  renderCompass();
  renderNow();
  renderStatus();
  renderControls();
}

function setMessage(text) {
  el('loading-message').textContent = text;
}

function setView(future) {
  futureView = future;
  el('stage').classList.toggle('future', future);
  // The two views reach out to very different radii, so a pan that made sense
  // in one is meaningless in the other - it eases back with the rest.
  setPan(0, 0);
  nextViewSwap = Date.now() + VIEW_INTERVAL;
  renderControls();
}

// ----------------------------------------------------------------- MAIN LOOP

// Refreshes everything that only depends on the clock, so "fa 25 min" and the
// countdown stay right without rebuilding the rings.
function updateClock() {
  timeLabels.forEach(({ el: label, date, coarse }) => { label.textContent = timeFromNow(date, coarse); });
  const latest = latestEntry();
  if (latest) el('now-ago').textContent = timeFromNow(latest.date);
  renderStatus();
  renderControls();
}

// Everything time-driven runs from here: the two refetch timers, the view
// swap, and the once-a-second clock refresh.
function tick() {
  requestAnimationFrame(tick);
  const now = Date.now();

  if (now >= nextBuoyFetch) {
    nextBuoyFetch = now + BUOY_INTERVAL; // hold the slot while the fetch runs
    refreshBuoyData();
  }
  if (now >= nextForecastFetch) {
    nextForecastFetch = now + FORECAST_INTERVAL;
    loadForecastData().then(render);
  }
  if (animationOn && now >= nextViewSwap) setView(!futureView);

  const second = Math.floor(now / 1000);
  if (second !== lastTick) {
    lastTick = second;
    updateClock();
  }
}

// Dragging the stage around, for the windows too small to fit every ring.
// A drag that barely moved is left alone so it still reads as a click on
// whatever was under the pointer (the centre ring, the unit).
const DRAG_THRESHOLD = 6; // px

function setupPan() {
  const stage = el('stage');
  let startX = 0, startY = 0, fromX = 0, fromY = 0, moved = 0, dragging = false;

  stage.addEventListener('pointerdown', e => {
    moved = 0; // before the guard, so a stale drag never eats the next click
    if (!stage.classList.contains('pannable')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    fromX = panX; fromY = panY;
    stage.classList.add('dragging');
  });

  // On the window, and deliberately WITHOUT setPointerCapture: capturing the
  // pointer also retargets the click that follows it to the capturing element,
  // which left nothing in the centre clickable - neither the unit toggle nor
  // the view switch - on every window small enough to be pannable. Listening
  // here instead still tracks a drag that leaves the stage.
  window.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
    setPan(fromX + dx, fromY + dy);
  });

  const end = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // Capture phase, so a real drag is swallowed before it reaches the centre
  // ring or the panel and flips the view by accident.
  stage.addEventListener('click', e => {
    if (moved > DRAG_THRESHOLD) e.stopPropagation();
  }, true);
}

// The buoy's position, and the about panel behind the top-right button
function setupInfo() {
  const coords = `${LATITUDE}, ${LONGITUDE}`;
  el('coords').textContent = coords;

  let feedbackTimer;
  el('copy-coords').addEventListener('click', async () => {
    let message;
    try {
      await navigator.clipboard.writeText(coords);
      message = 'Copiat!';
    } catch (e) {
      // Needs a secure context; on http:// there is nothing sensible to fall
      // back to, so say so rather than failing silently.
      console.error('Could not copy the coordinates', e);
      message = 'No s\'ha pogut copiar';
    }
    el('copy-feedback').textContent = message;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { el('copy-feedback').textContent = ''; }, 2000);
  });

  // The contact addresses live in the page as a user/host pair and are only
  // joined up here, so neither the full address nor a mailto: appears in the
  // HTML for an address scraper to pick up.
  document.querySelectorAll('a.email').forEach(link => {
    const address = link.dataset.user + String.fromCharCode(64) + link.dataset.host;
    link.textContent = address;
    link.href = 'mailto:' + address;
  });

  const about = el('about');
  const setAbout = open => { about.hidden = !open; };
  el('info-button').addEventListener('click', () => setAbout(true));
  el('about-close').addEventListener('click', () => setAbout(false));
  // Clicking the backdrop, but not the panel itself
  about.addEventListener('click', e => { if (e.target === about) setAbout(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setAbout(false); });
}

async function start() {
  setupInfo();

  el('unit-toggle').addEventListener('click', () => {
    unitIndex = (unitIndex + 1) % UNITS.length;
    render();
  });

  // The centre is the view switch: the now-ring opens the forecast, and the
  // panel - wherever it currently sits - toggles back and forth.
  el('now-ring').addEventListener('click', () => setView(true));
  el('now-panel').addEventListener('click', () => setView(!futureView));

  el('animation-toggle').addEventListener('click', () => {
    animationOn = !animationOn;
    nextViewSwap = Date.now() + VIEW_INTERVAL;
    renderControls();
  });

  setupPan();
  // Ring spacing, whether they overflow, and the pan limits all follow the
  // window size
  window.addEventListener('resize', render);

  const hasBuoyData = await loadBuoyData();
  setMessage(hasBuoyData ? MESSAGES.forecast : MESSAGES.forecastOnly);
  await loadForecastData();

  render();
  el('loading').classList.add('done');
  // The rings start collapsed (see #stage.hidden) and expand into place on the
  // first frame after the loading screen fades.
  requestAnimationFrame(() => el('stage').classList.remove('hidden'));

  nextViewSwap = Date.now() + VIEW_INTERVAL;
  tick();
}

start();

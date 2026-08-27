import Source from './Source.js';

// Discovers every buoy/sensor under datasetCommonKey on one ERDDAP server -
// same discovery logic as VISOC's SourceErddapBuoys (dataset IDs follow
// datasetCommonKey + <buoyName> + '_' + <sensorId>, e.g. BUOY_SOMO_METEO).
// Extended here to also fetch actual observation data (VISOC's version is
// metadata/discovery only), scoped to buoyId so this app - dedicated to one
// buoy - doesn't pull data for every other buoy the server happens to host.

const PROXY_URL = 'https://api.icatmar.cat/proxy/';
const DAYS_LOADED = 3;
// ERDDAP columns that are coordinates/dimensions, not sensor readings - never
// auto-fetched as a data variable.
const NON_DATA_COLUMNS = ['time', 'latitude', 'longitude', 'station_id', 'depth'];

// Earliest start and latest end among a list of entries (sensors or buoys -
// both carry startDate/endDate), shared by dateRange() and per-buoy dates.
function dateRangeOf(entries) {
  const startDates = entries.map(e => e.startDate).filter(Boolean);
  const endDates = entries.map(e => e.endDate).filter(Boolean);
  return {
    startDate: startDates.length ? new Date(Math.min(...startDates)) : undefined,
    endDate: endDates.length ? new Date(Math.max(...endDates)) : undefined,
  };
}

class SourceErddapBuoys extends Source {

  constructor({ fetchManager, src, datasetCommonKey, buoyId, mapping, sensorConstraints }) {
    super({ fetchManager });
    this.src = src;
    this.baseUrl = src.replace(/\/index\.html$/, '');
    this.datasetCommonKey = datasetCommonKey;
    // Discovery (this.buoys) still covers every buoy under datasetCommonKey,
    // same as VISOC - buoyId only limits which one's sensors also get their
    // observation data fetched.
    this.buoyId = buoyId;
    // Raw ERDDAP name -> { code, direction, unitTransform }. A name not
    // listed here keeps its raw name as its standard code, unchanged - only
    // rename, flag a direction, or convert units when the source isn't
    // already standard. 'sensorId.rawName' disambiguates two sensors sharing
    // a raw name (e.g. CTD and SAMI both report 'TEMP').
    this.mapping = mapping || {};
    // { sensorId: extra ERDDAP query string }, e.g. ADCP's depth selection
    this.sensorConstraints = sensorConstraints || {};

    // Array of buoys. Inside each buoy object: id, array of sensors (metadata,
    // variables, rows...), lat-long, institution, acknowledgement
    this.buoys = [];
    this.error = undefined; // set if discovery itself fails outright

    this.loadingPromise = this.load().catch(error => {
      this.error = error;
      console.error(`Could not load ${src}`, error);
    });
  }

  proxied(url) {
    return PROXY_URL + '?url=' + encodeURIComponent(url);
  }

  // Same discovery as VISOC's SourceErddapBuoys, then also fetches actual
  // observation data for buoyId's sensors (every buoy's, if buoyId is unset).
  async load() {
    const allDatasets = await this.fetchAllDatasets();
    const buoyDatasets = allDatasets.filter(d => d['datasetID'].startsWith(this.datasetCommonKey));

    // Fetch every sensor's info in parallel, but only group them into buoys
    // afterward, synchronously - doing the grouping inside the parallel map
    // risks two sensors of the same buoy both seeing no entry yet and each
    // creating their own, instead of sharing one.
    const sensorEntries = await Promise.all(buoyDatasets.map(async d => {
      const dataset = d['datasetID'];
      const withoutPrefix = dataset.slice(this.datasetCommonKey.length);
      const lastUnderscore = withoutPrefix.lastIndexOf('_');
      const name = withoutPrefix.slice(0, lastUnderscore); // buoy id, e.g. 'SOMO'
      const sensorId = withoutPrefix.slice(lastUnderscore + 1); // e.g. 'METEO'

      const infoUrl = `${this.baseUrl}/info/${dataset}/index.jsonlKVP`;
      const infoText = await this.fetchManager.fetch(this.proxied(infoUrl)).then(res => res.text());
      const { variables, metadata } = this.parseERDDAPMetadata(infoText);

      const sensor = {
        id: sensorId,
        dataset,
        variables,
        metadata,
        rows: [], // filled by loadSensorData(), only for the buoy(s) this source actually loads
        startDate: metadata['time_coverage_start'] ? new Date(metadata['time_coverage_start']) : undefined,
        endDate: metadata['time_coverage_end'] ? new Date(metadata['time_coverage_end']) : undefined,
      };

      return { name, sensor };
    }));

    const buoysByName = new Map();
    sensorEntries.forEach(({ name, sensor }) => {
      if (!buoysByName.has(name)) {
        // lat/long, institution, acknowledgement and license are per-dataset
        // NC_GLOBAL attributes, but are expected to be the same across every
        // sensor of a buoy - taken from whichever sensor is processed first.
        const { metadata } = sensor;
        buoysByName.set(name, {
          id: name,
          sensors: [],
          latitude: metadata['nominal_latitude'] ? Number(metadata['nominal_latitude']) : undefined,
          longitude: metadata['nominal_longitude'] ? Number(metadata['nominal_longitude']) : undefined,
          institution: metadata['institution'],
          acknowledgement: metadata['acknowledgement'],
          license: metadata['license'],
        });
      }
      buoysByName.get(name).sensors.push(sensor);
    });

    // Each buoy's own startDate/endDate - earliest/latest among its sensors.
    this.buoys = [...buoysByName.values()].map(buoy => ({ ...buoy, ...dateRangeOf(buoy.sensors) }));

    const { startDate, endDate } = this.dateRange();
    this.startDate = startDate;
    this.endDate = endDate;

    // Fetch actual observation data, scoped to buoyId if given.
    const buoysToLoad = this.buoyId ? this.buoys.filter(b => b.id === this.buoyId) : this.buoys;
    await Promise.all(buoysToLoad.flatMap(buoy => buoy.sensors.map(sensor => this.loadSensorData(sensor))));
  }

  // ERDDAP's allDatasets lists every dataset on the server with its time range.
  // Cached by FetchManager, so every source on the same server shares the one request.
  async fetchAllDatasets() {
    const url = `${this.baseUrl}/tabledap/allDatasets.jsonlKVP`;
    const text = await this.fetchManager.fetch(this.proxied(url), 10).then(res => res.text());
    return text.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
  }

  // Earliest start and latest end across every buoy/sensor - each may have
  // started/stopped reporting at a different time.
  dateRange() {
    return dateRangeOf(this.buoys.flatMap(buoy => buoy.sensors));
  }

  // The buoy this source actually loads data for (buoyId, or the first
  // discovered one if unset)
  get buoy() {
    return this.buoys.find(b => b.id === this.buoyId) || this.buoys[0];
  }

  // Standard code + direction/unitTransform for a sensor's raw column - a
  // sensor-qualified override ('sensorId.rawName') wins over a flat one,
  // which wins over just keeping the raw name unchanged (see this.mapping).
  mappingFor(sensorId, rawName) {
    return this.mapping[`${sensorId}.${rawName}`] || this.mapping[rawName] || { code: rawName };
  }

  // The last DAYS_LOADED days of one sensor's data, ending at its own maxTime
  // rather than at "now" - a sensor can lag by days, and anchoring on the
  // latest available data is what keeps the timeline and the wind rose
  // showing something instead of an empty range. Every numeric variable
  // ERDDAP lists for this sensor is fetched, except coordinates.
  async loadSensorData(sensor) {
    try {
      const rawNames = Object.keys(sensor.variables)
        .filter(name => !NON_DATA_COLUMNS.includes(name))
        .filter(name => ['float', 'double'].includes(sensor.variables[name].dataType));
      if (rawNames.length == 0 || !sensor.endDate) return;

      // Standard code (+ direction/unitTransform) per raw column, resolved once
      sensor.codes = {}; // { code: { rawName, direction, unitTransform } }
      rawNames.forEach(rawName => {
        const mapped = this.mappingFor(sensor.id, rawName);
        sensor.codes[mapped.code] = { rawName, direction: mapped.direction, unitTransform: mapped.unitTransform };
      });

      const startDate = new Date(sensor.endDate.getTime() - DAYS_LOADED * 24 * 3600 * 1000);
      const constraint = this.sensorConstraints[sensor.id] || '';
      const url = `${this.baseUrl}/tabledap/${sensor.dataset}.csv?time,${rawNames.join(',')}`
        + `&time>=${startDate.toISOString()}${constraint}`;

      const text = await this.fetchManager.fetch(this.proxied(url), 10)
        .then(res => res.text())
        .catch(error => {
          // ERDDAP returns 404 (not 200 + empty body) when a query matches zero
          // rows - that means no recent data, not a failed request.
          if (error.name === 'HTTPError' && error.status === 404) return null;
          throw error;
        });
      sensor.rows = text == null ? [] : this.parseCSV(text, rawNames, sensor.codes);
    } catch (error) {
      console.error(`Could not load data for ${sensor.dataset}`, error);
    }
  }

  // ERDDAP CSV: line 1 = column names, line 2 = units, then rows. Missing
  // values come as NaN and are dropped so they don't count as data. Columns
  // are keyed by their standard code (see sensor.codes / mappingFor).
  parseCSV(text, rawNames, codes) {
    const rawToCode = {};
    Object.entries(codes).forEach(([code, meta]) => { rawToCode[meta.rawName] = { code, unitTransform: meta.unitTransform }; });

    const lines = text.trim().split('\n');
    return lines.slice(2).map(line => {
      const cells = line.split(',');
      const values = {};
      rawNames.forEach((rawName, i) => {
        const raw = parseFloat(cells[i + 1]); // cell 0 is time
        if (isNaN(raw)) return;
        const { code, unitTransform } = rawToCode[rawName];
        values[code] = unitTransform ? unitTransform(raw) : raw;
      });
      return { date: new Date(cells[0]), values };
    });
  }

  // Which sensor (of the loaded buoy) declares a standard code, and that
  // sensor's rows + direction flag - undefined if none of them do.
  findSensorFor(code) {
    if (!this.buoy) return undefined;
    for (const sensor of this.buoy.sensors) {
      const meta = sensor.codes?.[code];
      if (meta) return { rows: sensor.rows, variable: meta };
    }
    return undefined;
  }

  // Most recent row that has a value for the code, or undefined
  latestRow(code) {
    const found = this.findSensorFor(code);
    if (!found) return undefined;
    const { rows } = found;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].values[code] != undefined) return rows[i];
    }
    return undefined;
  }

  // Most recent timestamp across the loaded buoy's sensors
  get latestDate() {
    if (!this.buoy) return undefined;
    const dates = this.buoy.sensors.map(s => s.rows[s.rows.length - 1]?.date).filter(Boolean);
    return dates.length ? new Date(Math.max(...dates)) : undefined;
  }

  // Whether any of the loaded buoy's sensors actually returned rows
  get hasData() {
    return this.buoy ? this.buoy.sensors.some(s => s.rows.length > 0) : false;
  }

  // Mean of the 15-minute samples inside [date, date + intervalMinutes),
  // circular for directions (e.g. 350º and 10º must average to 0º, not 180º).
  async getValueAt(code, date, intervalMinutes) {
    await this.loadingPromise;

    const found = this.findSensorFor(code);
    if (!found) return undefined;
    const { rows, variable } = found;

    const from = date.getTime();
    const to = from + intervalMinutes * 60 * 1000;
    const samples = rows
      .filter(row => row.date.getTime() >= from && row.date.getTime() < to)
      .map(row => row.values[code])
      .filter(value => value != undefined);

    if (samples.length == 0) return undefined;
    if (!variable.direction) return samples.reduce((a, b) => a + b, 0) / samples.length;

    const sin = samples.reduce((sum, deg) => sum + Math.sin(deg * Math.PI / 180), 0);
    const cos = samples.reduce((sum, deg) => sum + Math.cos(deg * Math.PI / 180), 0);
    return Math.atan2(sin, cos) * 180 / Math.PI;
  }

}

export default SourceErddapBuoys;

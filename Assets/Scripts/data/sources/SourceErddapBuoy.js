import Source from './Source.js';

// One sensor of the Somorrostro buoy (BUOY_SOMO_<sensor>) on one ERDDAP server.
// Neither ERDDAP sends CORS headers, so every request goes through the ICATMAR
// proxy, as in VISOC's SourceErddap.

const PROXY_URL = 'https://api.icatmar.cat/proxy/';
const DAYS_LOADED = 3;

class SourceErddapBuoy extends Source {

  constructor({ fetchManager, src, dataset, mapping }) {
    super({ fetchManager });
    this.src = src;
    this.baseUrl = src.replace(/\/index\.html$/, ''); // remove index.html from src
    this.dataset = dataset;
    this.mapping = mapping; // { standardCode: { source: ERDDAP variable name, direction } }

    this.rows = []; // [{ date, values: { standardCode: number } }], oldest first
    this.error = undefined; // set if load() fails outright (network/HTTP/timeout - not "no rows")

    this.loadingPromise = this.load().catch(error => {
      this.error = error;
      console.error(`Could not load ${dataset} from ${src}`, error);
    });
  }

  proxied(url) {
    return PROXY_URL + '?url=' + encodeURIComponent(url);
  }

  // The last DAYS_LOADED days of data. The window ends at the dataset's own
  // maxTime rather than at "now" - the buoy can lag by days, and anchoring on
  // the latest available data is what keeps the timeline and the wind rose
  // showing something instead of an empty range.
  async load() {
    const allDatasets = await this.fetchAllDatasets();
    const datasetInfo = allDatasets.find(d => d['datasetID'] === this.dataset);
    if (!datasetInfo) throw new Error(`Dataset '${this.dataset}' not found in ERDDAP source '${this.src}'`);

    this.endDate = new Date(datasetInfo['maxTime']);
    this.startDate = new Date(this.endDate.getTime() - DAYS_LOADED * 24 * 3600 * 1000);

    const columns = Object.keys(this.mapping);
    const variables = columns.map(code => this.mapping[code].source);
    const url = `${this.baseUrl}/tabledap/${this.dataset}.csv?time,${variables.join(',')}`
      + `&time>=${this.startDate.toISOString()}`;

    const text = await this.fetchManager.fetch(this.proxied(url), 10)
      .then(res => res.text())
      .catch(error => {
        // ERDDAP returns 404 (not 200 + empty body) when a query matches zero
        // rows - that means no recent data, not a failed request.
        if (error.name === 'HTTPError' && error.status === 404) return null;
        throw error;
      });
    this.rows = text == null ? [] : this.parseCSV(text, columns);
  }

  // ERDDAP's allDatasets lists every dataset on the server with its time range.
  // Cached by FetchManager, so both sensors of a server share the one request.
  async fetchAllDatasets() {
    const url = `${this.baseUrl}/tabledap/allDatasets.jsonlKVP`;
    const text = await this.fetchManager.fetch(this.proxied(url), 10).then(res => res.text());
    return text.trim().split('\n').filter(line => line).map(line => JSON.parse(line));
  }

  // ERDDAP CSV: line 1 = column names, line 2 = units, then rows. Missing
  // values come as NaN and are dropped so they don't count as data.
  parseCSV(text, columns) {
    const lines = text.trim().split('\n');
    return lines.slice(2).map(line => {
      const cells = line.split(',');
      const values = {};
      columns.forEach((code, i) => {
        const value = parseFloat(cells[i + 1]); // cell 0 is time
        if (!isNaN(value)) values[code] = value;
      });
      return { date: new Date(cells[0]), values };
    });
  }

  // Most recent row that has a value for the code, or undefined
  latestRow(code) {
    for (let i = this.rows.length - 1; i >= 0; i--) {
      if (this.rows[i].values[code] != undefined) return this.rows[i];
    }
    return undefined;
  }

  // Mean of the 15-minute samples inside [date, date + intervalMinutes),
  // circular for directions (e.g. 350º and 10º must average to 0º, not 180º).
  async getValueAt(code, date, intervalMinutes) {
    await this.loadingPromise;

    const variable = this.mapping[code];
    if (variable == undefined) return undefined;

    const from = date.getTime();
    const to = from + intervalMinutes * 60 * 1000;
    const samples = this.rows
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

export default SourceErddapBuoy;

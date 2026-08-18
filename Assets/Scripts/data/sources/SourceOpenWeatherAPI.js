import Source from './Source.js';

// 5 day / 3 hour atmospheric forecast, proxied by ICATMAR
// https://openweathermap.org/forecast5

const HALF_STEP_MS = 90 * 60 * 1000; // forecast entries are 3 hours apart


class SourceOpenWeatherAPI extends Source {

  constructor({ fetchManager, src, mapping }) {
    super({ fetchManager });
    this.src = src;
    this.mapping = mapping; // { standardCode: { source: path inside a forecast entry } }
    // Buoy location, set as a global in main.js
    this.lat = window.LATITUDE;
    this.lon = window.LONGITUDE;

    this.loadingPromise = this.load().catch(error => console.error('Could not load the OpenWeather forecast', error));
  }

  // Fetches the whole forecast once and keeps every entry with its date
  async load() {
    const url = `${this.src}?lat=${this.lat}&lon=${this.lon}`;
    const json = await this.fetchManager.fetch(url, 30).then(res => res.json());

    this.data = json.list.map(entry => ({ date: new Date(entry.dt * 1000), entry }));
    this.startDate = this.data[0].date;
    this.endDate = this.data[this.data.length - 1].date;
  }

  // Closest forecast entry to the date, or undefined if the date falls outside
  // the forecast (the API only returns future values)
  async getValueAt(code, date) {
    await this.loadingPromise;
    if (this.data == undefined) return undefined; // the forecast could not be loaded

    const variable = this.mapping[code];
    if (variable == undefined) return undefined;

    const closest = this.data.reduce((best, row) =>
      Math.abs(row.date - date) < Math.abs(best.date - date) ? row : best, this.data[0]);
    if (Math.abs(closest.date - date) > HALF_STEP_MS) return undefined;

    return variable.source.split('.').reduce((obj, key) => obj?.[key], closest.entry);
  }

}

export default SourceOpenWeatherAPI;

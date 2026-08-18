import Source from './Source.js';

// Point values from the CMEMS WMTS layers, read from the tile that covers the
// buoy (see Assets/Scripts/WMTS/WMTSDataRetriever.js). CMEMS only publishes
// hourly layers, so coarser timeline cells are built by averaging hourly samples.


class SourceCMEMS extends Source {

  constructor({ fetchManager, mapping }) {
    super({ fetchManager });
    this.mapping = mapping; // { standardCode: { layer, direction } }
    // Closest CMEMS grid point to the buoy, set as a global in main.js
    this.lat = window.CMEMS_LATITUDE;
    this.lon = window.CMEMS_LONGITUDE;

    this.retriever = window.WMTSDataRetriever;
    this.loadingPromise = window.WMTSDataRetrieverLoaded; // GetCapabilities of every product
  }

  // Single hourly WMTS tile request. Resolves to undefined if the layer has no
  // data on that date (or the request fails), so the timeline shows an empty cell.
  getHourlyValue(variable, date) {
    return this.retriever
      .getDataAtPoint(variable.layer, date.toISOString(), this.lat, this.lon, 'h', variable.direction)
      .catch(() => undefined);
  }

  // Value covering intervalMinutes: a single hourly sample, or the mean of
  // every hour inside the interval (circular mean for directions).
  async getValueAt(code, date, intervalMinutes) {
    await this.loadingPromise;

    const variable = this.mapping[code];
    if (variable == undefined) return undefined;

    const hours = Math.max(1, Math.round(intervalMinutes / 60));
    const samples = [];
    for (let h = 0; h < hours; h++) {
      const value = await this.getHourlyValue(variable, new Date(date.getTime() + h * 3600000));
      if (value != undefined) samples.push(value);
    }
    if (samples.length == 0) return undefined;
    if (!variable.direction) return samples.reduce((a, b) => a + b, 0) / samples.length;

    // Circular mean: directions can't be averaged directly (e.g. 350º and 10º would cancel out)
    const sin = samples.reduce((sum, deg) => sum + Math.sin(deg * Math.PI / 180), 0);
    const cos = samples.reduce((sum, deg) => sum + Math.cos(deg * Math.PI / 180), 0);
    return Math.atan2(sin, cos) * 180 / Math.PI;
  }

}

export default SourceCMEMS;

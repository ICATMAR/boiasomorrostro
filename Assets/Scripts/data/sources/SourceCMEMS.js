import Source from './Source.js';

// Point values from the CMEMS WMTS layers, read from the tile that covers the
// buoy (see Assets/Scripts/WMTS/WMTSDataRetriever.js)


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

  // One WMTS tile request per variable and date. Layers that have no data on
  // that date (or fail) resolve to undefined so the timeline shows an empty cell.
  async getValueAt(code, date, timeScale) {
    await this.loadingPromise;

    const variable = this.mapping[code];
    if (variable == undefined) return undefined;

    return this.retriever
      .getDataAtPoint(variable.layer, date.toISOString(), this.lat, this.lon, timeScale, variable.direction)
      .catch(() => undefined);
  }

}

export default SourceCMEMS;

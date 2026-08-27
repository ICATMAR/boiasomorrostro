import DP from './DataProduct.js';

// Observations from the Somorrostro buoy. The same sensors are published on
// two ERDDAP servers that do not always update at the same time, so every
// lookup takes whichever source is ahead instead of trusting a single one.
class DPBuoys extends DP {

  // Latest row across both servers for a code, plus the source it came from
  latestRow(code) {
    let latest;
    this.sources.forEach(source => {
      const row = source.latestRow(code);
      if (row && (latest == undefined || row.date > latest.date)) latest = row;
    });
    return latest;
  }

  // Most recent timestamp any source has data for - anchors the observations
  // timeline and the wind rose
  get latestDate() {
    const dates = this.sources.map(s => s.latestDate).filter(Boolean);
    return dates.length ? new Date(Math.max(...dates)) : undefined;
  }

  // 'ok' if any source has data, 'error' if every source failed outright
  // (network/HTTP/timeout), 'empty' if they all loaded fine but found nothing
  // in the requested window. Only meaningful after ready() resolves.
  get status() {
    if (this.sources.some(s => s.hasData)) return 'ok';
    if (this.sources.length && this.sources.every(s => s.error)) return 'error';
    return 'empty';
  }

  // Every source's load error, for the status message to explain what went wrong
  get errors() {
    return this.sources.map(s => s.error).filter(Boolean);
  }

}

export default DPBuoys;

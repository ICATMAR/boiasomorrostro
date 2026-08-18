class Source {

  constructor({ fetchManager }) {
    this.fetchManager = fetchManager;

    this.variables = undefined; // { standardCode: rawName }, declared by each source
    this.startDate = undefined; // Date, first timestamp the source can serve
    this.endDate = undefined;   // Date, last timestamp the source can serve
  }

  // Subclasses implement: fetch (if not already loaded) and return the value of a
  // standard variable code at the given date, or undefined if there is no data.
  // intervalMinutes is the width of the timeline cell the value is shown in
  // (a source may average finer samples to cover it). Standardizing (raw
  // name/unit -> standard code) is the source's job, so the DataProduct above
  // only deals with standard codes.
  async getValueAt(code, date, intervalMinutes) { throw new Error('getValueAt() not implemented'); }

}


export default Source;

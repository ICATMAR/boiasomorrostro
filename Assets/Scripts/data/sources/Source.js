class Source {

  constructor({ fetchManager }) {
    this.fetchManager = fetchManager;

    this.variables = undefined; // { standardCode: rawName }, declared by each source
    this.startDate = undefined; // Date, first timestamp the source can serve
    this.endDate = undefined;   // Date, last timestamp the source can serve
  }

  // Subclasses implement: fetch (if not already loaded) and return the value of a
  // standard variable code at the given date, or undefined if there is no data.
  // Standardizing (raw name/unit -> standard code) is the source's job, so the
  // DataProduct above only deals with standard codes.
  async getValueAt(code, date, timeScale) { throw new Error('getValueAt() not implemented'); }

}


export default Source;

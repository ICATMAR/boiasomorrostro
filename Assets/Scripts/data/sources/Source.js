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

  // Parses ERDDAP's info/dataset metadata format (jsonlKVP: one JSON object
  // per line, each declaring a variable + its data type, or an attribute on a
  // variable / on NC_GLOBAL for dataset-level metadata). Shared by any source
  // that reads this format. Same as VISOC's Source.js, so ERDDAP-based sources
  // can be copied between the two repositories unchanged.
  parseERDDAPMetadata(text) {
    const rows = text.trim().split('\n').filter(line => line).map(line => JSON.parse(line));

    const variables = {};
    const metadata = {};

    rows.forEach(row => {
      const varName = row['Variable Name'];
      const attrName = row['Attribute Name'];
      const value = row['Value'];

      if (varName === 'NC_GLOBAL') {
        if (attrName) metadata[attrName] = value;
        return;
      }

      if (!variables[varName]) variables[varName] = {};
      if (row['Row Type'] === 'variable') variables[varName].dataType = row['Data Type'];
      else if (attrName) variables[varName][attrName] = value;
    });

    return { variables, metadata };
  }

}


export default Source;

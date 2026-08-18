class DataProduct {

  constructor(catalogueDP, fetchManager) {
    this.fetchManager = fetchManager; // kept for subclasses' own supplementary fetches, beyond their configured sources
    this.name = catalogueDP.name;
    this.description = catalogueDP.description;
    this.type = catalogueDP.type;
    this.link = catalogueDP.link;
    this.variables = catalogueDP.variables; // rows shown in the data timeline

    this.sources = catalogueDP.sources.map(src => {
      const source = new src.Class({ fetchManager, ...src });
      source.institution = src.institution;
      return source;
    });

    console.log(`${this.constructor.name}: sources loaded`, this.sources);
  }

  // Value of a standard variable code at a date, from the first source that has it
  async getValueAt(code, date, intervalMinutes) {
    for (const source of this.sources) {
      const value = await source.getValueAt(code, date, intervalMinutes).catch(error => {
        console.error(`${this.name}: could not read ${code} on ${date.toISOString()}`, error);
        return undefined;
      });
      if (value != undefined) return value;
    }
    return undefined;
  }

}

export default DataProduct;

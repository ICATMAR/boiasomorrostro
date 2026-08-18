import Catalogue from './products/Catalogue.js';

class DataService {

  constructor(FetchManager) {
    this.catalogue = Catalogue;

    const openWeather = Catalogue.find(p => p.name === 'Open Weather API');
    this.openWeather = new openWeather.Class(openWeather, FetchManager);

    const cmems = Catalogue.find(p => p.name === 'Copernicus Marine Service');
    this.cmems = new cmems.Class(cmems, FetchManager);

    this.dataProducts = [
      { name: openWeather.name, product: this.openWeather },
      { name: cmems.name, product: this.cmems },
    ];
  }

}


export default DataService;

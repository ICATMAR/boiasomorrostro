

// This class is used to aggregate data from multiple sources
// It is used to store the data and provide methods to access it
import VariableDefinitions from './VariableDefinitions.js';


class DataAggregator {

  cachedData = {};




  constructor() {
    this.variables = VariableDefinitions;

  }



  async getValue(variableName, timestamp, latitude, longitude) {

    let lat = latitude || window.LATITUDE; // IN CMEMS SOURCE OTHER COORDINATES ARE USED
    let lon = longitude || window.LONGITUDE;
    let requestedDate = new Date(timestamp);

    // Check if the variable exists
    const variable = this.variables.find(variable => variable.name === variableName || variable.altNames.includes(variableName));
    if (variable == undefined) {
      console.error(`Variable ${variableName} not found`);
      return undefined;
    }

    // Check sources
    const sources = variable.sources;
    for (let i = 0; i < sources.length; i++) {
      let source = sources[i];
      // OPENWEATHER
      if (source.name == 'openweather') {
        // Get the data from openweather
        return this.getOpenWeatherData(lat, lon).then(data => { // TODO: if no data, continue with next source
          // Check if the timestamp is in the data
          let pastTimeLimit = 1000 * 60 * 60 * 3; // 3 hours
          if (requestedDate < new Date(data.list[0].dt * 1000 - pastTimeLimit)) {
            console.warn('OpenWeather only provides forecast data. No data available for this timestamp');
            return undefined; // TODO: use alternative source
          }

          // Find the closest timestamp
          let selIndex = undefined;
          for (let j = 0; j < data.list.length - 1; j++) {
            let prevDate = new Date(data.list[j].dt * 1000);
            let nextDate = new Date(data.list[j + 1].dt * 1000);
            if (requestedDate >= prevDate && requestedDate < nextDate || requestedDate < prevDate) {
              if (requestedDate.getTime() - prevDate.getTime() < nextDate.getTime() - requestedDate.getTime()) {
                selIndex = j;
              }
              else
                selIndex = j + 1;
              break;
            }
          }

          // Get value
          // The key is the path to the value in the data object
          // Example: 'wind.speed' => data.list[selIndex].wind.speed
          let value = source.key.split('.').reduce((obj, key) => obj[key], data.list[selIndex]);
          // Transform units
          if (source.unitTransformFunc) {
            value = source.unitTransformFunc(value);
          }
          return value;
        });
      }
      // CMEMS
      else if (source.name == 'cmems') {
        // Get the data from cmems
        let promises = [];
        let waveParameters = {};
        source.layers.forEach(layer => {
          promises.push(window.WMTSDataRetriever.getDataAtPoint(layer, requestedDate.toISOString(), window.CMEMS_LATITUDE, window.CMEMS_LONGITUDE, 'h', false));
          waveParameters[layer] = undefined;
        });

        return Promise.allSettled(promises).then(data => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].status == 'fulfilled') {
              let layer = source.layers[i];
              waveParameters[layer] = data[i].value;
            }
          }
          return waveParameters;
        }).catch(error => {
          console.error('Error fetching data:', error);
        });

      }
      // TODO: if source is not openweather, get the data from the source
    }

  }





  getOpenWeatherData(lat, lon) {
    // Hourly request key
    let requestKey = 'openweather' + lat + lon + new Date().toISOString().substring(0, 13);
    // Check if the data is already cached
    if (this.cachedData[requestKey]) {
      return new Promise((resolve) => {
        resolve(this.cachedData[requestKey]);
      });
    }

    // If not cached, fetch the data
    // Get data from OpenWeather API
    return fetch('https://api.icatmar.cat/openWeatherAPI?lat=' + lat + '&lon=' + lon)
      .then(response => response.json())
      .then(data => {
        // Cache the data
        this.cachedData[requestKey] = data;
        return data;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }

}

export default DataAggregator; 

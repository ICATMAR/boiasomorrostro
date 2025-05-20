

// This class is used to aggregate data from multiple sources
// It is used to store the data and provide methods to access it

class DataAggregator {

  cachedData = {};

  variables = [
    // Wind speed
    {
      name: 'wind speed',
      altNames: ['WSPD', 'wind', 'wind velocity', 'wind velocity'],
      sources: [{
        name: 'openweather',
        key: 'wind.speed',
        unitTransformFunc: (value) => value * 3.6, // From m/s to km/h
        // Request is only forecast or now. It returns 3h-5day list. Script must find the closest one.
      }],
    },
    // Wind direction
    {
      name: 'wind direction',
      altNames: ['WDIR', 'wind direction', 'wind dir'],
      sources: [{
        name: 'openweather',
        key: 'wind.deg',
        // Request is only forecast or now. It returns 3h-5day list. Script must find the closest one.
      }],
    },
  ];


  constructor() {



  }



  async getValue(variableName, timestamp, latitude, longitude) {

    let lat = latitude || window.LATITUDE;
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
      if (source.name == 'openweather') {
        // Get the data from openweather
        return this.getOpenWeatherData(lat, lon).then(data => { // TODO: if no data, continue with next source
          // Check if the timestamp is in the data
          let pastTimeLimit = 1000 * 60 * 60 * 3; // 3 hours
          if (requestedDate < new Date(data.list[0].dt * 10000 - pastTimeLimit)) {
            console.warn('OpenWeather only provides forecast data. No data available for this timestamp');
            return undefined; // TODO: use alternative source
          }

          // Find the closest timestamp
          let selIndex = undefined;
          for (let j = 0; j < data.list.length - 1; j++) {
            let prevDate = new Date(data.list[j].dt * 10000);
            let nextDate = new Date(data.list[j + 1].dt * 10000);
            if (requestedDate >= prevDate && requestedDate < nextDate) {
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

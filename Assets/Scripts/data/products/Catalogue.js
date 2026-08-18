import SourceOpenWeatherAPI from '../sources/SourceOpenWeatherAPI.js';
import SourceCMEMS from '../sources/SourceCMEMS.js';

import DPOpenWeatherAPI from './DPOpenWeatherAPI.js';
import DPCMEMS from './DPCMEMS.js';


// Data products
// variables -> rows of the data timeline. Each cell is coloured according to
// range, and shows an arrow when directionCode points at another variable.
const dataProducts = [

  // Open Weather API
  {
    name: 'Open Weather API',
    Class: DPOpenWeatherAPI,
    description: 'Atmospheric forecast at the buoy location',
    type: 'forecast',
    link: 'https://openweather.co.uk/technology',
    variables: [
      { code: 'WSPD',  name: 'Wind speed',      unit: 'm/s', range: [0, 20],  decimals: 1, directionCode: 'WDIR', fromDirection: true },
      { code: 'GUST',  name: 'Wind gust',       unit: 'm/s', range: [0, 20],  decimals: 1 },
      { code: 'DRYT',  name: 'Air temperature', unit: 'ºC',  range: [0, 40],  decimals: 1 },
      { code: 'RELH',  name: 'Humidity',        unit: '%',   range: [0, 100], decimals: 0 },
      { code: 'CLOUD', name: 'Cloudiness',      unit: '%',   range: [0, 100], decimals: 0 },
    ],
    sources: [
      {
        Class: SourceOpenWeatherAPI,
        src: 'https://api.icatmar.cat/openWeatherAPI',
        institution: 'OpenWeather',
        // Standard code -> path inside a forecast entry (https://openweathermap.org/forecast5)
        mapping: {
          WSPD:  { source: 'wind.speed' },
          WDIR:  { source: 'wind.deg' },
          GUST:  { source: 'wind.gust' },
          DRYT:  { source: 'main.temp' },
          RELH:  { source: 'main.humidity' },
          CLOUD: { source: 'clouds.all' },
        },
      }
    ]
  },


  // Copernicus Marine Service
  {
    name: 'Copernicus Marine Service',
    Class: DPCMEMS,
    description: 'Wave, current and biogeochemistry models at the buoy location',
    type: 'forecast',
    link: 'https://data.marine.copernicus.eu/products',
    variables: [
      { code: 'VHM0',  name: 'Wave significant height',  unit: 'm',      range: [0, 4],       decimals: 1, directionCode: 'VMDR', fromDirection: true },
      { code: 'VTM02', name: 'Wave period',              unit: 's',      range: [0, 15],      decimals: 1 },
      { code: 'HCSP',  name: 'Sea water velocity',       unit: 'm/s',    range: [0, 1],       decimals: 2, directionCode: 'HCDT' },
      { code: 'TEMP',  name: 'Sea surface temperature',  unit: 'ºC',     range: [10, 30],     decimals: 1 },
      { code: 'PSAL',  name: 'Salinity',                 unit: '‰',      range: [36, 39],     decimals: 1 },
      { code: 'CHLA',  name: 'Chlorophyll',              unit: 'mg/m³',  range: [0.01, 0.4],  decimals: 2 },
    ],
    sources: [
      {
        Class: SourceCMEMS,
        src: 'https://wmts.marine.copernicus.eu/teroWmts/',
        institution: 'E.U. Copernicus Marine Service Information',
        // Standard code -> WMTS layer (see Assets/Scripts/WMTS/WMTSCustomDefinitions.js).
        // Directions are read from the animation layers of the same variable.
        mapping: {
          VHM0:  { layer: 'Wave significant height' },
          VMDR:  { layer: 'Wave significant height', direction: true },
          VTM02: { layer: 'Wave period' },
          HCSP:  { layer: 'Sea water velocity' },
          HCDT:  { layer: 'Sea water velocity', direction: true },
          TEMP:  { layer: 'Sea surface temperature' },
          PSAL:  { layer: 'Salinity' },
          CHLA:  { layer: 'Chlorophyll' },
        },
      }
    ]
  },

];


export default dataProducts;

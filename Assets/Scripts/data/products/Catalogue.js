import SourceOpenWeatherAPI from '../sources/SourceOpenWeatherAPI.js';
import SourceCMEMS from '../sources/SourceCMEMS.js';
import SourceErddapBuoy from '../sources/SourceErddapBuoy.js';

import DPOpenWeatherAPI from './DPOpenWeatherAPI.js';
import DPCMEMS from './DPCMEMS.js';
import DPBuoy from './DPBuoy.js';


// The same METEO sensor is published on both ERDDAPs, so both sources declare
// the same variables - defined once here instead of twice.
const METEO_MAPPING = {
  WSPD: { source: 'WSPD' },
  WDIR: { source: 'WDIR', direction: true },
  ATMS: { source: 'ATMS' },
  RELH: { source: 'RELH' },
  DRYT: { source: 'DRYT' },
  DEWT: { source: 'DEWT' },
  WETT: { source: 'WETT' },
  ADNS: { source: 'ADNS' },
  WRSP: { source: 'WRSP' },
  WRDR: { source: 'WRDR', direction: true },
};


// Data products
// variables -> rows of the data timeline. Each cell is coloured according to
// range, and shows an arrow when directionCode points at another variable.
// unitGroup (see Assets/Scripts/data/units.js) makes a variable's unit
// clickable, cycling through that group's options; plain unit/range/decimals
// are used as-is for variables without one.
// compact -> shown when the bottom section is compact; without any compact
// variable a product shows all of them (see BottomSection's panel state).
const dataProducts = [

  // Open Weather API
  {
    name: 'Open Weather API',
    Class: DPOpenWeatherAPI,
    description: 'Atmospheric forecast at the buoy location',
    type: 'forecast',
    link: 'https://openweather.co.uk/technology',
    variables: [
      { code: 'WSPD',  name: 'Wind speed',      unitGroup: 'wind',    directionCode: 'WDIR', fromDirection: true },
      { code: 'GUST',  name: 'Wind gust',       unitGroup: 'wind' },
      { code: 'DRYT',  name: 'Air temperature', unitGroup: 'airTemp' },
      { code: 'RELH',  name: 'Humidity',        unit: '%', range: [0, 100], decimals: 0 },
      { code: 'CLOUD', name: 'Cloudiness',      unit: '%', range: [0, 100], decimals: 0 },
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
      { code: 'VHM0',  name: 'Wave significant height',  unitGroup: 'waves',   directionCode: 'VMDR', fromDirection: true },
      { code: 'VTM02', name: 'Wave period',              unit: 's',     range: [0, 15],      decimals: 1 },
      { code: 'HCSP',  name: 'Sea water velocity',       unitGroup: 'current', directionCode: 'HCDT' },
      { code: 'TEMP',  name: 'Sea surface temperature',  unitGroup: 'seaTemp' },
      { code: 'PSAL',  name: 'Salinity',                 unit: '‰',     range: [36, 39],     decimals: 1 },
      { code: 'CHLA',  name: 'Chlorophyll',              unit: 'mg/m³', range: [0.01, 0.4],  decimals: 2 },
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


  // Somorrostro buoy - observations
  {
    name: 'Somorrostro buoy',
    Class: DPBuoy,
    description: 'Meteorological observations measured at the buoy',
    type: 'real-time',
    link: 'https://erddap.icatmar.cat/erddap/info/BUOY_SOMO_METEO/index.html',
    variables: [
      { code: 'WSPD', name: 'Wind speed',              unitGroup: 'wind',     directionCode: 'WDIR', fromDirection: true, compact: true },
      { code: 'WRSP', name: 'Relative wind speed',     unitGroup: 'wind',     directionCode: 'WRDR', fromDirection: true },
      { code: 'DRYT', name: 'Air temperature',         unitGroup: 'airTemp',  compact: true },
      { code: 'DEWT', name: 'Dew point temperature',   unitGroup: 'airTemp' },
      { code: 'WETT', name: 'Wet bulb temperature',    unitGroup: 'airTemp' },
      { code: 'ATMS', name: 'Atmospheric pressure',    unitGroup: 'pressure', compact: true },
      { code: 'RELH', name: 'Humidity',                unit: '%',      range: [0, 100],   decimals: 0, compact: true },
      { code: 'ADNS', name: 'Air density',             unit: 'kg/m³',  range: [1.1, 1.3],  decimals: 2 },
    ],
    // Same sensor on both servers; whichever is ahead answers first (see DPBuoy)
    sources: [
      {
        Class: SourceErddapBuoy,
        src: 'https://erddap.icatmar.cat/erddap/',
        dataset: 'BUOY_SOMO_METEO',
        institution: 'ICATMAR',
        mapping: METEO_MAPPING,
      },
      {
        Class: SourceErddapBuoy,
        src: 'https://hebe.icm.csic.es/erddap/',
        dataset: 'BUOY_SOMO_METEO',
        institution: 'ICM-CSIC',
        mapping: METEO_MAPPING,
      }
    ]
  },

];


export default dataProducts;

// Unit options for timeline variables the user can switch by clicking their unit.
// Each group's first option is the unit the data arrives in (the base unit) -
// toDisplay converts a raw base-unit value into that option's unit.
const UNIT_GROUPS = {
  wind: [
    { unit: 'm/s',  decimals: 1, range: [0, 20], toDisplay: v => v },
    { unit: 'kn',   decimals: 1, range: [0, 40], toDisplay: v => v * 1.94384 },
    { unit: 'km/h', decimals: 0, range: [0, 70], toDisplay: v => v * 3.6 },
  ],
  airTemp: [
    { unit: 'ºC', decimals: 1, range: [0, 40],    toDisplay: v => v },
    { unit: 'ºF', decimals: 0, range: [32, 104],  toDisplay: v => v * 9 / 5 + 32 },
    { unit: 'K',  decimals: 0, range: [273, 313], toDisplay: v => v + 273.15 },
  ],
  waves: [
    { unit: 'm',  decimals: 1, range: [0, 4],  toDisplay: v => v },
    { unit: 'ft', decimals: 1, range: [0, 13], toDisplay: v => v * 3.28084 },
  ],
  current: [
    { unit: 'm/s',  decimals: 2, range: [0, 1],   toDisplay: v => v },
    { unit: 'kn',   decimals: 1, range: [0, 2],   toDisplay: v => v * 1.94384 },
    { unit: 'cm/s', decimals: 0, range: [0, 100], toDisplay: v => v * 100 },
  ],
  seaTemp: [
    { unit: 'ºC', decimals: 1, range: [10, 30],   toDisplay: v => v },
    { unit: 'ºF', decimals: 0, range: [50, 86],   toDisplay: v => v * 9 / 5 + 32 },
    { unit: 'K',  decimals: 0, range: [283, 303], toDisplay: v => v + 273.15 },
  ],
};

export default UNIT_GROUPS;

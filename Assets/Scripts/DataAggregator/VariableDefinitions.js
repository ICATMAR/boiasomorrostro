
  const variables = [
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
    // Wave parameters, sea state
    {
      name: 'wave parameters',
      altNames: ['waves', 'sea state'],
      sources: [{
        name: 'cmems',
        layers: ['VHM0', 'VMDR', 'VTM02', 'VHM0_WW', 'VMDR_WW', 'VTM01_WW', 'VHM0_SW1', 'VMDR_SW1', 'VTM01_SW1', 'VHM0_SW2', 'VMDR_SW2', 'VTM01_SW2'],
      }],
    },

  ];


  export default variables;
<template>
  <!-- Container -->
  <div id="weather-widget" class="wcontainer p-1">
    <!-- Lat lon -->
    <div>
      {{ $t('Latitude') }}: {{ lat }} º, {{ $t('Longitude') }}: {{ lon }} º
    </div>

    <!-- Tables container -->
    <!-- Container containes two tables, one with the row headers and the other with content -->

    <div class="table-main-container">
      <!-- Table with variable names -->
      <div class="table-var-names-wrapper">
        <table class="table-var-names">
          <tbody>
            <!-- Empty row for time stamps -->
            <tr style="height: 60px"></tr>
            <!-- Row -->
            <!-- The height changes when there is an icon in the row -->
            <tr :key="dR.name" :style="{ height: (dR.imgURL == undefined ? '' : '37') + 'px' }"
              v-for="(dR, index) in dataRows">
              <!-- Row with text, only if it does not contain an image -->
              <th scope="row" v-if="dR.imgURL == undefined">{{ $t(dR.name) }} ({{ dR.units }})</th>
            </tr>
          </tbody>
        </table>
      </div>



      <!-- Table with timestamps and data -->
      <table class="table-data-content" ref="tableData">
        <thead>
          <tr>
            <!-- Col for each time string -->
            <th class="wcol" style="min-width:40px" :key="timeStr" v-for="(timeStr, index) in timeStrs"
              :title="dates[index].toISOString()" :id="[selTimeStr == timeStr ? 'selColumn' : '']"
              :class="[selTimeStr == timeStr ? 'selColumn' : timeStr.split(' ')[1] % 2 == 0 ? 'evenDay' : 'oddDay']">
              {{ $t(timeStr.split(' ')[0]) }}
              <br>{{ timeStr.split(' ')[1] }}
              <br>{{ timeStr.split(' ')[2] }}h
            </th>
          </tr>
        </thead>
        <!-- Table body - Variables -->
        <tbody>
          <!-- Row -->
          <tr :key="dR.name" v-for="(dR, index) in dataRows">
            <!-- Values -->
            <td class="wcol" :key="dd.key" v-for="dd in dataRows[index].data">
              <div v-if='dd.loading && !dR.imgURL' class="spinner-border text-light"
                style="width: 1rem; height: 1rem; position: relative;" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <div v-else-if='dR.direction' :style="{ 'transform': 'rotate(' + (dd.value - 90) + 'deg)' }"
                :title="dd.value + 'º'">&#10140;</div>
              <div v-else-if='dR.imgURL'><img :src=dR.defURL :alt=dR.source :style="getImageStyle(dR, dd)"></div>

              <div v-else-if='!dd.loading' :style="getStyle(dR, dd)">{{ dd.value }}</div>

            </td>
          </tr>
        </tbody>
      </table>
    </div>



    <div>
      <i>Generated using OpenWeather: </i>
      <i>
        <a href="https://openweathermap.org/" target="_blank" rel="noreferrer noopener"> OpeanWeatherAPI </a>
      </i>
    </div>

  </div>
</template>





<script>
export default {
  name: "OpeanWeatherAPIWidget",
  created() {

    // Create data array inside dataRows
    this.dataRows.forEach(dr => {
      dr.data = [];
    })

    // // Create data array inside dataRows
    // this.dataRows.forEach(dr => {
    //   dr.data = [];
    //   for (let i = 0; i < this.numCols; i++)
    //     dr.data[i] = { value: '', loading: true, key: dr.name ? dr.name + i : dr.key + i };
    // });
  },
  mounted() {
    // Update table
    this.updateTable(window.LATITUDE, window.LONGITUDE);
    // EVENTS
    // Panel open
    window.eventBus.on('SidePanel_isPanelOpen', this.panelStateChanged)
  },
  data() {
    return {
      //  Time step
      hoursAhead: 24 * 5,
      selTimeStr: '',
      selDate: new Date(),
      timeStrs: [],
      dates: [],
      lat: '',
      lon: '',
      dataRows: [
        // Wind icon
        {
          key: 'windicon',
          imgURL: 'icons.png',
          position: 0,
          defURL: 'https://es.wisuki.com/images/px.png',
          source: 'wind.speed',
          signRange: [10, 35],
          color: '#ff0000',
        },
        // Wind direction
        {
          name: 'Wind direction',
          abbr: 'WindD',
          units: 'º',
          source: 'wind.deg', // In reference to the object structure of OpenWeatherAPI https://openweathermap.org/forecast5
          direction: true,
          fromDirection: false,
        },
        // Wind speed
        {
          name: 'Wind speed',
          abbr: 'Wind',
          icon: true,
          units: 'knts',
          source: 'wind.speed', // https://openweathermap.org/forecast5
          range: [0, 20],
          signRange: [4, 15],
          color: '#ff0000',
          colorScale: 'boxfill/alg', // TODO: USE LEGENDS!
        },
        // Wind gust
        {
          name: 'Wind gust',
          abbr: 'Gust',
          units: 'knts',
          source: 'wind.gust', // https://openweathermap.org/forecast5
          range: [0, 20],
          signRange: [4, 15],
          color: '#ff0000',
          colorScale: 'boxfill/alg', // TODO: USE LEGENDS!
        },
        // Air Temperature
        {
          name: "Air Temperature",
          abbr: "AirT",
          units: "ºC",
          source: "main.temp", // https://openweathermap.org/forecast5
          range: [0, 40],
          signRange: [12, 30],
          color: "#ff6100",
        },
        // Humidity
        {
          name: "Humidity",
          abbr: "H",
          units: "%",
          source: "main.humidity", // https://openweathermap.org/forecast5
          range: [0, 100],
          signRange: [70, 100],
          color: "#68bfca",
        },
        // Cloudiness icon
        {
          key: 'cloudsicon',
          imgURL: 'icons.png',
          position: 2,
          defURL: 'https://es.wisuki.com/images/px.png',
          source: 'clouds.all',
          signRange: [0, 100],
          color: '#000000',
        },
        // Cloudiness
        {
          name: "Cloudiness",
          abbr: "Clouds",
          icon: true,
          units: "%",
          source: "clouds.all", // https://openweathermap.org/forecast5
          range: [0, 100],
          signRange: [0, 100],
          color: "#a0a0a0",
        },


      ]
    }
  },
  methods: {

    // PRIVATE METHODS
    panelStateChanged: function (isPanelOpen) {
      if (isPanelOpen) {
        this.requestDataUpdate(selId);
      }
    },


    updateTable: function (lat, lon) {
      // Update the table with new data
      this.lat = lat.toFixed(2);
      this.lon = lon.toFixed(2);

      // Get data from OpenWeather API
      this.getData(lat, lon).then(data => {
        // Create dates
        data.list.forEach((item, index) => {
          // Get the date and time
          const date = new Date(item.dt * 1000);
          const timeStr = date.toDateString().substring(0, 2) + ' ' + date.getDate() + ' ' + date.getHours();
          this.timeStrs.push(timeStr);
          this.dates.push(date);

          // First date available is selected (now-current time?)
          if (index == 0) {
            this.selTimeStr = timeStr;
            this.selDate = date;
          }
        });

        // Update dataRows with the fetched data
        this.dataRows.forEach(dR => {
          this.dates.forEach((date, dIndex) => {
            let item = data.list[dIndex];
            // Icon does not have values
            if (dR.source != undefined) {
              const value = dR.source.split('.').reduce((obj, key) => obj[key], item);

              dR.data[dIndex] = {
                value: value,
                loading: false,
              }
            }
          });
        });


      });
    },

    getData: async function (lat, lon) {
      // Get data from OpenWeather API
      return fetch('https://api.icatmar.cat/openWeatherAPI?lat=' + lat + '&lon=' + lon)
        .then(response => response.json())
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    },





    getStyle: function (dR, dd) {
      let color = dR.color;
      let range = dR.signRange ? dR.signRange : dR.range; // Significant range
      let value = dd.value;

      let alpha = value == 'x' ? 0 : 255 * (value - range[0]) / (range[1] - range[0]);
      alpha = Math.max(Math.min(alpha, 255), 0); // Clamp for HEX conversion

      let textWeight = 'normal';
      if (dR.signRange) {
        if (value > (range[0] + 0.33 * (range[1] - range[0])))
          textWeight = 'bold';
        else if (value > (range[0] + 0.66 * (range[1] - range[0])))
          textWeight = 'bolder';
      }

      return {
        'background-color': color + alpha.toString(16).split('.')[0],
        'font-weight': textWeight,
        'border-radius': '4px',
      }
    },
    // Create image style
    getImageStyle: function (dR, dd) {
      let color = dR.color;
      let range = dR.signRange ? dR.signRange : dR.range; // Significant range
      let value = dd.value;

      let alpha = value == 'x' ? 0 : (value - range[0]) / (range[1] - range[0]);
      alpha = Math.max(Math.min(alpha, 1), 0); // Clamp for HEX conversion
      //alpha *= 255;

      let colorFactor = 0;
      if (alpha == 0)
        colorFactor = 0;
      else if (alpha < 0.33)
        colorFactor = 1;
      else if (alpha < 0.66)
        colorFactor = 2;
      else
        colorFactor = 3;

      let cssPosition = -dR.position * 32 - colorFactor * 32 * 3;

      // if (alpha/255 == 0){
      //   color = '#9cc6c8';
      // } else if (alpha/255 < 0.33){
      //   color = '#1fcf02';
      // } else if (alpha/255 < 0.66){
      //   color = '#da9000';
      // } else {
      //   color = '#e03636';
      // }

      // // Create linear gradient
      // let linGrad = 'linear-gradient(0deg, ' + color + '66 0%, ' + color + 'ff 100%)'

      return {
        //'background': color + alpha.toString(16).split('.')[0],
        'background-image': 'url(./Assets/Icons/' + dR.imgURL + ')',
        'background-position': cssPosition + 'px 0',
        // transform: 'scale(1)',
      }
    },
  }
}

</script>



<style scoped>
.wcontainer {
  font-size: 12px;
  width: 100%;
}

.table-main-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  margin-bottom: 30px;
  justify-content: center;
}

.table-var-names-wrapper {
  border-right: solid 4px;
  border-image: linear-gradient(90deg, rgb(0 0 0) 99%, rgb(0 0 0 / 0%)) 1;
}


.table-var-names {
  margin-bottom: 10px;
}


.table-data-content {
  display: block;
  overflow-x: scroll;
  scrollbar-width: thin;
}

.table-main-container tr {
  height: 32px;
  /* border: 1px solid black; */
}

.table-main-container td,
.table-main-container th {
  white-space: nowrap;
}

.table-var-names th {
  text-align: end;
}



.wrow {
  /* display: flex;
  flex-direction: row; */
  /* border:rgb(95, 95, 95);
  border-style: solid; */
  text-align: center;
}

.wcol {
  /* border:rgb(252, 252, 252);
  border-style: solid; */
  border-style: none;
  /* flex-grow: 1; */
  text-align: center;
  align-items: center;
  padding: 2px;
}

.selColumn {
  background-color: var(--red);
}

.evenDay {
  background-color: rgb(82 181 217 / 28%);
}

/* .oddDay {
} */


img {
  border-radius: 9px;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
}

.left-button-wrapper {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  width: 0px;
}
</style>
<template>
  <!-- Container -->
  <div id="weather-widget" class="wcontainer p-1">
    <div>
      {{ $t('Latitude') }}: {{ lat }} º, {{ $t('Longitude') }}: {{ long }} º
    </div>
    <!-- Temporal domain options -->
    <div class="time-step-opts-container">
      <div style="padding-right: 5px">{{ $t('Time step') }}:</div>
      <button v-for="tStep in timeSteps" class="clickable" :class="[selTimeStep == tStep ? 'button-selected' : '']"
        :key="tStep" @click="onTimeStepChanged(tStep)">{{ $t(tStep) }}</button>
    </div>

    <!-- Tables container -->
    <!-- Container containes two tables, one with the row headers and the other with content -->

    <div class="table-main-container">
      <!-- Table with variable names -->
      <div class="table-var-names-wrapper">
        <table class="table-var-names">
          <tbody>
            <!-- Empty row for time stamps -->
            <tr :style="{ height: (selTimeStep.includes('h') ? '60' : '41') + 'px' }"></tr>
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

      <!-- More data before -->
      <div class="left-button-wrapper" v-if="false">
        <button style="height: 10px">
          < </button>
      </div>

      <!-- Table with timestamps and data -->
      <table class="table-data-content" ref="tableData">
        <thead>
          <tr>
            <!-- Col for each time string -->
            <th class="wcol" style="min-width:40px" :key="timeStr" v-for="(timeStr, index) in timeStrs"
              :title="dates[index].toISOString()" :id="[selTimeStr == timeStr ? 'selColumn' : '']"
              :class="[selTimeStr == timeStr ? 'selColumn' : selTimeStep.includes('h') ? timeStr.split(' ')[1] % 2 == 0 ? 'evenDay' : 'oddDay' : index % 2 == 0 ? 'evenDay' : 'oddDay']">
              {{ $t(timeStr.split(' ')[0]) }}
              <br>{{ timeStr.split(' ')[1] }}
              <template v-if="selTimeStep.includes('h')"><br>{{ timeStr.split(' ')[2] }}h</template>
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
              <div v-else-if='dR.direction' style="font-size: large" :style="{ 'transform': 'rotate(' + (dd.value - 90) + 'deg)'}"
                :title="dd.value + 'º'">&#10140;</div>
              <div v-else-if='dR.imgURL'><img :src=emptyPixelBlobURL :alt=dR.source :style="getImageStyle(dR, dd)"></div>

              <div v-else-if='!dd.loading' :style="getStyle(dR, dd)">{{ dd.value }}</div>

            </td>
          </tr>
        </tbody>
      </table>

      <!-- More data after -->
      <div v-if="false"><button style="height: 10px">></button></div>
    </div>



    <div>
      <i>{{ $t('Data from') }} E.U. Copernicus Marine Service Information: </i>
      <i v-for="dPKey in Object.keys(dataProducts)">
        <a :href=dataProducts[dPKey].doi target="_blank" rel="noreferrer noopener"> {{ dPKey }}; </a>
      </i>
    </div>

  </div>
</template>




<script>
export default {
  // REQUIRES WMTSDataRetriever.js
  name: "weather-info",
  created() {
    // Create empty pixel blob URL
    let canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    this.emptyPixelBlobURL = canvas.toDataURL('image/png');

    // Create data retreiver
    this.dataRetriever = window.WMTSDataRetriever;

    let tStep = this.selTimeStep == '1h' ? 1 : this.selTimeStep == '3h' ? 3 : 24;
    this.numCols = (this.hoursAheadBehind[this.selTimeStep] / tStep) * 2 + 1;

    // Create data array inside dataRows
    this.dataRows.forEach(dr => {
      dr.data = [];
      for (let i = 0; i < this.numCols; i++)
        dr.data[i] = { value: '', loading: true, key: dr.name ? dr.name + i : dr.key + i };
    });
  },
  mounted() {
    // Update table with the current date
    this.updateTable(new Date(), window.CMEMS_LONGITUDE, window.CMEMS_LATITUDE);


    // EVENTS
    // Panel open
    window.eventBus.on('SidePanel_isPanelOpen', this.panelStateChanged)
  },
  unmounted() {

  },
  data() {
    return {
      //  Time step
      timeSteps: ['1h', '3h', '1d'],
      hoursAheadBehind: {
        '1h': 24,
        '3h': 24 * 2,
        '1d': 24 * 5,
      },
      selTimeStep: '1d',
      selTimeStr: '',
      selDate: new Date(),
      dataProducts: {},
      timeStrs: [],
      currentDateHTML: '',
      lat: '',
      long: '',
      emptyPixelBlobURL: '',
      // Check https://es.wisuki.com/spot/2617/barceloneta for inspiration
      dataRows: [
        // TODO: no data product for wind? Work on WMTS
        // https://data.marine.copernicus.eu/product/WIND_GLO_PHY_L4_MY_012_006/description
        // https://data.marine.copernicus.eu/product/WIND_GLO_PHY_L4_NRT_012_004/description
        // { // Wind icon
        //   key: 'windicon',
        //   imgURL: 'icons.png',
        //   position: 0,
        //   source: 'Wind',
        //   signRange: [5,15],
        //   color: '#6164ff',
        // },
        // { 
        //   name: "Wind direction",
        //   abbr: "Dir",
        //   units: "º",
        //   direction: true, 
        //   layer: "Wind",
        // },
        // { 
        //   name: "Wind",
        //   abbr: "Wind",
        //   icon: true,
        //   units: "m/s", 
        //   range: [0, 30],
        //   signRange: [5,15],
        //   color: '#6164ff',//'#71c3eb',
        //   colorScale: 'boxfill/sst_36'
        // },

        { // Wave icon
          key: 'waveicon',
          imgURL: 'icons.png',
          position: 1,
          source: 'Wave significant height',
          signRange: [1, 4],
          color: '#6164ff',
        },
        {
          name: "Wave direction",
          abbr: "Dir",
          units: "º",
          direction: true,
          fromDirection: true,
          layer: "Wave significant height",
        },
        {
          name: "Wave significant height",
          abbr: "Waves",
          icon: true,
          units: "m",
          range: [0, 8],
          signRange: [0.2, 4],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/alg',
        },
        {
          name: "Wave period",
          abbr: "T",
          units: "s",
          range: [0, 25],
          signRange: [6, 15],
          color: '#6164ff' // TODO: color or colorScale. If color, go from transparent to the specified color.
        },
        { // Current icon
          key: 'currenticon',
          imgURL: 'icons.png',
          position: 2,
          source: 'Sea water velocity',
          signRange: [0.25, 1],
          color: '#6164ff',
        },
        {
          name: "Sea current direction",
          abbr: "Dir",
          units: "m/s",
          direction: true,
          layer: "Sea water velocity",
          color: '#6164ff',//'#71c3eb',
        }, {
          name: "Sea water velocity",
          abbr: "Current",
          icon: true,
          units: "m/s",
          range: [0, 3],
          signRange: [0.25, 1],
          color: '#6164ff',//'#71c3eb',
        },
        {
          name: "Chlorophyll",
          abbr: "Chl",
          units: "mg/m3",
          range: [0, 2.5],
          signRange: [0.5, 1],
          color: '#6164ff'
        },
        {
          name: "Salinity",
          abbr: "Sal",
          units: "‰",
          range: [30, 45],
          signRange: [38, 40],
          color: '#6164ff'
        },
        {
          name: "Sea surface temperature",
          abbr: "SST",
          units: 'ºC',
          elevation: true, // TODO: ALLOWS 2D PLOT IF CLICKED ON THE VARIABLE NAME ▼?
          range: [10, 25],
          colorScale: 'boxfill/sst_36',
        },
        {
          name: "Sea bottom temperature",
          abbr: "Bottom t",
          units: 'ºC',
          range: [10, 25],
          colorScale: 'boxfill/sst_36'
        },
        {
          name: "Sea temperature anomaly",
          abbr: 'SST anomaly',
          units: 'ºC',
          range: [-8, 8],
          signRange: [0, 5],
          color: '#FFAC63'
        }
      ],
    }
  },
  methods: {
    // USER HTML ACTIONS
    onClick: function (event) {

    },

    // Time step changed
    onTimeStepChanged: function (inStep) {
      this.selTimeStep = inStep;
      // Set time step
      let tStep = this.selTimeStep == '1h' ? 1 : this.selTimeStep == '3h' ? 3 : 24;
      // Calculate number of columns
      this.numCols = (this.hoursAheadBehind[this.selTimeStep] / tStep) * 2 + 1;

      // Create data array inside dataRows
      this.dataRows.forEach(dr => {
        dr.data = [];
        for (let i = 0; i < this.numCols; i++)
          dr.data[i] = { value: '', loading: true, key: dr.name ? dr.name + i : dr.key + i };
      });

      // Update table
      this.updateTable(this.selDate, this.long * 1, this.lat * 1);
    },

    // PRIVATE METHODS
    panelStateChanged: function (isPanelOpen) {
      if (isPanelOpen) {
        this.requestDataUpdate(selId);
      }
    },


    getData: function (lat, long) {
      // Time step (either 'h' or 'd')
      let tStep = this.selTimeStep.substring(1, 2);
      // Reset used data products
      this.dataProducts = {};
      // Get data
      this.dataRows.forEach((rr, rIndex) => {
        this.dates.forEach((date, dIndex) => {
          let layerName = rr.direction ? rr.layer : rr.name;
          // Icon row does not load data
          if (layerName !== undefined) {
            this.dataRetriever.getDataAtPoint(layerName, date.toISOString(), lat, long, tStep, rr.direction)
              .then(value => {
                if (value == undefined) {
                  rr.data[dIndex].value = 'x';
                  rr.data[dIndex].loading = false;
                  return;
                }
                if (rr.direction && rr.fromDirection) // Wave direction data is not showing where they go but where they come from
                  value = (180 + value) % 360;
                rr.data[dIndex].value = value.toFixed(2);
                rr.data[dIndex].loading = false;
                // Get product
                let id = this.dataRetriever.getDataSetIdFromDataName(layerName);
                let dataSet = this.dataRetriever.getDataSet(id, tStep, date.toISOString());
                if (this.dataProducts[dataSet.productName] == undefined) {
                  this.dataProducts[dataSet.productName] = { doi: dataSet.doi };
                }
                // Icon
                if (rr.icon) {
                  // Find dataRow with source
                  let iconRow = this.dataRows.filter(e => e.source == rr.name)[0];
                  if (iconRow == undefined) { console.error('Icon is not found for ' + rr.name); return };
                  iconRow.data[dIndex].value = rr.data[dIndex].value;
                  iconRow.data[dIndex].loading = false;
                }
              })
              .catch(error => {
                console.error("Can't get CMEMS-WMS " + layerName + " on " + date.getUTCFullYear() + "/" + (date.getMonth() + 1));
                rr.data[dIndex].value = 'x';
                rr.data[dIndex].loading = false;
              });
          } // end of if


        });
      })


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

    // Create dates
    createDates: function (inputDate) {
      // Set selected date
      this.selDate = inputDate || this.selDate;
      this.selDate.setMinutes(0);
      this.selDate.setSeconds(0);
      this.selDate.setMilliseconds(0);
      // Set selected time step
      this.selTimeStr = inputDate.toDateString().substring(0, 2) + ' ' + inputDate.getDate() + ' ' + inputDate.getHours();

      // If dates does not exists (initialization)
      this.dates = this.dates == undefined ? this.dates = [] : this.dates;
      let tempDate = new Date(inputDate.getTime());
      // Days ahead and behind
      tempDate.setHours(tempDate.getHours() + this.hoursAheadBehind[this.selTimeStep]);

      // Set time step
      let tStep = this.selTimeStep == '1h' ? 1 : this.selTimeStep == '3h' ? 3 : 24;

      // Reset time strings and dates
      this.timeStrs = [];
      this.dates = [];

      for (let i = 0; i < this.numCols; i++) {
        this.timeStrs[this.numCols - 1 - i] = tempDate.toDateString().substring(0, 2) + ' ' + tempDate.getDate() + ' ' + tempDate.getHours();
        this.dates[this.numCols - 1 - i] = new Date(tempDate.getTime());
        tempDate.setHours(tempDate.getHours() - tStep);
      }


    },


    updateTable: async function (inputDate, long, lat) {
      this.lat = lat.toFixed(2);
      this.long = long.toFixed(2);
      let str = inputDate.toString().substring(0, 15);
      // Translate
      this.currentDateHTML = this.$i18n.t(str.split(" ")[0]) + " " + this.$i18n.t(str.split(" ")[1]) + " " + str.split(" ")[2] + " " + str.split(" ")[3];

      // Cancel active requests
      this.dataRetriever.cancelActiveRequests();
      // Pause execution so the requests are aborted and the img error events are triggered (img.src=''; img.onerror)
      await new Promise((resolve) => setTimeout(resolve, 200));
      // Reset loading
      this.dataRows.forEach(dr => {
        for (let i = 0; i < this.numCols; i++) {
          dr.data[i].value = '';
          dr.data[i].loading = true;
        }
      });
      // Create dates
      this.createDates(inputDate);
      // Update data
      this.getData(lat, long);
    },






    // PUBLIC METHODS
    requestDataUpdate(id) {
      // Is selected haul different from previously loaded?
      if (id != this.selHaulId) {
        // If so, load new data
        let fdManager = window.DataManager.getFishingDataManager();
        this.selHaul = fdManager.hauls[id];
        this.selHaulId = id;
        let middleCoordinate;
        if (this.selHaul == undefined) {
          debugger;
        }
        if (this.selHaul.geometry.type == "Point")
          middleCoordinate = this.selHaul.geometry.coordinates;
        else {
          let coords = this.selHaul.geometry.coordinates;
          middleCoordinate = [...coords[Math.round(coords.length / 2)]]; // copy
        }

        this.updateTable(this.selHaul.Date, middleCoordinate[0], middleCoordinate[1]);

        // Center on column
        this.$nextTick(() => {
          let selColumnEl = this.$refs["tableData"].querySelector('#selColumn');
          if (selColumnEl != undefined) {
            selColumnEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          }
        });
      }
    },




  },
  components: {

  },
  computed: {

  }
}
</script>

<style scoped>
.wcontainer {
  font-size: 12px;
  /* display: flex; 
  flex-direction: column; */
  width: 100%;
  /* border:black;
  border-style: solid; */
}

.time-step-opts-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.time-step-opts-container>button {
  padding: 4px;
  padding-left: 10px;
  padding-right: 10px;
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
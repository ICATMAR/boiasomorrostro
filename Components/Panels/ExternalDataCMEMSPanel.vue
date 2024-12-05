<template>
  <div id="external-data-cmems" class="content">

    <h2>{{$t('externalDataCMEMS.title')}}</h2>
    <p> {{$t('externalDataCMEMS.p1')}}</p>
    <p> {{ $t('Latitude') }}: {{ lat.toFixed(2) }}º, {{ $t('Longitude') }}: {{long.toFixed(2)}}º</p>

    <!-- Table -->
    <div class="tableContainer">
      <table>
        <!-- Table Head - Days -->
        <thead>
          <tr>
            <td></td>
            <!-- Col for each day -->
            <th class="wcol" style="min-width:40px" :key="dd" v-for="(dd, index) in daysString" :title="dates[index].toISOString()">
              <span>{{$t(dd.split(' ')[0]) + ' ' + dd.split(' ')[1]}}</span>
            </th>
          </tr>
        </thead>
        <!-- Table body - Variables -->
        <tbody>
          <!-- Row -->
          <tr :key="dR.name" v-for="(dR, index) in dataRows">
            <!-- Row name -->
            <th scope="row">
              <span v-if="dR.imgURL== undefined && !dR.usesCustomSVG">{{$t(dR.name)}} ({{dR.units}})</span>
              <span v-else-if="dR.usesCustomSVG">{{$t(dR.name)}}</span>
            </th>
            <!-- Values -->
            <td class="wcol" :key="dd.key" v-for="dd in dataRows[index].data">
              <!-- Loading -->
              <div v-if='dd.loading && !dR.imgURL' class="spinner-border text-light" style="width: 1rem; height: 1rem; position: relative; color:black !important;" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <!-- Direction -->
              <div v-else-if='dR.direction' v-show='dd.value != "x"' :style="{'transform': 'rotate('+ (dd.value - 90 + 180) +'deg)'}" :title="dd.value + 'º'"><span>&#10140;</span></div>
              <!-- Image -->
              <span v-else-if='dR.imgURL'><img :src=dR.defURL :alt=dR.source :style="getImageStyle(dR, dd)"></span>
              <!-- SVG -->
              <span v-else-if='dR.usesCustomSVG' v-html="dd.svg" class="" :title="$t('swellCompositionSVG')"></span>

              <span v-else-if='!dd.loading' :style="getStyle(dR, dd)">{{dd.value}}</span>
              
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Day ahead - behind -->
    <p class="modifyDatesContainer">
      <button class="icon-str" title="-48h" @click="changeSelDate(-48)">≪</button>
      <span>{{ $t('externalDataCMEMS.datesModify') }}</span>
      <button class="icon-str" title="+48h" @click="changeSelDate(48)">≫</button>
    </p>


    <!-- Bottom info -->
    <div class="bottomInfoContainer">
      <!-- Legend sea composition -->
      <div class="legendContainer">
        <span style="margin-bottom: 10px;">{{ $t('Swell composition legend') }}</span>
        <div class="legendItem">
          <div class="icon-str" style="background:var(--lightBlue)"></div><span>  {{ $t('Wave significant height') }}</span>
        </div>
        <div class="legendItem">
          <div class="icon-str" style="background:khaki"></div><span>  {{ $t('Wind wave significant height') }}</span>
        </div>
        <div class="legendItem">
          <div class="icon-str" style="background:var(--darkBlue)"></div><span>  {{ $t('Primary swell wave significant height') }}</span>
        </div>
        <div class="legendItem">
          <div class="icon-str" style="background:var(--black)"></div><span>  {{ $t('Secondary swell wave significant height') }}</span>
        </div>
      </div>

      <!-- Data source attribution -->
      <!-- <span class="wrapText">{{$t('Data source')}}: <a class="widgetSpan clickable" title="Weather data source" :href="sourceDoi" target="_blank">E.U. CMEMS,
              Copernicus Marine Service</a></span> -->
      <span style="width: 50%">
        <i>{{$t('externalDataCMEMS.generatedCMEMS')}}</i>
        <i><a href="https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6" target="_blank" rel="noreferrer noopener">Sea Physics Analysis and Forecast; </a></i>
        <i><a href="https://doi.org/10.25423/CMCC/MEDSEA_MULTIYEAR_PHY_006_004_E3R1" target="_blank" rel="noreferrer noopener">Sea Physics Reanalysis; </a></i>

        <i><a href="https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam3" target="_blank" rel="noreferrer noopener">Sea Waves Analysis and Forecast; </a></i>
        <i><a href="https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012" target="_blank" rel="noreferrer noopener">Sea Waves Reanalysis; </a></i>

        <i><a href="https://doi.org/10.25423/cmcc/medsea_analysisforecast_bgc_006_014_medbfm3" target="_blank" rel="noreferrer noopener">Sea Biogeochemistry Analysis and Forecast; </a></i>
        <i><a href="https://doi.org/10.25423/cmcc/medsea_multiyear_bgc_006_008_medbfm3" target="_blank" rel="noreferrer noopener">Sea Biogechemistry Reanalysis; </a></i>

      </span>

    </div>

    <!-- Funding image -->
    <a href="https://marine.copernicus.eu/" target="_blank">
      <img class="bottomLogo" src="/CasablancaBuoy/Assets/Logos/CMEMS.png">
    </a>


  </div>
</template>

<script>
export default {
  name: 'externalDataCMEMS', // Caps, no -
  props: {
    isVisible: Boolean,
  },
  created() {
    // Create data retriever
    this.dataRetriever = window.WMTSDataRetriever;

    // Initialize date
    let date = new Date();
    let tmst = date.toISOString();
    tmst = tmst.substring(0,14) + '00:00.000Z'; // Hourly
    this.currentDate = new Date(tmst);

    // Create data array inside dataRows
    this.dataRows.forEach(dr => {
      dr.data = [];
      for (let i = 0; i < this.numDays; i++)
        dr.data[i] = {value: '', loading: true, key: dr.name ? dr.name + i : dr.key + i};
    });
  },
  mounted() {
    // EVENTS
    window.eventBus.on('TimeString_SelectedDateChanged', (tmst) => {
      this.currentDate = new Date(tmst);
    });
  },
  data (){
    return {
      // Icons
      // https://origin.fontawesome.com/search?o=r&m=free&f=classic
      isPanelVisible: false,
      // Defaults
      sourceDoi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
      currentDate: new Date(),
      dataRows: [   
        { // Wave icon
          key: 'waveicon',
          imgURL: '/CasablancaBuoy/Assets/Logos/icons.png',
          position: 1,
          defURL: 'https://es.wisuki.com/images/px.png',
          source: 'Wave significant height',
          signRange: [1, 4],
          color: '#6164ff',
        },
        {
          name: "Wave direction",
          abbr: "Dir",
          units: "º", 
          direction: true, 
          layer: "Wave significant height",
        },
        {
          name: "Wave significant height",
          abbr: "Waves",
          icon: true,
          units: "m", 
          range: [0, 8],
          signRange: [0.2,4],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/alg',
        },
        {
          name: "Wave period",
          abbr: "T",
          units: "s", 
          range: [0,25],
          signRange: [6,15],
          color: '#6164ff' // TODO: color or colorScale. If color, go from transparent to the specified color.
        },
        // Custom SVG
        {
          name: "Swell composition",
          usesCustomSVG: true,
        },
        // Wind waves
        {
          name: "Wind wave direction",
          abbr: "Dir",
          units: "º", 
          direction: true, 
          layer: "Wind wave significant height",
        },
        {
          name: "Wind wave significant height",
          abbr: "Wind waves",
          icon: false,
          units: "m", 
          range: [0, 8],
          signRange: [0.2,4],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/alg',
        },
        // TODO: download period and use it for the custom SVG
        // Swell 1
        {
          name: "Primary swell wave direction",
          abbr: "Dir",
          units: "º", 
          direction: true, 
          layer: "Primary swell wave significant height",
        },
        {
          name: "Primary swell wave significant height",
          abbr: "Swell 1",
          icon: false,
          units: "m", 
          range: [0, 8],
          signRange: [0.2,4],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/alg',
        },
        // Swell 2
        {
          name: "Secondary swell wave direction",
          abbr: "Dir",
          units: "º", 
          direction: true, 
          layer: "Secondary swell wave significant height",
        },
        {
          name: "Secondary swell wave significant height",
          abbr: "Swell 2",
          icon: false,
          units: "m", 
          range: [0, 8],
          signRange: [0.2,4],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/alg',
        },
        


        { // Current icon
          key: 'currenticon',
          imgURL: '/CasablancaBuoy/Assets/Logos/icons.png',
          position: 2,
          defURL: 'https://es.wisuki.com/images/px.png',
          source: 'Sea surface velocity',
          signRange: [0.25, 1],
          color: '#6164ff',
        },
        {
          name: "Sea current direction",
          abbr: "Dir",
          units: "m/s",
          direction: true,
          layer: "Sea surface velocity",
          color: '#6164ff',//'#71c3eb',
        },        {
          name: "Sea surface velocity",
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
          signRange: [0.5,1],
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
      ],
      numDays: 7,
      numDaysAhead: 4,
      daysString: [],
      currentDateHTML: '',
      long: 1.345567,
      lat: 40.704597,
      longStr: '1.34',
      latStr: '40.70',
    }
  },
  watch: {
    isVisible(now, before) {
      this.setVisible(now);
    }
  },
  methods: {
    // USER INTERACTION
    changeSelDate: function(hours){
      this.currentDate.setUTCHours(this.currentDate.getUTCHours() + hours);
      // Update table
      this.updateTable(this.currentDate, this.long, this.lat);
    },


    // PRIVATE METHODS
    getData: async function(lat, long){
      // Get data
      this.dataRows.forEach((rr, rIndex) => {
        this.dates.forEach((date, dIndex) => {
          let layerName = rr.direction ? rr.layer : rr.name;
          // Icon row and custom SVG does not load data
          if (layerName !== undefined && rr.usesCustomSVG != true){
            this.dataRetriever.getDataAtPoint(layerName, date.toISOString(), lat, long, 'h', rr.direction, true)
              .then(value => {
                if (value == undefined){
                  rr.data[dIndex].value = 'x';
                  rr.data[dIndex].loading = false;
                  return;
                }
                rr.data[dIndex].value = value.toFixed(2);
                rr.data[dIndex].loading = false;
                // Icon
                if (rr.icon){
                  // Find dataRow with source
                  let iconRow = this.dataRows.filter(e => e.source == rr.name)[0];
                  if (iconRow == undefined) {console.error('Icon is not found for ' + rr.name); return};
                  iconRow.data[dIndex].value = rr.data[dIndex].value;
                  iconRow.data[dIndex].loading = false;
                }
              })
              .catch(error => {
                console.error("Can't get CMEMS-WMS " + layerName + " on " + date.getUTCFullYear() + "/" + (date.getMonth()+1) + "\nError: " + error);
                rr.data[dIndex].value = 'x';
                rr.data[dIndex].loading = false;
              })
              .finally(() => {
                this.createCustomSVG();
              });
          } // end of if
        

        });
      })
    
    
    },



    getStyle: function(dR, dd){
      let color = dR.color;
      let range = dR.signRange ? dR.signRange : dR.range; // Significant range
      let value = dd.value;
      
      let alpha = value == 'x' ? 0 : 255*(value - range[0]) / (range[1] - range[0]);
      alpha = Math.max(Math.min(alpha, 255), 0); // Clamp for HEX conversion

      let textWeight = 'normal';
      if (dR.signRange){
        if (value > (range[0] + 0.33*(range[1]-range[0])))
          textWeight = 'bold';
        else if (value > (range[0] + 0.66*(range[1]-range[0])))
          textWeight = 'bolder';
      }

      return {
        'background-color': color + alpha.toString(16).split('.')[0],
        'font-weight': textWeight,
        'border-radius': '4px',
      }
    },


    // Create image style
    getImageStyle: function(dR, dd){
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

      let cssPosition = -dR.position*32 - colorFactor * 32*3;

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
        'background-image': 'url('+ dR.imgURL +')',
        'background-position': cssPosition + 'px 0',
        // transform: 'scale(1)',
      }
    },

    // Create dates
    createDates: function(inputDate) {
      // If dates does not exists (initialization)
      this.dates = this.dates == undefined ? this.dates = [] : this.dates;
      let tempDate = new Date(inputDate.getTime() + this.numDaysAhead*24*60*60*1000);

      for (let i = 0; i < this.numDays; i++){
        this.daysString[this.numDays-1 - i] = tempDate.toDateString().substring(0,2) + ' ' + tempDate.getDate();
        this.dates[this.numDays-1 - i] = new Date(tempDate.getTime());
        tempDate.setDate(tempDate.getDate() - 1);
      }

      
    },


    // Create a SVG that represents the swell composition
    createCustomSVG: function(){
      let matrix = [];
      this.dataRows.forEach(dr => {
        
        // Wave sign. height, WW, SW1, SW2
        let index = undefined;
        if (dr.name == 'Wave significant height')
          index = 0;
        else if (dr.name == 'Wind wave significant height')
          index = 1;
        else if (dr.name == 'Primary swell wave significant height')
          index = 2;
        else if (dr.name == 'Secondary swell wave significant height')
          index = 3;
        else if (dr.name == 'Wave direction')
          index = 4;
        else if (dr.name == 'Wind wave direction')
          index = 5;
        else if (dr.name == 'Primary swell wave direction')
          index = 6;
        else if (dr.name == 'Secondary swell wave direction')
          index = 7;
      
        // Store values in matrix
        if (index !== undefined){
          // Create data matrix to use later
          matrix[index] = [];
          for (let i = 0; i < this.numDays; i++){
            let value = parseFloat(dr.data[i].value);
            if (isNaN(value) || value == undefined)
              return;
            matrix[index][i] = value;
          }
        } else {
          return;
        }
      });

      // Create SVG
      this.dataRows.forEach(dr => {
        // Uses custom SVG
        if (dr.usesCustomSVG){
          for (let i = 0; i < this.numDays; i++){
            let wsh = matrix[0][i];
            let wwshNorm = matrix[1][i] / wsh;
            let sw1Norm = matrix[2][i] / wsh;
            let sw2Norm = matrix[3][i] / wsh;
            let wDir = matrix[4][i];
            let wwDir = matrix[5][i];
            let sw1Dir = matrix[6][i];
            let sw2Dir = matrix[7][i];

            // Check that all data is available to create SVG
            for (let j = 0; j < 8; j++){
              if (isNaN(matrix[j][i]) || matrix[j][i] == undefined)
                return;
            }

            // https://sparkbox.com/foundry/how_to_code_an_SVG_pie_chart
            let size = 40;
            let svgStr = `
              <svg height="26" width="26" viewBox="0 0 26 26" class="" style="width:${size}px; height:${size}px" class="width:${size}px;height:${size}px" >
                <circle r="10" cx="13" cy="13" fill="var(--lightBlue)" />
                <polygon points="8, 4.5, 13, 0, 18, 4.5" fill="var(--lightBlue)" transform="rotate(${wDir + 180}, 13, 13)" />
                
                <circle r="4" cx="13" cy="13" fill="transparent" stroke="khaki" stroke-width="8" stroke-dasharray="calc(${wwshNorm}*8*3.142) calc(8*3.142)" transform="rotate(-${90 + wwshNorm*180 - wwDir + 180 + 360}, 13, 13)" />
                <polygon points="${13 - 4 * Math.min(1, wwshNorm*6)}, 6.5, 13, 2, ${13 + 4 * Math.min(1, wwshNorm*6)}, 6.5" fill="khaki" transform="rotate(${wwDir + 180}, 13, 13)" />

                <circle r="2.5" cx="13" cy="13" fill="transparent" stroke="var(--darkBlue)" stroke-width="5" stroke-dasharray="calc(${sw1Norm}*5*3.142) calc(5*3.142)" transform="rotate(-${90 + sw1Norm*180 - sw1Dir + 180 + 360}, 13, 13)" />
                <polygon points="${13 - 3 * Math.min(1, sw1Norm*6)}, 9.5, 13, 6, ${13 + 3 * Math.min(1, sw1Norm*6)}, 9.5" fill="var(--darkBlue)" transform="rotate(${sw1Dir + 180}, 13, 13)" />

                <circle r="1.5" cx="13" cy="13" fill="transparent" stroke="black" stroke-width="3" stroke-dasharray="calc(${sw2Norm}*3*3.142) calc(3*3.142)" transform="rotate(-${90 + sw2Norm*180 - sw2Dir + 180 + 360}, 13, 13)" />

                
              </svg>
              `
            
            dr.data[i].svg = svgStr;
            dr.data[i].loading = false;
          }
        }
      });
    },


    updateTable: async function(inputDate, long, lat){

      this.latStr = lat.toFixed(2);
      this.longStr = long.toFixed(2);
      let str = inputDate.toString().substring(0,15);
      // Translate
      this.currentDateHTML = this.$i18n.t(str.split(" ")[0]) + " " + this.$i18n.t(str.split(" ")[1]) + " " + str.split(" ")[2] + " " + str.split(" ")[3];

      // Cancel active requests
      this.dataRetriever.cancelActiveRequests();
      // Pause execution so the requests are aborted and the img error events are triggered (img.src=''; img.onerror)
      await new Promise((resolve) => setTimeout(resolve, 200));
      // Reset loading
      this.dataRows.forEach(dr => {
        for (let i = 0; i < this.numDays; i++){
          dr.data[i].value = '';
          dr.data[i].loading = true;
        }
      });
      // Create dates
      this.createDates(inputDate);
      // Update data
      this.getData(lat, long);
    },

    fetchExternalData: function(){
      if (!this.isPanelVisible)
        return

      let date = this.currentDate; // TODO: USE CUSTOM DATE
      this.updateTable(date, this.long, this.lat);
    },


    // PUBLIC METHODS
    setVisible: function(isVisible){
      this.isPanelVisible = isVisible;
      if (isVisible){
        // Update data
        this.fetchExternalData();
      } else {
        window.eventBus.emit('widgetExternalData_ClimaLayerChange', undefined);
      }
    }

  },
  components: {
  }
}
</script>

<style scoped>

  p {
    text-align: justify;
  }

  .modifyDatesContainer{
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -20px;
    margin-bottom: 20px;
    width: 100%;
    background: rgb(224 247 255);
    border-radius: 10px;
  }
  .modifyDatesContainer > button {
    margin-left: 10px;
    margin-right: 10px;
  }

  .tableContainer {
    height: clamp(300px, 50vh, 600px);
    overflow: auto;
    pointer-events: all;
    padding-right: 10px;

    margin-right: 10px;
    margin-bottom: 30px;

    border: solid;
    border-width: 0px 2px 2px 0px;
    border-color: #d7effab3;
    padding: 15px;

    
  }

  table {
    
    table-layout: fixed;
  }

  th {
    text-wrap: nowrap;
  }


  .wcol {
    /* border:rgb(252, 252, 252);
    border-style: solid; */
    border-style:none;
    /* flex-grow: 1; */
    text-align: center;
    align-items: center;
    padding: 2px;
  }


  img {
    border-radius: 9px;
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
  }

  span {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
    padding: 0 !important;
    color: black;
    text-shadow: none;
  }

  .wrapText {
    inline-size: 190px;
    overflow-wrap: break-word;
    pointer-events: all;
  }

  .bottomInfoContainer {
    display:flex;
    flex-direction: row;
  }

  .bottomInfoContainer > * {
    padding-right: 50px;
  }

  .legendContainer {
    display:flex;
    flex-direction: column;
  }
  
  .legendItem {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .bottomLogo {
    width: 100%;
    height: auto;
    border-radius: 0px;
    padding: 20px;
  }




</style>
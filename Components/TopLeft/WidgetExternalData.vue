<template>
  <!-- Container -->
  <div id='widgetExternalData' ref='widgetExternalData'>


    <div>
      <div v-for="dT in dataTypesToShow" class="dataTypeContainer">
        <!-- Data name -->
        <span style="margin-right: 4px;">{{dT}}:</span>
        <!-- Data value -->
        <template v-if="dataValues[dT] !== undefined">
          <!-- Loading -->
          <div v-if='dataValues[dT].loading' class="spinner-border text-light" style="width: 1rem; height: 1rem; position: relative" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <!-- Direction -->
          <div v-else-if='dataValues[dT].direction'
            class="directionDataValueContainer"
            :style="{'transform': 'rotate('+ (dataValues[dT].value - 180 - 90) +'deg)'}" 
            :title="dataValues[dT].value.toFixed(2) + 'º'"><span>&#10140;</span>
          </div>
          <!-- Value -->
          <span v-else-if='!dataValues[dT].loading'> {{dataValues[dT].valueStr}} {{dataValues[dT].units}}</span>


        </template>
      </div>
    </div>

    <div class="extraButtonsContainer">
      <button @click="moreDataClicked"><span>{{$t('More data')}}</span></button>
      <button @click="regenerateClicked"><span>{{$t('Regenerate ocean')}}</span></button>
    </div>
  
    <!-- Date -->
    <div class="timeStringContainer" :title="currentDateHTML">
      <time-string ref="timeString" @changeSelectedDate="stepInTimeInHours"></time-string>
    </div>

    <!-- Location -->
    <span>{{$t('Latitude')}}: {{lat}} º, {{$t('Longitude')}}: {{long}} º</span>
    <!-- Data source attribution -->
    <span class="wrapText">{{$t('Data source')}}: <a class="widgetSpan clickable" title="Weather data source" :href="sourceDoi" target="_blank">E.U. CMEMS,
            Copernicus Marine Service</a></span>

    


  </div>
  </template>
  
  
  <script>
  
  // Import components
  import TimeString from "./TimeString.vue"

  export default {
    name: 'widgetExternalData', // Caps, no -
    created() {
      // Create data retriever
      this.dataRetriever = window.WMTSDataRetriever;

      // Create data object
      this.dataValues = {};
      this.dataRows.forEach(dr => {
        this.dataValues[dr.name] = {value: undefined, loading: true, key: dr.name};
      });
    },
    mounted() {
      // EVENTS
      window.eventBus.on('TimeString_SelectedDateChanged', (tmst) => {
        // Save current date
        this.currentDate = new Date(tmst);
        // Reset values
        Object.keys(this.dataValues).forEach(key => this.dataValues[key].loading = true);
        // Fetch data
        this.fetchExternalData();
      });

      // Create date
      let tmst = new Date().toISOString();
      tmst = tmst.substring(0,14) + '00:00.000Z'; // Hourly
      // Set date in time string, which generates global event
      this.$refs.timeString.setCurrentTmst(tmst); // --> it triggers TimeString_SelectedDateChanged
    },
    data (){
      return {
        // Icons
        // https://origin.fontawesome.com/search?o=r&m=free&f=classic
        isWidgetVisible: false,
        // Defaults
        sourceDoi: 'https://marine.copernicus.eu/',
        dataTypesToShow: [
          'Wave significant height',
          'Wave direction',
          'Wave period',
          'Wind wave significant height',
          'Wind wave direction'
        ],
        dataValues: {},
        currentDate: new Date(),





        dataRows: [
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
            color: '#6164ff', // TODO: color or colorScale. If color, go from transparent to the specified color.
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
          



          // {
          //   name: "Sea current direction",
          //   abbr: "Dir",
          //   units: "m/s",
          //   direction: true,
          //   layer: "Sea surface velocity",
          //   color: '#6164ff',//'#71c3eb',
          // },        {
          //   name: "Sea surface velocity",
          //   abbr: "Current",
          //   icon: true,
          //   units: "m/s",
          //   range: [0, 3],
          //   signRange: [0.25, 1],
          //   color: '#6164ff',//'#71c3eb',
          // },
          
        ],
        currentDateHTML: '',
        long: 1.345567,
        lat: 40.704597,
        longStr: '1.34',
        latStr: '40.70',
      }
    },
    methods: {
      // USER INTERACTION
      moreDataClicked: function(){
        window.eventBus.emit('OpenCentralPanel', "cmemsPanel");
      },
      regenerateClicked: function(){
        // Check if all data are loaded
        Object.keys(this.dataValues).forEach(key => {
          let dV = this.dataValues[key];
          if (dV.loading)
            return;
          else if (dV.value == 'x')
            return;
          else if (dV.value == undefined)
            return;
        })
        // Send event
        window.eventBus.emit('WidgetExternalData_CMEMSDataLoaded', this.dataValues);
      },
      // Event from time string
      stepInTimeInHours: function(hours){

      },


      // PRIVATE METHODS
      getData: async function(date, lat, long){
        let totalDataRows = this.dataRows.length;
        let count = 0;
        // Get data
        this.dataRows.forEach((rr, rIndex) => {
          let layerName = rr.direction ? rr.layer : rr.name;
          // Icon row does not load data
          if (layerName !== undefined){
            this.dataRetriever.getDataAtPoint(layerName, date.toISOString(), lat, long, 'h', rr.direction)
              .then(value => {
                if (value == undefined){
                  this.dataValues[rr.name].value = 'x';
                  this.dataValues[rr.name].loading = false;
                  return;
                }
                this.dataValues[rr.name].value = value;
                this.dataValues[rr.name].valueStr = value.toFixed(2);
                this.dataValues[rr.name].loading = false;
                this.dataValues[rr.name].units = rr.units;
                if (rr.direction)
                  this.dataValues[rr.name].direction = true;

                count++;
                if (count == totalDataRows)
                  this.allPromisesFinished();
              })
              .catch(error => {
                console.error("Can't get CMEMS-WMS " + layerName + " on " + date.getUTCFullYear() + "/" + (date.getMonth()+1) + "\nError: " + error);
                this.dataValues[rr.name].value = 'x';
                this.dataValues[rr.name].loading = false;
              })
          } // end of if
          

          
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

        // Update data
        this.getData(inputDate, lat, long);
      },


      fetchExternalData: function(){
        if (!this.isWidgetVisible)
          return
        let date = this.currentDate;
        this.updateTable(date, this.long, this.lat);
        return;
      },

      // Sends an event if all data values have been loaded and filled
      allPromisesFinished(){
        // Manually correct wind wave
        this.dataValues['Wind wave significant height'].value = Math.abs(this.dataValues['Wind wave significant height'].value);
        // Send event
        window.eventBus.emit('WidgetExternalData_CMEMSDataLoaded', this.dataValues);
      },


      // PUBLIC METHODS
      setVisible: function(isVisible){
        this.isWidgetVisible = isVisible;
        if (isVisible){
          // Update data
          this.fetchExternalData();
        } else {
          window.eventBus.emit('widgetExternalData_ClimaLayerChange', undefined);
        }
      }
  
    },
    components: {
      "time-string": TimeString,
    }
  }
  </script>
  
  
















  
  
  <style scoped>
  #widgetExternalData {
    z-index: 8;
    user-select: none;

    /* padding-top: 0px !important; */
    margin-top: -8px !important;

    max-height: 100%;

    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;

    padding: 10px 30px 20px 30px;
    border-radius: 10px;

    background:rgba(82, 181, 217, 0.5);
  }

  .dataTypeContainer {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .directionDataValueContainer{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    pointer-events: all;
  }

  .timeStringContainer {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .isShownInMobile {
    display: none;
  }
  .isHiddenInMobile {
    display: block;
  }


  .cLayerContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 2px;
    background: #0000003b;
    padding-right: 4px;
    border-radius: 30px;

    height: clamp(10px, 3vh, 30px);
  }

  span {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
    padding: 0 !important;
  }

  .wrapText {
    inline-size: 190px;
    overflow-wrap: break-word;
    pointer-events: all;
  }


  @media screen and (max-width: 500px), screen and (max-height: 850px) {
    /* TODO: ELEMENTS IN A ROW, AS IN WINDY */
    .cLayerIconOnly {
      background: none;
      padding: 0px;
      margin: 1px;
    }

    .horizontal-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      padding: 8px;
    }

    .isShownInMobile{
      display: block;
    }

    .isHiddenInMobile {
      display: none;
    }
    
  }
  
  
  </style>
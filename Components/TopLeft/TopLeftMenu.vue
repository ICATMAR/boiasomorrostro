<template>
  <div id="top-left-menu" class="top-left vertical-container">


    <!-- Wave -->
    <div class="horizontal-container clickable" @click="waveButtonClicked" :title="$i18n.t('waveButtonTitle')">
      
      <!-- Wave button -->
      <button class="roundButton icon-big icon-str clickable" :title="$i18n.t('waveButtonTitle')">
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
            <path id="Wave" class="svg-wavePath"
              d="M91,345a148.964,148.964,0,0,0,39-34c18.237-22.738,21.847-41.833,31.9-66.57C180.68,198.242,210.248,167.907,225,159c24.989-15.088,68.213-28.479,112-10,45.368,19.146,74.013,67.228,65,79-10.978,14.338-66.772-22.893-88-2-16.914,16.647-8.635,64.768,21,90,17.036,14.5,39.538,20.066,62,18" />
        </svg>
      </button>

      <span>{{$t('seaPanel.title')}}</span>
    </div>


    <!-- Wind -->
    <div class="horizontal-container clickable" @click="windButtonClicked" :title="$i18n.t('windButtonTitle')">
      <!-- Wind button-->
      <button class="roundButton icon-big icon-str clickable" :title="$i18n.t('windButtonTitle')">
        <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
          <path id="WindTop" class="svg-windPath"
            d="M117,178c96.486,32.553,201.682,46.769,260,0,20.145-16.156,26.414-30.873,26-41-1.07-26.169-36.825-52.812-63-45-9.183,2.741-23.774,11.71-23,25,0.6,10.338,10.406,20.516,25,23" />
          <path id="WindMiddle" class="svg-windPath"
            d="M64.388,323.7c66.094,22.349,138.154,32.108,178.1,0,13.8-11.092,18.094-21.2,17.81-28.148-0.733-17.966-25.226-36.257-43.155-30.894-6.291,1.882-16.286,8.04-15.756,17.163,0.413,7.1,7.129,14.085,17.126,15.791" />
          <path id="WindBottom" class="svg-windPath"
            d="M149,391c96.486,32.553,201.682,46.769,260,0,20.145-16.156,26.414-30.873,26-41-1.07-26.169-36.825-52.812-63-45-9.183,2.741-23.774,11.71-23,25,0.6,10.338,10.406,20.516,25,23" />
        </svg>
      </button>

      <span>{{$t('windPanel.title')}}</span>
    </div>

    
    <!-- External Data Button -->
    <div class="horizontal-container clickable widgetExternalData-container">
      <onOffButton ref="externalDataOnOffButton" :checked="false" :inSize="'14px'" @change="externalDataOnOff($event)"></onOffButton>
      <span @click="externalDataOnOff">{{$t('externalDataButton')}}</span>
    </div>
    <!-- External data widget -->
    <Transition>
      <widgetExternalData ref="widgetExternalData" v-show="isExternalDataMenuVisible"></widgetExternalData>
    </Transition>



  </div>
</template>





<script>

import OnOffButton from "../OnOffButton.vue";
import WidgetExternalData from "./WidgetExternalData.vue"

export default {
  name: "TopLeftMenu",
  created() {

  },
  mounted() {


  },
  data() {
    return {
      isExternalDataMenuVisible: false,
    }
  },
  methods: {
    // USER ACTIONS
    waveButtonClicked: function() {
      // Open central panel
      // Add information about which panel to open
      window.eventBus.emit('OpenCentralPanel', "seaPanel");
    },
    windButtonClicked: function () {
      // Open central panel
      // Add information about which panel to open
      window.eventBus.emit('OpenCentralPanel', "windPanel");
    },
    // External data on off
    externalDataOnOff: function(e){
      // OnOff Button was clicked
      if (e.target.value != undefined){ 
        this.isExternalDataMenuVisible = e.target.checked;
        // Activate widget
        this.$refs.widgetExternalData.setVisible(this.isExternalDataMenuVisible);
      } 
      // Text was clicked --> Invoke click on the element, which calls again this function
      else {
        this.$refs.externalDataOnOffButton.setChecked(!this.isExternalDataMenuVisible);
      }
    },
  },
  components: {
    "onOffButton": OnOffButton,
    "widgetExternalData": WidgetExternalData,
  }
}
</script>













<style scoped>
.top-left {
  margin: 0;
  position: absolute;
  top: calc(30px + clamp(70px, 7vw, 100px));;
  left: 30px;
}

.vertical-container {
  display: flex;
  flex-direction: column;
  width: fit-content;
  padding: 0;
  align-items: flex-start;

  pointer-events: none;
  user-select: none;
}

.horizontal-container {
  display: flex;
  flex-direction: row;
  padding: 0;
  align-items: center;
  margin-bottom: 10px;

  justify-content: flex-start;
  width: 100%;
}

.widgetExternalData-container {
  padding: 4px;
}




.roundButton {
  border-style: none;
  padding: 0;
  margin-bottom: 0px;
  border-radius:50%;
}

svg {
  width: 35px;
  height: 35px;
}


  /* Wave SVG */
.svg-wavePath {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}

/* Wind SVG */
.svg-windPath {
  fill: none;
  stroke: #1a1a1a;
  stroke-width: 20px;
  fill-rule: evenodd;
}





.v-enter-active {
  transition: all 0.3s ease-out;
}

.v-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.v-enter-from,
.v-leave-to {
  transform: translateX(20px);
  opacity: 0;
}



</style>
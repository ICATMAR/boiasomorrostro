<template>
  <!-- Container -->
  <div id="bottom-section" :class="[isSectionOpen ? isMenuFullscreen ? 'bottom-section-fullscreen' : 'bottom-section-open' : 'bottom-section-closed']">
    <!-- Button to open and close section -->
    <div class="section-opener-container">
      <button class="section-opener-button clickable" @click="bottomSectionClicked">
        <span>Menu</span>
        <span class="fa" :class="[isSectionOpen ? 'rotate180' : 'rotate0']">&#xf106;</span>
      </button>
    </div>


    <div class="menu-section-container" v-show="isSectionOpen">

      <!-- Cross and top-left icons -->
      <div class="horizontal top-left-icons">
        <i class="clickable close-x fa-solid fa-xmark" @click="closeClicked"></i>
        <i class="clickable close-x" :class="isMenuFullscreen ? 'fa-solid fa-compress' : 'fa-solid fa-expand'" @click="fullscreenClicked"></i>
      </div>

      <!-- Selected section -->
      <div class="section-content">
        <component :is="selectedSection.component" />
      </div>

      <!-- Bottom options -->
      <div class="horizontal wrap button-group bottom-bar">
        <button v-for="el in menu" :key="el.id" class="clickable"
          :class="{ 'selectedOption': $gui.selectedSection === el.id }"
          @click="$gui.selectedSection = el.id"><span>{{ $t(el.title) }}</span></button>
      </div>
    </div>
  </div>
</template>


<script>

// import DiscreteWaves from './BottomSection/DiscreteWavesPanel.vue';
// import SeaStateAnalysisPanel from './BottomSection/SeaStateAnalysisPanel.vue';
// import RenderStereoPanel from './BottomSection/RenderStereoPanel.vue';
// import RenderHeightPanel from './BottomSection/RenderHeightPanel.vue';

import RawData from './BottomSection/RawData.vue';
import DataSection from './BottomSection/DataSection.vue';
import MapBuoyLocation from './BottomSection/MapBuoyLocation.vue';
import AboutPanel from './BottomSection/AboutPanel.vue';


export default {
  name: "BottomSection",
  created() {},
  mounted() {

  },
  data () {
    return {
      isSectionOpen: true,
      isMenuFullscreen: false,
      // Menu structure. id is what the URL hash holds (see GUIManager)
      menu: [
        {
          title: 'Data',
          id: 'data',
          component: 'dataSection',
        },
        {
          title: 'Map',
          id: 'map',
          component: 'mapBuoyLocation'
        },
        {
          title: 'About',
          id: 'about',
          component: 'about',
        } // End of about
        // {
        //   title: 'Waves',
        //   icon: '&#xf773',
        //   children: [
        //     {
        //       title: 'Discrete waves',
        //       component: 'discrete-waves'
        //     },
        //     {
        //       title: 'Sea state analysis',
        //       icon: '&#xf201',
        //       component: 'sea-state-analysis'
        //     },
        //     {
        //       title: 'Generate sea state',
        //       icon: '&#xf1fe',
        //       component: 'generate-sea-state'
        //     }
        //   ]
        // }, // End of waves
        // {
        //   title: 'Export',
        //   icon: '&#xf56e',
        //   children: [
        //     {
        //       title: 'Export discrete waves (.json)',
        //       isClickEvent: true,
        //       event: () => {
        //         window.eventBus.emit('BottomSection_ExportWavesClicked');
        //       }
        //     },
        //     {
        //       title: 'Render heights (.png)',
        //       icon: '&#xf302',
        //       component: 'render-heights',
        //     },
        //     {
        //       title: 'Render stereo cameras (.png)',
        //       icon: '&#xf302',
        //       component: 'render-stereo',
        //     }
        //   ]
        // }, // End of export
        // {
        //   title: 'Scene',
        //   icon: '&#xf61f',
        //   children: [
        //     {
        //       title: 'Add/Remove objects',
        //       component: 'SceneObjects'
        //     },
        //     {
        //       title: 'Colors',
        //       component: 'SceneColors',
        //     },
        //     {
        //       title: 'Environment',
        //       component: 'SceneEnvironment'
        //     }
        //   ]
        // }, // End of scene
        // {
        //   title: 'About',
        //   icon: '&#xf05a',
        //   component: 'about'
        // } // End of about
      ] // End of menu
    }
  },
  methods: {
    // USER ACTIONS
    // Shows / Hides bottom section
    bottomSectionClicked: function (e){
      this.isSectionOpen = !this.isSectionOpen;
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 750);
    },
    // Top-left-icons
    closeClicked: function(){
      this.bottomSectionClicked();
    },
    fullscreenClicked: function(){
      this.isMenuFullscreen = !this.isMenuFullscreen;
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 750);
    },
  },
  computed: {
    // Menu entry of the section selected in the URL hash
    selectedSection: function(){
      return this.menu.find(el => el.id == this.$gui.selectedSection);
    },
  },
  components: {
    // "discrete-waves": DiscreteWaves,
    // "sea-state-analysis": SeaStateAnalysisPanel,
    // "render-heights": RenderHeightPanel,
    // "render-stereo": RenderStereoPanel,
    "rawData": RawData,
    "dataSection": DataSection,
    "mapBuoyLocation": MapBuoyLocation,
    "about": AboutPanel,
    
  }
}


</script>






<style scoped>
#bottom-section {
  position: relative;
  width: 100%;
  background: rgb(200 240 255);;
}

.bottom-section-open {
  height: 100%;
  transition: all 0.7s ease-in-out;
}
.bottom-section-fullscreen{
  height: 900%;
  transition: all 0.7s ease-in-out;
}

.bottom-section-closed {
  height: 0;
  transition: all 0.7s ease-in-out;
}

.section-opener-container {
  display: flex;
  justify-content: center;
  translate: 0px -60px;
  height: 0px;
}
.section-opener-container > button {
  height: 40px;
  padding-left: 20px;
  padding-right: 20px;
  border: solid;
}
.rotate0 {
  rotate: 0deg;
  transition: all 0.7s ease-in-out;
}
.rotate180 {
  rotate: 180deg;
  transition: all 0.7s ease-in-out;
}


.menu-section-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: absolute;
}

/* Above the section, like the cross of the VISOC data timeline */
.top-left-icons {
  position: absolute;
  top: -15px;
  left: 25px;
  gap: 8px;
  z-index: 12;
}

.section-content {
  flex: 1;
  overflow: auto;
  justify-items: center;
  width: 100%;
  min-height: 0;
}

.bottom-bar {
  border-top: 1px white solid;
  background: var(--blue);
}
.bottom-bar > * {
  padding-left: 10px;
  font-size: small;
}
</style>
<template>
  <!-- Container -->
  <div id="app-manager" ref="appManager">

    <!-- Canvas 3D -->
    <canvas3D></canvas3D>

    <!-- Left Icons -->
    <!-- <instruments-menu></instruments-menu> -->

    <!-- Bottom Bar -->

    <!-- Top right icons -->
    <top-right-menu></top-right-menu>

    <!-- Top left icons -->
    <top-left-menu></top-left-menu>

    <!-- <bottom-section></bottom-section> -->


    <!-- Central Panel -->
    <central-panel></central-panel>



    <!-- LEFT ICONS -->
    <a href="https://icatmar.cat/">
      <img class="logo clickable icatmar-logo" src="Assets/Logos/icatmar-mini-logo.svg">
    </a>
    <a href="https://icatmar.cat/visors/xarxa-observacional/">
      <img class="logo clickable obs-logo" src="Assets/Logos/ocea-mini-1.svg">
    </a>

    <!-- RIGHT ICONS -->
    <div class="top-right-icons-container">
      <!-- FPS button -->
      <div class="clickable icon-str" @click="fpsClicked">fps</div>
      <!-- github button -->
      <a href="https://github.com/ICATMAR/CasablancaBuoy" :title="$i18n.t('githubButton')" target="_blank">
        <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="clickable github-logo">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
      </a>
      <!-- information button -->
      <div class="clickable icon-str" @click="infoIconClicked" :title="$i18n.t('information')">i</div>
      <!-- language selector -->
      <language-selector></language-selector>

    </div>
    
  </div>
</template>



<script>


// Import components
import Canvas3D from "./Canvas3D.vue"
import InstrumentsMenu from "./Instruments/InstrumentsMenu.vue"
import TopRightMenu from "./TopRight/TopRightMenu.vue"
import TopLeftMenu from "./TopLeft/TopLeftMenu.vue"
import BottomSection from "./Bottom/BottomSection.vue"
import CentralPanel from "./CentralPanel.vue"
import LanguageSelector from "/CasablancaBuoy/Components/TopRight/LanguageSelector.vue"

export default {
  name: "AppManager",
  created() {
    
  },
  mounted() {
    // Mobile bottom bar full height fix
    // https://dev.to/admitkard/mobile-issue-with-100vh-height-100-100vh-3-solutions-3nae
    this.$refs.appManager.style.height = window.innerHeight + 'px';
    window.onresize =  () => {
      this.$refs.appManager.style.height = window.innerHeight + 'px';
    }; 
  },
  data (){
    return {

    }
  },
  methods: {
    //onclick: function(e){},
    infoIconClicked: function(){
      window.eventBus.emit('OpenCentralPanel', 'infoPanel');
    },
    fpsClicked: function() {
      window.eventBus.emit('AppManager_fpsButtonClicked');
    }
  },
  components: {
    "canvas3D": Canvas3D,
    "instruments-menu": InstrumentsMenu,
    "top-right-menu": TopRightMenu,
    "top-left-menu": TopLeftMenu,
    "bottom-section": BottomSection,
    "central-panel": CentralPanel,
    "language-selector": LanguageSelector,
  }
}
</script>


<style scoped>
#app-manager {
    width: 100vw;

    height: 100vh;
    position: fixed;
    /*height: 100%;
    position: absolute;*/

  }

  .logo {
  width: clamp(70px, 7vw, 100px);
  height: clamp(70px, 7vw, 100px);
  position: fixed;
  top: 10px;
  padding: 0px;
  margin: 0px;
  z-index: 10;
}

.icatmar-logo {
  left: 50px;
}

.obs-logo {
  left: clamp(110px, 9vw, 140px);
}

.top-right-icons-container{
  position: absolute;
  top: 6px;
  right: 10px;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.top-right-icons-container > * {
  width: 28px;
  height: 28px;

  padding: 0px;
  margin: 5px;
  z-index: 10;
}

.github-logo {
  background: white;
  border-radius: 50%;
  border-color: black !important;
  border-width: thick;
  border: double;
  width: 28px;
  height: 28px;
}

</style>
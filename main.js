// https://github.com/FranckFreiburger/vue3-sfc-loader
// https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/docs/examples.md#use-sfc-custom-blocks-for-i18n
import ca from '/boiasomorrostro/lang/ca.js';
import en from '/boiasomorrostro/lang/en.js';
import es from '/boiasomorrostro/lang/es.js';


// Location
window.LONGITUDE = 2.216194;
window.LATITUDE = 41.375694;
window.CMEMS_LONGITUDE = 2.207;
window.CMEMS_LATITUDE = 41.373;



// Load classes
// SceneManager
import SceneManager from "/boiasomorrostro/Assets/Scripts/SceneManager.js"
window.SceneManager = SceneManager;
// DataManager
// import DataManager from "/boiasomorrostro/Assets/Scripts/DataManager.js"
// window.DataManager = DataManager;

// Import WMTSDataRetriever
import WMTSDataRetrieverClass from './Assets/Scripts/WMTS/WMTSDataRetriever.js';
window.WMTSDataRetriever = new WMTSDataRetrieverClass();
// Import tile manager
import WMTSTileManagerClass from './Assets/Scripts/WMTS/WMTSTileManager.js'
window.WMTSTileManager = new WMTSTileManagerClass();


// Import AISManager
import AISManagerClass from './Assets/Scripts/AIS/AISManager.js';
window.AISManager = new AISManagerClass();

// Declare translations
const i18n = VueI18n.createI18n({
  // https://vue-i18n.intlify.dev/guide/essentials/fallback.html#explicit-fallback-with-one-locale
  silentTranslationWarn: true, 
  silentFallbackWarn: true,
  missingWarn: false,
  fallbackWarn: false,
});
// Declare event emitter
// https://github.com/developit/mitt
window.eventBus = window.mitt();

const options = {
  moduleCache: { vue: Vue },
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok)
      throw Object.assign(new Error(res.statusText + ' ' + url), { res });
    return {
      getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
    }
  },
  addStyle: (textContent) => {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  customBlockHandler(block, filename, options) {

    if (block.type !== 'i18n')
      return

    const messages = JSON.parse(block.content);
    for (let locale in messages)
      i18n.global.mergeLocaleMessage(locale, messages[locale]);
  }
}


const { loadModule } = window['vue3-sfc-loader'];

const app = Vue.createApp({
  components: {
    'app-manager': Vue.defineAsyncComponent(() => loadModule('/boiasomorrostro/Components/AppManager.vue', options)),
  },
  template: '<app-manager></app-manager>'
});

// Translations
i18n.global.mergeLocaleMessage('ca', ca);
i18n.global.mergeLocaleMessage('en', en);
i18n.global.mergeLocaleMessage('es', es);
app.use(i18n);
app.mount(document.body);
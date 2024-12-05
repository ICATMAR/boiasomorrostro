// https://github.com/FranckFreiburger/vue3-sfc-loader
// https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/docs/examples.md#use-sfc-custom-blocks-for-i18n
import ca from '/CasablancaBuoy/lang/ca.js';
import en from '/CasablancaBuoy/lang/en.js';
import es from '/CasablancaBuoy/lang/es.js';
// Load classes
// SceneManager
import SceneManager from "/CasablancaBuoy/Assets/Scripts/SceneManager.js"
window.SceneManager = SceneManager;
// DataManager
// import DataManager from "/CasablancaBuoy/data/DataManager.js"
// window.DataManager = DataManager;

// Import WMTSDataRetriever
import WMTSDataRetrieverClass from './Assets/Scripts/WMTSDataRetriever.js';
window.WMTSDataRetriever = new WMTSDataRetrieverClass();
// Import tile manager
import WMTSTileManagerClass from './Assets/Scripts/WMTSTileManager.js'
window.WMTSTileManager = new WMTSTileManagerClass();

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
    'app-manager': Vue.defineAsyncComponent(() => loadModule('/CasablancaBuoy/Components/AppManager.vue', options)),
  },
  template: '<app-manager></app-manager>'
});

// Translations
i18n.global.mergeLocaleMessage('ca', ca);
i18n.global.mergeLocaleMessage('en', en);
i18n.global.mergeLocaleMessage('es', es);
app.use(i18n);
app.mount(document.body);
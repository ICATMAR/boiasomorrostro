<template>

  <div class="language-dropdown-container">
    <div class="language-button-container">
      <button id="language-button" @click="dropdownClick" class="icon-str" :title="$i18n.t('languageButton')">

        <img class="lang-icon" src="/CasablancaBuoy/lang/en-200.png" v-show="$i18n.locale.includes('en')">
        <img class="lang-icon" src="/CasablancaBuoy/lang/es-200.png" v-show="$i18n.locale.includes('es')">
        <img class="lang-icon" src="/CasablancaBuoy/lang/ca-200.png" v-show="$i18n.locale.includes('ca')">
      
      </button>
    </div>
    <div ref="language-options-container" id="language-options-container" class="language-options-container">
      <div class="lgItem cat" value='ca' @click='changeLanguage' href="#">Català</div>
      <div class="lgItem es" value='es' @click='changeLanguage' href="#">Español</div>
      <div class="lgItem en" value='en' @click='changeLanguage' href="#">English</div>
    </div>
  </div>

</template>



<script>
export default {
  name: "language-selector",
  created(){
    // Set default navigator language
    this.$i18n.locale = navigator.language;
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (event.target.id.localeCompare('language-button') != 0) { // Element is not language button
        let container = document.getElementById("language-options-container");
        container.style.display = 'none';
      }
    }
  },
  mounted () {

  },
  data () {
    return {
      
    }
  },
  methods: {
    // INTERNAL EVENTS
    dropdownClick: function(){
      //this.$refs['language-options-container'].style.display = 'block';
      let container = document.getElementById("language-options-container");
        container.style.display = 'block';
    },
    // Change language
    changeLanguage: function(el){
      this.$i18n.locale = el.target.getAttribute('value');
    },
  },
  components: {

  },
  computed: {
  
  }
}

</script>


<style scoped>


.language-button-container{
  /* background-color: #ffffff74; */
  border-radius: 50%;
  padding: 3px;
  display: flex;
  justify-content: flex-end;
}


/* The container <div> - needed to position the dropdown content */
.language-dropdown-container {
  position: relative;
  display: inline-block;
  z-index: 0;
}

/* Dropdown Content (Hidden by Default) */
.language-options-container {
  display: none;
  right: 0px;
  position: absolute;
  background-color: #a0d7f2;;
  min-width: 140px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  margin-bottom: 10px;
}

/* Links inside the dropdown */
.language-options-container .lgItem {
  color: black;
  padding: 4px 4px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.language-options-container .lgItem:hover {
  background-color: #63c0ee;
  cursor: pointer;
}

/* Show the dropdown menu (use JS to add this class to the .language-options-container container when the user clicks on the dropdown button) */
.show {display:block;}

.lgItem:before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-right: 10px;
  margin-left: 10px;
  background-size: contain;
  background-repeat: no-repeat;
}

.es:before {
  content: '';
  background-image: url(/CasablancaBuoy/lang/es-200.png);
}

.en:before {
  content: '';
  background-image: url(/CasablancaBuoy/lang/en-200.png);
}
.cat:before {
  content: '';
  background-image: url(/CasablancaBuoy/lang/ca-200.png);
}

.lang-icon {
  width: 18px;
  pointer-events: none;
  box-shadow: 0px 0px 2px rgb(0, 0, 0);
}
</style>

<template>
  <div class="content">

    <!-- BUOY -->
    <div class="content-section" v-if="false">
      <h5>{{ $t('Buoy') }}</h5>
      <!-- Content -->
      <div>{{ $t('No data available') }}</div>
    </div>

    <!-- HF Radar -->
    <div class="content-section" v-if="false">
      <h5>{{ $t('Surface current from HF Radar') }}</h5>
      <!-- Content -->
      <div>{{ $t('Work in progress...') }}</div>
    </div>


    

    <!-- OPEN WEATHER API -->
    <div class="content-section">
      <h5>{{ $t('Open Weather API') }}</h5>
      <!-- Content -->
      <OpeanWeatherAPIWidget></OpeanWeatherAPIWidget>
    </div>

    <!-- CMEMS -->
    <div class="content-section">
      <h5>Copernicus Marine Service</h5>
      <!-- Content -->
      <WeatherWidget></WeatherWidget>
    </div>


    <!-- AIS -->
    <div class="content-section" v-if="false">
      <h5>{{ $t('Vessels from AIS') }}</h5>
      <!-- Content -->
      <div>{{ $t('Work in progress...') }}</div>
    </div>

  </div>
</template>


<script>
import WeatherWidget from "./DataSections/WeatherWidget.vue";
import OpeanWeatherAPIWidget from "./DataSections/OpeanWeatherAPIWidget.vue";

export default {
  name: "DataSection",
  data() {
    return {
      isLoading: true, // Flag to indicate loading state
      exists: false, // Flag to indicate if data exists
      isConnected: false, // Flag to indicate if connected to the buoy
      hasData: false, // Flag to indicate if data is available
    }
  },
  mounted() {


  },
  methods: {
    async fetchCSVData() {
      try {
      }
      catch (error) {
        console.error("Error fetching CSV data:", error);
      } finally {
        this.isLoading = false; // Set loading to false after fetching
      }
    },
  },
  components: {
    WeatherWidget,
    OpeanWeatherAPIWidget
  },
}
</script>


<style scoped>
.content {
  /* margin: min(20px, 2vw); */
  overflow: auto;
  font-size: small;
  max-width: 80vw;
  max-height: 100%;
  width: 100%;
}

.content-section {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 4px black;
  margin: 10px 10px 20px 10px;
}
</style>
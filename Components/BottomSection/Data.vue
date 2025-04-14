<template>
  <div class="content">

    <!-- BUOY -->
    <h3>Buoy</h3>
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading...</div>

    <!-- HF Radar -->
    <h3>High Frequency Radar</h3>
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading...</div>

    <!-- CMEMS -->
    <h3>CMEMS</h3>
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading...</div>
    <WeatherWidget></WeatherWidget>

    <!-- AIS -->
    <h3>Vessels from AIS</h3>
    <!-- Loading -->
    <div v-if="isLoading" class="loading">Loading...</div>

  </div>
</template>


<script>
import WeatherWidget from "./DataSections/WeatherWidget.vue";

export default {
  name: "Data",
  data() {
    return {
      isLoading: true, // Flag to indicate loading state
      exists: false, // Flag to indicate if data exists
      isConnected: false, // Flag to indicate if connected to the buoy
      hasData: false, // Flag to indicate if data is available
    }
  },
  mounted(){


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
  },
}
</script>


<style scoped>
.content {
  margin: min(20px, 2vw);
  overflow: auto;
  font-size: small;
  max-width: 80vw;
  max-height: 90%;
  width: 100%;
}
</style>
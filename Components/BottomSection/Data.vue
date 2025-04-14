<template>
  <div class="content">

    <!-- BUOY -->

    <!-- HF Radar -->

    <!-- CMEMS -->

    <!-- AIS -->

  </div>
</template>


<script>
export default {
  name: "Data",
  data() {
    return {
      isLoading: true, // Flag to indicate loading state
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
  }
}
</script>


<style scoped>
.content {
  margin: min(20px, 2vw);
  overflow: auto;
  font-size: small;
  max-width: 60vw;
  max-height: 90%;
}
</style>
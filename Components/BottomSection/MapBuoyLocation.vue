<template>
  <div id="map" class="map-container content"></div>
</template>

<script>
export default {
  name: "MapComponent",
  mounted() {
    debugger;
    // Ensure Leaflet is available globally via the script tag
    const map = L.map("map").setView([41.375694, 2.216194], 13); // Center at the given coordinates, zoom level 13

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add a pin at the specified coordinates
    L.marker([41.375694, 2.216194])
      .addTo(map)
      .bindPopup("Somorrostro buoy location")
      .openPopup();
  },
};
</script>

<style scoped>
.content {
  padding: 20px;
  font-size: small;
  max-width: 700px;
}

.map-container {
  height: 400px;
  width: 100%;
  margin: auto;
}
</style>
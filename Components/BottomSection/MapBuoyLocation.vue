<template>
  <div id="map" class="map-container"></div>
</template>

<script>
export default {
  name: "MapComponent",
  mounted() {
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
      .bindPopup(this.$i18n.t("Somorrostro buoy"))
      .openPopup();
  },
};
</script>

<style scoped>
.map-container {
  height: 400px;
  width: 60vw;
  margin: auto;
}
</style>
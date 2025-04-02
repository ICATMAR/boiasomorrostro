<template>
  <div id="map" class="map-container"></div>
</template>

<script>
export default {
  name: "MapComponent",
  mounted() {
    // Ensure Leaflet is available globally via the script tag
    let map = this.map = L.map("map").setView([41.375694, 2.216194], 13); // Center at the given coordinates, zoom level 13

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

    // Add bboxes
    if (window.AISManager) {
      window.AISManager.bboxes.forEach((bbox) => {
        const bounds = [
          [bbox[0][0], bbox[0][1]], // Southwest corner
          [bbox[1][0], bbox[1][1]]  // Northeast corner
        ];
        L.rectangle(bounds, { color: "#ff7800", weight: 1 }).addTo(map);
      });
    }

    // Add current ships
    this.markers = {};
    if (window.AISManager) {
      let ships = window.AISManager.getCurrentShips();
      
      Object.keys(ships).forEach((key) => {
        let shipInfo = ships[key];
        this.handleAISMessage(shipInfo);
      });
    }

    // EVENTS
    // AIS messages
    window.eventBus.on('AISManager_receivedAISMessage', this.handleAISMessage);
  },
  methods: {
    // Function to handle the received AIS messages
    handleAISMessage(shipInfo) {
      // Heading
      let heading;
      if (shipInfo.heading === 511) {
        if (shipInfo.empiricHeading) {
          heading = shipInfo.empiricHeading;
        } else {
          heading = 0;
        }
      } else {
        heading = shipInfo.heading;
      }


      if (this.markers[shipInfo.MMSI]) {
        let marker = this.markers[shipInfo.MMSI];
        // Position update
        marker.setLatLng([shipInfo.latitude, shipInfo.longitude]);

        // Content
        marker.setPopupContent(
          `<b>${shipInfo.shipName}</b><br>
          <b>MMSI:</b> ${shipInfo.MMSI}<br>
          <b>Heading:</b> ${heading}°<br>
          <b>SOG:</b> ${shipInfo.sog} knots<br>
          <b>Type:</b> ${shipInfo.shipType}<br>
          <b>Messages:</b> ${shipInfo.typeOfMessages.join(", ")}<br>
          <b>Dimensions:</b> ${shipInfo.length} x ${shipInfo.beam} m<br>
          <b>Last Updated:</b><span id="last-update"></span>`);
      }
      // Marker is new
      else {
        // Create New Ship Marker
        const icon = L.divIcon({
          html: `<div class="boat" style="transform: rotate(${heading}deg);"></div>`,
          className: '',
          iconSize: [30, 30]
        });

        const marker = L.marker([shipInfo.latitude, shipInfo.longitude], { icon }).addTo(this.map)
        marker.bindPopup(
          `<b>${shipInfo.shipName}</b><br>
          <b>MMSI:</b> ${shipInfo.MMSI}<br>
          <b>Heading:</b> ${heading}°<br>
          <b>SOG:</b> ${shipInfo.sog} knots<br>
          <b>Type:</b> ${shipInfo.shipType}<br>
          <b>Messages:</b> ${shipInfo.typeOfMessages.join(", ")}<br>
          <b>Dimensions:</b> ${shipInfo.length} x ${shipInfo.beam} m<br>
          <b>Last Updated:</b><span id="last-update"></span>`);

        this.markers[shipInfo.MMSI] = marker;
        marker.getElement().classList.add('ship-marker');
      }
      // Marker style
      let shipMarkerStyle = this.markers[shipInfo.MMSI].getElement().children[0].style;
      // Heading
      shipMarkerStyle.transform = `rotate(${heading}deg)`;
      // Dimensions
      shipMarkerStyle.width = `${shipInfo.beam * 0.5}px`;
      shipMarkerStyle.height = `${shipInfo.length * 0.5}px`;

    },
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
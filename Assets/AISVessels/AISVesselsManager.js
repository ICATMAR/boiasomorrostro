import { VesselEntity, TankerVesselEntity, CargoVesselEntity, CruiseBigEntity } from "./VesselEntity.js";

class AISVesselsManager {

  constructor(scene, LONGITUDE, LATITUDE) {
    // Store scene
    this.scene = scene;
    // Set longitude and latitude
    this.LONGITUDE = LONGITUDE;
    this.LATITUDE = LATITUDE;

    // Add current ships
    this.ships = {};
    if (window.AISManager) {
      let aisShips = window.AISManager.getCurrentShips();

      Object.keys(aisShips).forEach((key) => {
        let shipInfo = aisShips[key];
        // Create ship entity
        this.createShip(shipInfo, scene);
      });


      // Manage new messages
      // EVENTS
      // AIS messages
      window.eventBus.on('AISManager_receivedAISMessage', this.handleAISMessage);
    }
  }

  // Update
  update(dt) {
    Object.keys(this.ships).forEach((key) => {
      this.ships[key].update(dt);
    });
  }


  handleAISMessage = (shipInfo) => {
    // Heading correction
    let heading;
    if (shipInfo.heading === 511) {
      if (shipInfo.empiricHeading) {
        heading = shipInfo.empiricHeading.toFixed(0);
      } else {
        heading = 511;
      }
    } else {
      heading = shipInfo.heading;
    }

    // Create new ship if it doesn't exist
    if (this.ships[shipInfo.MMSI] == undefined) {
      this.createShip(shipInfo, this.scene);
    }
    // Update ship
    else {
      //this.ships[shipInfo.MMSI].setShipPosition(this.LONGITUDE, this.LATITUDE, shipInfo.longitude, shipInfo.latitude);
      this.ships[shipInfo.MMSI].setShipOrientation(heading);
      this.ships[shipInfo.MMSI].setShipSOG(shipInfo.sog);
      this.ships[shipInfo.MMSI].setShipDimensions(shipInfo.length, shipInfo.beam);
    }
  }



  createShip = (shipInfo, scene) => {
    // Create ship entity
    let shipEntity

    // Check ship type and create appropriate entity
    let shipType = shipInfo.shipType || "Unknown";

    const onLoadShip = () => {
      // Set ship position
      shipEntity.setShipPosition(this.LONGITUDE, this.LATITUDE, shipInfo.longitude, shipInfo.latitude);
      // Set ship orientation
      shipEntity.setShipOrientation(shipInfo.heading);
      // Set ship speed-over-ground
      shipEntity.setShipSOG(shipInfo.sog);
    }

    if (shipType.includes("Cargo")) {
      shipEntity = new CargoVesselEntity(scene, shipInfo, onLoadShip);
    }
    else if (shipType.includes("Tanker")) {
      shipEntity = new TankerVesselEntity(scene, shipInfo, onLoadShip);
    }
    else if (shipType.includes("Passenger")) { // TODO: small passenger ships
      shipEntity = new CruiseBigEntity(scene, shipInfo, onLoadShip);
    }
    else {
      // Create default ship entity
      shipEntity = new VesselEntity(scene, shipInfo, onLoadShip);
    }


    // Add ship to ships list
    this.ships[shipInfo.MMSI] = shipEntity;
  }

}


export { AISVesselsManager };
import * as THREE from 'three';
import { OBJLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/GLTFLoader.js';
class BoatEntity {

  isLoaded = false;
  sog = 0; // Speed over ground
  scale = 1; // Scale factor for position calculation
  gltfURL = '/boiasomorrostro/Assets/AISBoats/Objects/TankerNormXY.glb'; // Default gltf URL

  // shipType: https://api.vtexplorer.com/docs/ref-aistypes.html
  constructor(scene, shipInfo, onload, gltfURL) {
    // gltfURL    
    this.gltfURL = gltfURL || this.gltfURL; // Use provided URL or default
    // Load
    this.load(scene, shipInfo, onload);
  }

  // Default load function
  load = (scene, shipInfo, onload) => {
    // Load the model and add it to the scene
    const manager = new THREE.LoadingManager(); // Empty manager
    //const loader = new OBJLoader(manager);
    this.loader = new GLTFLoader(manager);
    // TODO: use shipType to load different models
    //loader.load('/boiasomorrostro/Assets/AISBoats/Boat.obj', (obj) => {
    this.loader.load(this.gltfURL, (obj) => { // '../Assets/Skybox/skybox.glb'
      this.addToScene(obj, scene, shipInfo, onload);
    });
  }


  // Add object to scene
  addToScene = (obj, scene, shipInfo, onload) => {
    // Scene
    this.root = obj.scene;

    scene.add(this.root);
    this.isLoaded = true;
    if (onload)
      onload();
  }




  setShipPosition = (long0, lat0, longitude, latitude) => {
    if (!this.isLoaded)
      return;

    const R = 6371000; // Earth's radius in meters (approx)
    // Convert degrees to meters (approximate for small areas)
    const deltaLat = (latitude - lat0) * (Math.PI / 180) * R;
    const deltaLon = (longitude - long0) * (Math.PI / 180) * R * Math.cos(lat0 * Math.PI / 180);

    // Set ship position
    this.root.position.set(deltaLon * this.scale, 0, -deltaLat * this.scale);
  }


  setShipOrientation = (heading) => {
    if (!this.isLoaded)
      return;
    // Set ship orientation
    this.root.rotation.y = -THREE.MathUtils.degToRad(heading - 90);
  }

  setShipSOG = (sog) => {
    if (!this.isLoaded)
      return;
    // Set ship speed-over-ground
    this.sog = sog;
  }

  setShipDimensions = (length, beam) => {
    
    if (!this.isLoaded)
      return;

    // Default boat dimensions
    if (length < 0 || beam < 0) {
      length = 12;
      beam = 4;
    }

    // Set ship dimensions
    this.root.scale.set(length, 1, beam);
  }



  update = (dt) => {
    // Update ship position
    if (this.isLoaded) {
      // Update ship position based on speed and heading
      // Convert speed from knots to meters per second
      const speedInMetersPerSecond = this.sog * 0.514444; // 1 knot = 0.514444 m/s
      this.root.position.x += Math.sin(this.root.rotation.y) * speedInMetersPerSecond * dt * this.scale;
      this.root.position.z += Math.cos(this.root.rotation.y) * speedInMetersPerSecond * dt * this.scale;
    }
  }




  getRandomColor = () => {
    // Generate random HSL values with controlled saturation and lightness
    const hue = Math.random();
    const saturation = Math.random() * 0.5 + 0.5; // Saturation between 0.5 and 1
    const lightness = Math.random() * 0.5 + 0.3; // Lightness between 0.3 and 0.8

    const color = new THREE.Color();
    color.setHSL(hue, saturation, lightness);

    return color;
  }
}



// TANKER
class TankerBoatEntity extends BoatEntity {

  constructor(scene, shipInfo, onload) {
    // gltf URL
    let gltfURL = '/boiasomorrostro/Assets/AISBoats/Objects/TankerNormXY.glb';
    super(scene, shipInfo, onload, gltfURL);
  }

  // Load function
  addToScene = (obj, scene, shipInfo, onload) => {
    console.log("🚢 AIS Tanker added to scene");
    // Scene
    this.root = obj.scene;

    // Default tanker dimensions
    let length = shipInfo.length;
    let beam = shipInfo.beam;
    if (length < 0 || beam < 0) {
      length = 160;
      beam = 25;
    }

    // Set ship dimensions
    this.setShipDimensions(length, beam);


    scene.add(this.root);
    this.isLoaded = true;
    if (onload)
      onload();
  }


  
  setShipDimensions = (length, beam) => {
    if (!this.isLoaded)
      return;
    // Set ship dimensions
    this.root.scale.set(length, 1, beam);
  }
}





// CARGO
class CargoBoatEntity extends BoatEntity {

  offsetX = 13; // Offset for X position
  offsetY = 15.58; // Offset for Y position
  offsetZ = 0; // Offset for Z position

  constructor(scene, shipInfo, onload) {
    // gltf URL
    let gltfURL = '/boiasomorrostro/Assets/AISBoats/Objects/CargoNormXY_BridgeNormY.glb';
    super(scene, shipInfo, onload, gltfURL);
  }

  // Load function
  addToScene = (obj, scene, shipInfo, onload) => {
    console.log("🚢 AIS Cargo added to scene");
    // Scene
    this.root = obj.scene;

    // Apply scale
    // Default boat dimensions
    let length = shipInfo.length;
    let beam = shipInfo.beam;
    if (length < 0 || beam < 0) {
      length = 250;
      beam = 50;
    }

    // Set ship dimensions
    this.setShipDimensions(length, beam);

    // // Create containers
    // ONLY WHEN USER IS VERY CLOSE? GENERATE AUTOMATICALLY CONTAINERS
    // // Calculate number of available containers and build matrix
    // const containerLength = 6; // Length of each container
    // const containerWidth = 2.5; // Width of each container
    // const containerHeight = 2.6; // Height of each container

    // const numInBeam = Math.floor(beam / containerWidth); // Number of containers in beam
    // const numInLength = Math.floor(length * 0.7 / containerLength); // Number of containers in length

    // // Build matrix of containers
    // let maxPile = Math.round(Math.max(length / 35, 3));
    // const containerMatrix = [];
    // for (let i = 0; i < numInLength; i++) {
    //   const row = [];
    //   for (let j = 0; j < numInBeam; j++) {
    //     let numContainersPiled = Math.round(maxPile * Math.random()); // Number of containers piled in this position
    //     row.push(numContainersPiled);
    //     for (let k = 0; k < numContainersPiled; k++) {
    //       // Create containers...
    //       const containerGeometry = new THREE.BoxGeometry(containerLength, containerHeight, containerWidth);
    //       const containerMaterial = new THREE.MeshStandardMaterial({ color: this.getRandomColor() });
    //       const container = new THREE.Mesh(containerGeometry, containerMaterial);
    //       container.position.set((i - numInLength / 2) * containerLength + this.offsetX + length / 2, k * containerHeight + this.offsetY + containerHeight / 2, (j - numInBeam / 2) * containerWidth + containerWidth / 2 + this.offsetZ);
    //       //row.push(container);
    //       this.root.add(container); // Add to root object
    //     }
    //   }
    //   containerMatrix.push(row);
    // }



    scene.add(this.root);
    this.isLoaded = true;
    if (onload)
      onload();

  }


  // Set ship dimensions
  setShipDimensions = (length, beam) => {
    if (!this.isLoaded)
      return;
    // Apply XY scale to Cargo
    this.root.getObjectByName('Cargo').scale.set(length, 1, beam);
    // Apply Y scale to Bridge
    this.root.getObjectByName('Bridge').scale.set(1, 1, beam / 2);
  }


}

export { BoatEntity, TankerBoatEntity, CargoBoatEntity }
import * as THREE from 'three';
import { OBJLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/GLTFLoader.js';

class BoatEntity {

  isLoaded = false;
  sog = 0; // Speed over ground
  scale = 1; // Scale factor for position calculation
  gltfURL = '/boiasomorrostro/Assets/AISBoats/Objects/TankerNormXY.glb'; // Default gltf URL

  // shipType: https://api.vtexplorer.com/docs/ref-aistypes.html
  constructor(scene, shipInfo, onload) {
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
    this.root.rotation.y = -THREE.MathUtils.degToRad(heading);
  }

  setShipSOG = (sog) => {
    if (!this.isLoaded)
      return;
    // Set ship speed-over-ground
    this.sog = sog;
  }

  setShipDimensions = (length, beam) => {
    return;
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

  // gltf URL
  gltfURL = '/boiasomorrostro/Assets/AISBoats/Objects/TankerNormXY.glb';

  constructor(scene, shipInfo, onload) {
    console.log(this.gltfURL);
    super(scene, shipInfo, onload);
  }

  // Load function
  addToScene = (obj, scene, shipInfo, onload) => {
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
    this.root.scale.set(length, 1, beam);


    scene.add(this.root);
    this.isLoaded = true;
    if (onload)
      onload();
  }
}





// CARGO
class CargoBoatEntity extends BoatEntity {

  // gltf URL
  gltfURL = '/boiasomorrostro/Assets/AISBoats/Objects/CargoNormXY_BridgeNormY.glb';

  constructor(scene, shipInfo, onload) {
    super(scene, shipInfo, onload);
  }

  // Load function
  addToScene = (obj, scene, shipInfo, onload) => {
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
    // Apply XY scale to Cargo
    this.root.getObjectByName('Cargo').scale.set(length, 1, beam);
    // Apply Y scale to Bridge
    this.root.getObjectByName('Bridge').scale.set(1, 1, beam);

    // Create containers with colors
    // Create containers...
    const containerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const containerMaterial = new THREE.MeshStandardMaterial({ color: this.getRandomColor() });

    // Random color
    // Apply random colors to the meshes
    // this.root.traverse((child) => {
    //   if (child instanceof THREE.Mesh) {
    //     // Generate random HSL values with controlled saturation and lightness
    //     const hue = Math.random();
    //     const saturation = Math.random() * 0.5 + 0.5; // Saturation between 0.5 and 1
    //     const lightness = Math.random() * 0.5 + 0.3; // Lightness between 0.3 and 0.8

    //     const color = new THREE.Color();
    //     color.setHSL(hue, saturation, lightness);

    //     child.material = new THREE.MeshStandardMaterial({ color: color });
    //   }
    // });

    scene.add(this.root);
    this.isLoaded = true;
    if (onload)
      onload();

  }


}

export {BoatEntity, TankerBoatEntity, CargoBoatEntity }
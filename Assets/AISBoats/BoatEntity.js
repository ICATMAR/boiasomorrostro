import * as THREE from 'three';
import { OBJLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/GLTFLoader.js';

class BoatEntity {

  isLoaded = false;
  sog = 0; // Speed over ground
  scale = 1; // Scale factor for position calculation

  // shipType: https://api.vtexplorer.com/docs/ref-aistypes.html
  constructor(scene, shipType, onload) {

    const manager = new THREE.LoadingManager(); // Empty manager

    //const loader = new OBJLoader(manager);
    const loader = new GLTFLoader(manager);
    // TODO: use shipType to load different models
    //loader.load('/boiasomorrostro/Assets/AISBoats/Boat.obj', (obj) => {
    loader.load('/boiasomorrostro/Assets/AISBoats/Objects/TankerNormXY.glb', (obj) => { // '../Assets/Skybox/skybox.glb'
      // Scene
      this.root = obj.scene;

    ;
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
    });
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

}


export { BoatEntity }
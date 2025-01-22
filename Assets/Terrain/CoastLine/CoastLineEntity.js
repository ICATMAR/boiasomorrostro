import * as THREE from 'three';
import { GLTFLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/GLTFLoader.js';


class CoastLineEntity {

  constructor(scene) {
    const manager = new THREE.LoadingManager(); // Empty manager
    const gltfLoader = new GLTFLoader(manager);
    gltfLoader.load('/boiasomorrostro/Assets/Terrain/CoastLine/CoastLine.glb', (gltf) => { // '../Assets/Skybox/skybox.glb'
      // GLTF scene
      const root = gltf.scene;
      // Scale
      //root.scale.multiplyScalar(0.1);
      // Scene direction fix
      const angleFix = 90;
      root.rotation.y = angleFix * Math.PI / 180;
      //root.position.y = -1;

      scene.add(root);
    });
  }
}

export {CoastLineEntity}
import * as THREE from 'three';
import { GLTFLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/GLTFLoader.js';

class SomorrostroBuoyEntity {

  isLoaded = false;

  constructor(scene){
    // https://www.youtube.com/watch?v=6LA8vEB47Nk&ab_channel=DirkTeucher
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/boiasomorrostro/Assets/SomorrostroBuoy/SomorrostroBuoy.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;

      this.root = root;
      

      this.root.children[0].translateY(-0.5);


      

      scene.add(root);
      this.isLoaded = true;

    });
  }
}

export { SomorrostroBuoyEntity }
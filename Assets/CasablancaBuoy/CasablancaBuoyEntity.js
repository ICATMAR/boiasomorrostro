import * as THREE from 'three';
import { GLTFLoader } from '/CasablancaBuoy/lib/three.js/examples/jsm/loaders/GLTFLoader.js';

class CasablancaBuoyEntity {

  isLoaded = false;

  constructor(scene){
    // https://www.youtube.com/watch?v=6LA8vEB47Nk&ab_channel=DirkTeucher
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/CasablancaBuoy/Assets/CasablancaBuoy/CasablancaBuoy.glb', (gltf) => {
      // GLTF scene
      const root = gltf.scene;
      // Fix frustrum culling
      root.children[0].frustumCulled = false;
      // Scene direction fix
      const angleFix = 90;

      root.rotation.y = angleFix * Math.PI / 180;

      this.root = root;

      // Move upwards all children objects
      root.children.forEach(ch => {
        if (ch.name == 'UPC_textFront')
        ch.translateZ(-0.3);
        else
          ch.translateY(0.3);
      
      });
      

      scene.add(root);
      this.isLoaded = true;

    });
  }
}

export { CasablancaBuoyEntity }
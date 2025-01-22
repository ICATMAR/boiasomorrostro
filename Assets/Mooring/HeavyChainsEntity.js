import * as THREE from 'three';
import { FBXLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/FBXLoader.js';

class HeavyChainsEntity {

  isLoaded = false;

  constructor(scene, onload){
    const manager = new THREE.LoadingManager(); // Empty manager
    // https://www.youtube.com/watch?v=6LA8vEB47Nk&ab_channel=DirkTeucher
    const loader = new FBXLoader(manager);
    loader.load('/boiasomorrostro/Assets/Mooring/HeavyChains.fbx', (fbx) => {
      // Scene
      this.root = fbx;

      // Iterate meshes
      this.root.children.forEach(ch => {
        // Fix material (BigChain)
        if (ch.geometry.name == 'ChainBig'){
          let mat = ch.material;
          if (this.normalMap == undefined){
            this.normalMap = new THREE.TextureLoader(manager).load('/boiasomorrostro/Assets/Mooring/normalMap.png');
            this.aoMap = new THREE.TextureLoader(manager).load('/boiasomorrostro/Assets/Mooring/AOMap.png');
            this.aoMap.flipY = false;
          }
          mat.normalMap = this.normalMap;
          mat.shininess = 0;
          mat.aoMap = this.aoMap;
          mat.aoMapIntensity = 1;
        }
      })

      // Create bottom ambient occlusion
      const planeGeom = new THREE.PlaneGeometry(4, 4);
      const planeMat = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader(manager).load('/boiasomorrostro/Assets/Mooring/AOBottom_alpha.png'),
        transparent: true,
        metalness: 0,
        roughness: 1,
        renderOrder: 1,
      });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.rotation.x = Math.PI * -.5;
      this.root.add(plane);


      scene.add(this.root);
      this.isLoaded = true;
      if (onload)
        onload();
    });
  }
}

export { HeavyChainsEntity }
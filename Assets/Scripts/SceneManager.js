import * as THREE from 'three';
import Stats from '/boiasomorrostro/lib/three.js/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '/boiasomorrostro/lib/three.js/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from '/boiasomorrostro/lib/three.js/examples/jsm/loaders/FBXLoader.js'
import { RosaVentsEntity } from '/boiasomorrostro/Assets/Orientation/RosaVentsEntity.js';
import { SandEntity } from '/boiasomorrostro/Assets/Terrain/SandEntity.js';
import { SkyboxEntity } from '/boiasomorrostro/Assets/Skybox/SkyboxEntity.js';
// CoastLine
import { CoastLineEntity } from '/boiasomorrostro/Assets/Terrain/CoastLine/CoastLineEntity.js';


import * as FogShader from '/boiasomorrostro/Assets/Terrain/FogShader.js'
import { OceanEntity } from '/boiasomorrostro/Assets/Ocean/OceanEntity.js';

import { SomorrostroBuoyEntity } from '/boiasomorrostro/Assets/SomorrostroBuoy/SomorrostroBuoyEntity.js';
import { HeavyChainsEntity } from '/boiasomorrostro/Assets/Mooring/HeavyChainsEntity.js';


//import { WindsockEntity } from '/boiasomorrostro/Assets/Windsock/WindsockEntity.js';
import { FlagEntity } from '/boiasomorrostro/Assets/Flag/FlagEntity.js';
import { CurrentEntity } from '/boiasomorrostro/Assets/Current/CurrentEntity.js';
import { TextMeshEntity } from '/boiasomorrostro/Assets/TextMesh/TextMeshEntity.js';

// AIS Vessels
import { AISVesselsManager } from '/boiasomorrostro/Assets/AISVessels/AISVesselsManager.js';


class SceneManager{

  stats;
  prevTime = 0;
  LONGITUDE = window.LONGITUDE; // Somorrostro longitude
  LATITUDE = window.LATITUDE; // Somorrostro latitude
  

  constructor(canvas){
    // Add loading screen
    this.addLoadingScreen();
    
    // Cache
    THREE.Cache.enabled = false;

    //const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer = renderer;

    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.5;
    const far = 100000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera = camera;

    // CAMERA CONTROLS
    const controls = new OrbitControls(camera, canvas);
    this.controls = controls;
    // TODO: limit orbit controls
    // Surface
    camera.position.set(5, 3, 5);
    controls.target.set(0, 1, 0);

    controls.update();
    controls.enableDamping = true;
  // controls.autoRotate = true;
  // controls.autoRotateSpeed = 1;

    // STATS
    let stats = new Stats();
    this.stats = stats;
    document.body.appendChild(stats.dom);
    stats.dom.style.right = null;
    stats.dom.style.left = '0px';
    stats.isVisible = false;
    stats.showPanel(false);
    
    






    // SCENE
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.background = new THREE.Color(0x47A0B9);
    this.scene.camera = this.camera;

    // Fog
    scene.fog = new THREE.FogExp2(new THREE.Color(0x47A0B9), 0.02);
    // Fog only below water
    THREE.ShaderChunk.fog_fragment = FogShader.fogFrag;
    THREE.ShaderChunk.fog_pars_fragment = FogShader.fogFragParams;
    THREE.ShaderChunk.fog_vertex = FogShader.fogVertex;
    THREE.ShaderChunk.fog_pars_vertex = FogShader.fogVertexParams;
    // AO shader fix
    THREE.ShaderChunk.aomap_fragment = `
    #ifdef USE_AOMAP
      float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r ) * aoMapIntensity ;
      reflectedLight.directDiffuse *= ambientOcclusion;
      reflectedLight.indirectDiffuse *= ambientOcclusion;
      reflectedLight.directSpecular *= ambientOcclusion;
      reflectedLight.indirectSpecular *= ambientOcclusion;
      #if defined( USE_ENVMAP ) && defined( STANDARD )
        float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
        reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
      #endif
    #endif`

    // Skybox
    this.skybox = new SkyboxEntity(scene);
    
    // Coastline
    this.coastLine = new CoastLineEntity(scene);
  

    // Ocean
    this.ocean = new OceanEntity(scene);
    // Buoy
    this.somorrostroBuoy = new SomorrostroBuoyEntity(scene);

    // Flag
    this.flag = new FlagEntity(scene, () => {
      this.flag.root.position.y = -1;
    });


    // Mooring
    this.mooring = new HeavyChainsEntity(scene, () => {
      this.mooring.root.position.y = -42.8;
    });
    
    // Sand
    this.sand = new SandEntity(scene);
    this.sand.mesh.position.y = -43;

    // Rosa dels vents
    //his.rosaVents = new RosaVentsEntity(scene);
    //this.rosaVents.root.position.y = 3.5;
    
    // Sea velocity, currents
    this.currents = new CurrentEntity(scene);


    // AIS Vessels
    this.aisVesselsManager = new AISVesselsManager(scene, this.LONGITUDE, this.LATITUDE);



    // SCENE TEXT
    // SURFACE
    // Wind text mesh
    // this.windText = new TextMeshEntity(scene, "", 0.25, 0x000000, () => {
    //   this.windText.textObj.position.y = 3;
    // });
    // Orientation text meshes
    this.Ntext = new TextMeshEntity(scene, "N", 0.5, 0xff0000, () => {
      this.Ntext.textObj.rotation.x = -Math.PI / 2;
      this.Ntext.textObj.position.y = 1;
      this.Ntext.textObj.position.z = -4;
    });
    this.Stext = new TextMeshEntity(scene, "S", 0.5, 0xffffff, () => {
      this.Stext.textObj.rotation.x = -Math.PI / 2;
      this.Stext.textObj.position.y = 1;
      this.Stext.textObj.position.z = 4;
    });



    { // LIGHT
      const skyColor = 0xB1E1FF;  // light blue
      const groundColor = 0x2090b9;  // blue
      const intensity = 0.6;
      const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
      scene.add(light);
    }

    { // LIGHT
      const color = 0xFFFFFF;
      const intensity = 0.8;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 10, 0);
      light.target.position.set(-5, 0, 0);
      scene.add(light);
      scene.add(light.target);
    }


  }



  // ADD LOADING SCREEN
  addLoadingScreen = function(){
    // Create
    let loadDiv = document.createElement("div");
    loadDiv.style.width = '100vw';//document.body.clientWidth + 'px';
    loadDiv.style.height = '100vh';//document.body.clientHeight + 'px';
    // Style
    loadDiv.style.background = 'radial-gradient(rgba(160, 215, 242, 0.95) 0%, rgba(0, 90, 134, 0.95) 100%';
    loadDiv.style.position = 'absolute';
    loadDiv.style.display = 'flex';
    loadDiv.style["flex-direction"] = 'column';
    loadDiv.style["justify-content"] = 'center';
    loadDiv.style['align-items'] = 'center';
    loadDiv.style['transition'] = 'all 1.5s ease-in-out';

    // Create image logo
    let loadingImg = document.createElement("img");
    loadingImg.src = "/boiasomorrostro/Assets/Logos/icatmar-mini-logo.svg";
    loadingImg.style['max-width'] = '40vw';
    loadingImg.style['max-height'] = '130px';//'18%';

    // Create progress bar
    let progress = document.createElement('div');
    let progressBar = document.createElement('div');
    progressBar.className = 'progressBarLoadScreen';
    progress.appendChild(progressBar);
    progress.style = `
      margin-top: 20px;
      width: 70vw;
      height: 20px;
      background: rgba(40, 122, 163, 1);
      border: none;
      border-radius: 10px`;
    progressBar.style = `width: 70vw;
      height: 20px;
      background: rgba(11, 85, 122, 1);
      border: none;
      border-radius: 10px`;

    // Create sponsors logos
    let sponsorsImg = document.createElement("img");
    sponsorsImg.src = "/boiasomorrostro/img/Logos.png";
    sponsorsImg.style['max-width'] = '100%';
    sponsorsImg.style['max-height'] = '20%';
    sponsorsImg.style.bottom = '10px';
    sponsorsImg.style.position = 'absolute';

    // Add to div
    loadDiv.appendChild(loadingImg);
    loadDiv.appendChild(progress);
    loadDiv.appendChild(sponsorsImg);
    // Add to body
    document.body.appendChild(loadDiv);


    // Load manager
    THREE.DefaultLoadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
      console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    THREE.DefaultLoadingManager.onLoad = function () {
      console.log('Loading Complete!');
      if (loadDiv.parentElement != null){
        loadDiv.style.opacity = 0;
        setTimeout(() => document.body.removeChild(loadDiv), 1300);
        
      }
      // Emit event
      window.eventBus.emit('SceneManager_LoadingComplete');
      // TODO: For some reason the files appear to be loaded twice?
    };
    THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
      console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
      progressBar.style.width = (itemsLoaded / itemsTotal * 100) + '%';
    };

    THREE.DefaultLoadingManager.onError = function (url) {
      console.log('There was an error loading ' + url);
    };
  }




  // USER INTERACTIONS
  // Reposition camera
  focusOnBuoy = function(){
    // Tween camera position
    new TWEEN.Tween(this.camera.position)
      .to({ x: 15, y: 10, z: 15 }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    // Tween camera target
    new TWEEN.Tween(this.controls.target)
      .to({ x: 0, y: 1, z: 0 }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => this.controls.update())
      .start();
  }
  focusOnBase = function(){
    // Tween camera position
    new TWEEN.Tween(this.camera.position)
      .to({ x: 6, y: -16, z: 6 }, 4000)
      .start();
    // Tween camera target
    new TWEEN.Tween(this.controls.target)
      .to({ x: 0, y: -19, z: 0 }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => this.controls.update())
      .start();
  }
  faceNorthward = function(){
    // Tween camera position to face northward
    let dist = this.camera.position.distanceTo(this.controls.target);
    let newZ = Math.sqrt(dist * dist - Math.pow(this.camera.position.y-this.controls.target.y, 2));

    new TWEEN.Tween(this.camera.position)
      .to({ x: this.controls.target.x, z: newZ }, 4000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(()=>this.controls.update())
      .start();
  }



  // Show/Hide FPS
  showHideFPS = function(){
    let stats = this.stats;
    if (stats.isVisible){
      stats.showPanel(false);
      stats.isVisible = false;
    } else{
      stats.showPanel(0);
      stats.isVisible = true;
    }
  }



  // WINDOW RESIZE (called from Canvas3D.vue)
  windowWasResized = function(){
    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }









  // UPDATE
  update = function(time){
    
    if (this.prevTime == 0) this.prevTime = time; // Initial timestamp
    let dt = (time - this.prevTime) / 1000;
    this.prevTime = time;
    this.stats.update();


    // Ocean updates
    if (this.ocean && this.camera.position.y > -4) { // Limiting the updates by camera position does not improve performance in my PC 
      if (this.ocean.isLoaded) {
        this.ocean.update(dt);

        // Change buoy position
        if (this.somorrostroBuoy !== undefined) {
          if (this.somorrostroBuoy.isLoaded) {
            // Get y position and normal of the wave on that point
            let position = new THREE.Vector3();
            let normal = new THREE.Vector3();
            this.ocean.getNormalAndPositionAt(position, normal);

            if (!isNaN(position.x)){

              // Exponential Moving Average (EMA) for position
              let coef = 0.8; // TODO: SHOULD NOT DEPEND ON FRAMERATE!!
              // dt from 16 to 40
              coef = 0.95 - 0.4 * (1 - dt / 16); // Dependent on frame rate
              
              let somorrostroBuoy = this.somorrostroBuoy;
              somorrostroBuoy.root.position.x = somorrostroBuoy.root.position.x * coef + (1 - coef) * position.x;
              somorrostroBuoy.root.position.y = somorrostroBuoy.root.position.y * coef + (1 - coef) * position.y;
              somorrostroBuoy.root.position.z = somorrostroBuoy.root.position.z * coef + (1 - coef) * position.z;

              // EMA for rotation
              normal.applyAxisAngle(new THREE.Vector3(1, 0, 0), 90 * Math.PI / 180)
              let tempQuat = new THREE.Quaternion();
              tempQuat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), normal.normalize());
              tempQuat.normalize();
              somorrostroBuoy.root.quaternion.slerp(tempQuat, 0.002);

            }
          }
        }
      }
    }



    // Flag updates
    if (this.flag && this.camera.position.y > 0) {
      if (this.flag.isLoaded && this.flag.root.visible) {
        this.flag.update(time);
      }
    }



    // Current
    if (this.currents) {
      if (this.currents.isLoaded) {
        this.currents.update(dt);
      }
    }




  }





  // Resize renderer
  resizeRendererToDisplaySize = function (renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }




  // RENDER
  render = function (time) {

    // Tween update
    if (TWEEN)
      TWEEN.update();

    // if (this.resizeRendererToDisplaySize(this.renderer)) {
    //   const canvas = this.renderer.domElement;
    //   this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    //   this.camera.updateProjectionMatrix();
    // }

    this.update(time);

    this.renderer.render(this.scene, this.camera);

    this.controls.update();

    requestAnimationFrame(this.render.bind(this));
  }


  startRender = function(){
    requestAnimationFrame(this.render.bind(this));
  }









  

}

export default SceneManager;
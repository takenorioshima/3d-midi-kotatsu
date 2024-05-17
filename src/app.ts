import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Color4,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import Kotatsu from './kotatsu';
import Motion from './motion';

class App {
  constructor() {
    // create the canvas html element and attach it to the webpage
    var canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.id = 'main-canvas';
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    var engine = new Engine(canvas, true);
    var scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString('#ffcc00');
    scene.useRightHandedSystem = true;

    const camera = new ArcRotateCamera(
      'camera',
      Math.PI / 2,
      Math.PI / 3,
      6,
      Vector3.Zero(),
      scene
    );
    camera.fov = 0.3;
    camera.attachControl(canvas, true);
    var hemiLight: HemisphericLight = new HemisphericLight(
      'hemiLight',
      new Vector3(1, 1, 0),
      scene
    );

    // hide/show the Inspector
    window.addEventListener('keydown', (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === 'KeyI') {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // Load model.
    const kotatsu = new Kotatsu(scene);

    // Load animations.
    const motion = new Motion(kotatsu, scene, camera, engine);

    // Keep aspect ratio on window resize.
    window.addEventListener('resize', function () {
      engine.resize();
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
      camera.alpha += 0.005;
    });

    // Auto play function.
    let isAutoPlay = false;
    const autoPlayButton = document.querySelector('.js-auto-play-button');
    let intervalId;
    autoPlayButton.addEventListener('click', (_e) => {
      if (!isAutoPlay) {
        intervalId = setInterval(() => {
          motion.heatKotatsu();
          motion.bounce();
          motion.changeClearColor();

          const dice = Math.floor(Math.random() * 5);
          switch (dice) {
            case 0:
              motion.changeCameraPosition();
            case 1:
              motion.shuffleComponents();
            case 2:
              motion.rotateTabletop();
            case 3:
              motion.changeMaterials();
            case 4:
              motion.changeMaterials(true);
          }
        }, 800);
        autoPlayButton.textContent = '⏸︎';
        isAutoPlay = true;
      } else {
        clearInterval(intervalId);
        autoPlayButton.textContent = '⏵︎';
        isAutoPlay = false;
      }
    });
  }
}
new App();

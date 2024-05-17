import '@babylonjs/core/Debug/debugLayer';
import '@babylonjs/inspector';
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Color4 } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import Kotatsu from './kotatsu';
import Controller from './controller';

class App {
  constructor() {
    // Create the canvas html element and attach it to the webpage.
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.id = 'main-canvas';
    document.body.appendChild(canvas);

    // Initialize babylon scene and engine.
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString('#ffcc00');
    scene.useRightHandedSystem = true;

    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 6, Vector3.Zero(), scene);
    camera.fov = 0.3;
    camera.attachControl(canvas, true);
    const hemiLight: HemisphericLight = new HemisphericLight('hemiLight', new Vector3(1, 1, 0), scene);

    // Hide / show the inspector.
    window.addEventListener('keydown', (ev) => {
      // Shift + Ctrl + Alt + I
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

    // Initialize controller.
    const controller = new Controller(kotatsu, scene, camera, engine);

    // Keep aspect ratio on window resize.
    window.addEventListener('resize', function () {
      engine.resize();
    });

    // Run the main render loop.
    engine.runRenderLoop(() => {
      scene.render();
      camera.alpha += 0.005;
    });

    // Add click event for auto play.
    const autoPlayButton = document.querySelector('.js-auto-play-button');
    autoPlayButton.addEventListener('click', (e) => {
      controller.autoPlay(e.target as HTMLElement);
    });
  }
}
new App();

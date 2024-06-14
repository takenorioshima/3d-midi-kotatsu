import { ArcRotateCamera, Engine, Scene } from '@babylonjs/core';
import Kotatsu from './kotatsu';
import Embroidery from './embroidery';
import Motion from './motion';
import Midi from './midi';
import Keydown from './keydown';

export default class Controller {
  isAutoPlay: boolean;
  intervalId: NodeJS.Timeout;
  motion: Motion;

  kp3X: number;
  kp3Y: number;

  constructor(
    public kotatsu: Kotatsu,
    public embroidery: Embroidery,
    public scene: Scene,
    public camera: ArcRotateCamera,
    public engine: Engine
  ) {
    this.motion = new Motion(kotatsu, embroidery, scene, camera, engine);
    this.kp3X = 0;
    this.kp3Y = 0;

    new Midi(this.motion, camera);
    new Keydown(this.motion);

    this.isAutoPlay = false;
  }

  autoPlay(autoPlayButton: HTMLElement) {
    if (!this.isAutoPlay) {
      this.intervalId = setInterval(() => {
        this.motion.heat();
        this.motion.bounce();
        this.motion.changeClearColor();

        const dice = Math.floor(Math.random() * 5);
        switch (dice) {
          case 0:
            this.motion.moveCamera();
          case 1:
            this.motion.dissolve();
          case 2:
            this.motion.rotateTabletop();
          case 3:
            this.motion.changeMaterials();
          case 4:
            this.motion.changeMaterials(true);
        }
      }, 800);
      autoPlayButton.textContent = '⏸︎';
      this.isAutoPlay = true;
    } else {
      clearInterval(this.intervalId);
      autoPlayButton.textContent = '⏵︎';
      this.isAutoPlay = false;
    }
  }
}

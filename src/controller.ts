import { ArcRotateCamera, Engine, Scene } from '@babylonjs/core';
import Kotatsu from './kotatsu';
import { WebMidi } from 'webmidi';
import Motion from './motion';

export default class Controller {
  isAutoPlay: boolean;
  intervalId: NodeJS.Timeout;
  motion: Motion;

  constructor(public kotatsu: Kotatsu, public scene: Scene, public camera: ArcRotateCamera, public engine: Engine) {
    this.motion = new Motion(kotatsu, scene, camera, engine);

    WebMidi.enable()
      .then(() => {
        const input = WebMidi.inputs[0];
        console.log(`[WebMidi] ${input.manufacturer} ${input.name} was detected.`);

        input.addListener('noteon', (e) => {
          const numberOfAnimations = 8;
          const group = e.note.number % numberOfAnimations;

          this.motion.scaleFromVelocity(e.note.attack);

          switch (group) {
            case 0:
              this.motion.changeClearColor();
              break;
            case 1:
              this.motion.moveCamera();
              break;
            case 2:
              this.motion.heat();
              break;
            case 3:
              this.motion.dissolve();
              break;
            case 4:
              this.motion.rotateTabletop();
              break;
            case 5:
              this.motion.changeMaterials();
              break;
            case 6:
              this.motion.changeMaterials(true);
              break;
            case 7:
              this.motion.reset();
          }
        });

        input.addListener('noteoff', (_e) => {
          this.motion.scaleFromVelocity(0);
        });

        input.addListener('controlchange', (e) => {
          this.motion.floatFuton(e.value);
        });

        input.addListener('pitchbend', (e) => {
          this.motion.moveCameraBeta(e.value);
        });
      })
      .catch((err) => alert(err));

    window.addEventListener('keydown', (e) => {
      console.log(e);
      switch (e.code) {
        case 'Digit1':
          this.motion.changeClearColor();
          break;
        case 'Digit2':
          this.motion.moveCamera();
          break;
        case 'Digit3':
          this.motion.heat();
          break;
        case 'Digit4':
          this.motion.dissolve();
          break;
        case 'Digit5':
          this.motion.rotateTabletop();
          break;
        case 'Digit6':
          this.motion.changeMaterials();
          break;
        case 'Digit7':
          this.motion.changeMaterials(true);
          break;
        case 'Digit8':
          this.motion.bounce();
          break;
        case 'Escape':
          this.motion.reset();
      }
    });

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

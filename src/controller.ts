import { ArcRotateCamera, Engine, Scene } from '@babylonjs/core';
import Kotatsu from './kotatsu';
import Embroidery from './embroidery';
import { WebMidi } from 'webmidi';
import Motion from './motion';

export default class Controller {
  isAutoPlay: boolean;
  intervalId: NodeJS.Timeout;
  motion: Motion;

  sceneIndex: number;

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
    this.sceneIndex = 0;

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
              this.motion.zoomToMesh();
              break;
            case 3:
              this.motion.dissolve();
              this.motion.zoomToMesh();
              break;
            case 4:
              this.motion.rotateTabletop();
              this.motion.zoomToMesh();
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
          const number = e.controller.number;
          const value = e.value;

          // KORG KAOSS PAD 3 touch pad.
          // ON/OFF: CC#92 | X: CC#12 | Y: CC#13
          if (number == 12 && typeof value == 'number') {
            this.kp3X = value;
            this.camera.beta = this.kp3X * Math.PI;
          }
          if (number == 13 && typeof value == 'number') {
            this.kp3Y = value;
            this.motion.floatFuton(this.kp3Y);
          }
          if (number == 92 && value == 1) {
            const tb = this.kp3Y > 0.5 ? 'T' : 'B';
            const lr = this.kp3X < 0.5 ? 'L' : 'R';
            const area = tb + lr;
            switch (area) {
              case 'TL':
                this.motion.changeClearColor();
              case 'TR':
                this.motion.dissolve();
                break;
              case 'BL':
                this.motion.changeMaterials();
                break;
              case 'BR':
                this.motion.moveCamera();
            }
          }

          // Gate, CV.
          // Gate: CC#79 | CV: CC#47
          if (number == 79 && value == 1) {
            this.motion.heat();
            const dice = Math.floor(Math.random() * 5);
            switch (dice) {
              case 0:
                this.motion.moveCamera();
              case 1:
                this.motion.dissolve();
                this.motion.zoomToMesh();
              case 2:
                this.motion.rotateTabletop();
                this.motion.zoomToMesh();
              case 3:
                this.motion.changeMaterials();
              case 4:
                this.motion.changeClearColor();
            }
          }
          if (number == 47 && typeof value == 'number') {
            this.motion.scaleFromVelocity(value);
          }
        });

        input.addListener('pitchbend', (e) => {
          this.motion.moveCameraBeta(e.value);
        });
      })
      .catch((err) => {
        console.log(`[WebMidi] MIDI devices were not detected.`);
        console.log(err);
      });

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
        case 'KeyZ':
          this.motion.zoomToMesh();
          break;
        case 'KeyS':
          this.changeScene();
          break;
        case 'Escape':
          this.motion.reset();
      }
    });

    this.isAutoPlay = false;
  }

  changeScene() {
    if (this.sceneIndex == 0) {
      this.embroidery.root.setEnabled(true);
      this.kotatsu.root.setEnabled(false);
    } else {
      this.embroidery.root.setEnabled(false);
      this.kotatsu.root.setEnabled(true);
    }
    this.sceneIndex++;
    if (this.sceneIndex > 1) {
      this.sceneIndex = 0;
    }
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

import { WebMidi } from 'webmidi';
import Motion from './motion';
import { ArcRotateCamera } from '@babylonjs/core';

export default class Midi {
  kp3X: number;
  kp3Y: number;

  constructor(public motion: Motion, public camera: ArcRotateCamera) {
    this.kp3X = 0;
    this.kp3Y = 0;

    WebMidi.enable()
      .then(() => {
        const input = WebMidi.inputs[0];
        console.log(`[WebMidi] ${input.manufacturer} ${input.name} was detected.`);

        input.addListener('noteon', (e) => {
          this.motion.scaleFromVelocity(e.note.attack);

          const numberOfAnimations = 8;
          let group = e.note.number % numberOfAnimations;

          if (e.note.number == 5) {
            group = 10;
          }

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
              break;
            case 10:
              this.motion.reset();
              this.motion.changeModel();
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
  }
}

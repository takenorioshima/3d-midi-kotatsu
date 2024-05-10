import { ArcRotateCamera, Color4, Engine, Light, Scene } from '@babylonjs/core';
import Kotatsu from './kotatsu';

export default class Animation {
  clearColorIndex: number;
  hemiLight: Light;

  constructor(
    public kotatsu: Kotatsu,
    public scene: Scene,
    public camera: ArcRotateCamera,
    public engine: Engine
  ) {
    this.clearColorIndex = 0;
    this.hemiLight = this.scene.getLightByName('hemiLight');

    window.addEventListener('keydown', (e) => {
      console.log(e);
      if (e.code === 'Digit1') {
        this.changeClearColor();
      }
    });
  }

  changeClearColor() {
    const colors = [
      '#33BF4F',
      '#DC4829',
      '#FFD000',
      '#2D94CE',
      '#B7BC9B',
      '#000000',
    ];
    this.scene.clearColor = Color4.FromHexString(colors[this.clearColorIndex]);
    if (this.clearColorIndex === 5) {
      this.hemiLight.intensity = 0.05;
      this.kotatsu.spotLight.setEnabled(true);
    } else {
      this.hemiLight.intensity = 1;
      this.kotatsu.spotLight.setEnabled(false);
    }
    this.clearColorIndex++;
    if (this.clearColorIndex >= colors.length) {
      this.clearColorIndex = 0;
    }
  }
}

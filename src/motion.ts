import {
  ArcRotateCamera,
  CircleEase,
  Color4,
  EasingFunction,
  Engine,
  Light,
  Scene,
  Animation,
  Vector3,
  AbstractMesh,
  TransformNode,
} from '@babylonjs/core';
import Kotatsu from './kotatsu';

export default class Motion {
  clearColorIndex: number;
  fps: number;
  easeOutFunction: CircleEase;
  hemiLight: Light;

  constructor(
    public kotatsu: Kotatsu,
    public scene: Scene,
    public camera: ArcRotateCamera,
    public engine: Engine
  ) {
    this.clearColorIndex = 0;
    this.fps = 60;

    this.easeOutFunction = new CircleEase();
    this.easeOutFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

    this.hemiLight = this.scene.getLightByName('hemiLight');

    window.addEventListener('keydown', (e) => {
      console.log(e);
      if (e.code === 'Digit1') {
        this.changeClearColor();
      }
      if (e.code === 'Digit2') {
        this.rotateAndScaleKotatsu();
      }
      if (e.code === 'Digit3') {
        this.heatKotatsu();
      }
      if (e.code === 'Digit4') {
        this.shuffleComponents();
      }
      if (e.code === 'Digit5') {
        this.rotateTabletop();
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

  rotateAndScaleKotatsu() {
    const target = this.kotatsu.root;
    Animation.CreateAndStartAnimation(
      'rotateKotatsu',
      target,
      'rotation',
      this.fps,
      20,
      target.rotation,
      this._randomVector3(),
      0,
      this.easeOutFunction
    );

    const randomScale = Math.random() + Math.random() * 2;
    Animation.CreateAndStartAnimation(
      'scaleKotatsu',
      target,
      'scaling',
      this.fps,
      20,
      target.scaling,
      new Vector3(randomScale, randomScale, randomScale),
      0,
      this.easeOutFunction
    );
  }

  heatKotatsu() {
    const target = this.kotatsu.heaterLight;
    const intensityFrom = Math.random() * 15 + 30;
    console.log(intensityFrom);
    Animation.CreateAndStartAnimation(
      'heatKotatsu',
      target,
      'intensity',
      this.fps,
      10,
      intensityFrom,
      1,
      0
    );
  }

  shuffleComponents() {
    let reset = false;
    if (this.kotatsu.root.metadata.isShuffled && Math.random() < 0.3) {
      reset = true;
      this.kotatsu.root.metadata.isShuffled = false;
    } else {
      this.kotatsu.root.metadata.isShuffled = true;
    }
    this._moveScaleAndRotate(this.kotatsu.futon, reset);
    this._moveScaleAndRotate(this.kotatsu.tableTop, reset);
    this._moveScaleAndRotate(this.kotatsu.tableBase, reset);
  }

  rotateTabletop() {
    const target = this.kotatsu.tableTop;
    const rotation_to = target.metadata.isRotated ? 0 : Math.PI * 3;
    target.metadata.isRotated = !target.metadata.isRotated;
    Animation.CreateAndStartAnimation(
      'rotation',
      this.kotatsu.tableTop,
      'rotation.y',
      this.fps,
      15,
      this.kotatsu.tableTop.rotation.y,
      rotation_to,
      0,
      this.easeOutFunction
    );
  }

  private _randomVector3(multiple: number = 2) {
    return new Vector3(
      Math.random() * (multiple + 1) - multiple,
      Math.random() * (multiple + 1) - multiple,
      Math.random() * (multiple + 1) - multiple
    );
  }

  private _moveScaleAndRotate(
    target: AbstractMesh | TransformNode,
    reset: boolean = false
  ) {
    const position_to = reset ? Vector3.Zero() : this._randomVector3(2);
    const rotation_to = reset ? Vector3.Zero() : this._randomVector3(2);
    const scaling = Math.random() * 2 + 0.3;
    const scaling_to = reset
      ? Vector3.One()
      : new Vector3(scaling, scaling, scaling);

    Animation.CreateAndStartAnimation(
      'position',
      target,
      'position',
      this.fps,
      20,
      target.position,
      position_to,
      0,
      this.easeOutFunction
    );
    Animation.CreateAndStartAnimation(
      'rotation',
      target,
      'rotation',
      this.fps,
      20,
      target.rotation,
      rotation_to,
      0,
      this.easeOutFunction
    );
    Animation.CreateAndStartAnimation(
      'scaling',
      target,
      'scaling',
      this.fps,
      20,
      target.scaling,
      scaling_to,
      0,
      this.easeOutFunction
    );
  }
}

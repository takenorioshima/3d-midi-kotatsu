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
    this._animate(
      'rotateKotatsu',
      target,
      'rotation',
      20,
      target.rotation,
      this._randomVector3()
    );

    const randomScale = Math.random() + Math.random() * 2;
    this._animate(
      'scaleKotatsu',
      target,
      'scaling',
      20,
      target.scaling,
      new Vector3(randomScale, randomScale, randomScale)
    );
  }

  heatKotatsu() {
    const target = this.kotatsu.heaterLight;
    const intensityFrom = Math.random() * 15 + 30;
    this._animate('heatKotatsu', target, 'intensity', 10, intensityFrom, 1);
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
    this._animate(
      'rotation',
      target,
      'rotation.y',
      15,
      target.rotation.y,
      rotation_to
    );
  }

  private _animate(
    name: string,
    target: any,
    targetProperty: string,
    totalFrame: number,
    from: any,
    to: any,
    easingFunction?: CircleEase
  ) {
    easingFunction = easingFunction ? easingFunction : this.easeOutFunction;
    Animation.CreateAndStartAnimation(
      name,
      target,
      targetProperty,
      this.fps,
      totalFrame,
      from,
      to,
      0,
      easingFunction
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

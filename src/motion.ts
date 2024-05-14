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
import { NormalMaterial } from '@babylonjs/materials';
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
        this.changeCameraPosition();
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
      if (e.code === 'Digit6') {
        this.changeMaterials();
      }
      if (e.code === 'Digit7') {
        this.changeMaterials(true);
      }
      if (e.code === 'Digit8') {
        this.bounce();
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

  changeCameraPosition() {
    const camera = this.camera;
    const alpha = Math.random() * Math.PI * 2;
    const beta = Math.random() * Math.PI;
    const radius = Math.random() * 3 + 4;

    this._animate(
      'changeCameraPositionAlpha',
      camera,
      'alpha',
      20,
      camera.alpha,
      alpha
    );

    this._animate(
      'changeCameraPositionBeta',
      camera,
      'beta',
      20,
      camera.beta,
      beta
    );

    console.log(camera.radius);
    this._animate(
      'changeCameraPositionRadius',
      camera,
      'radius',
      20,
      camera.radius,
      radius
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
    this._moveScaleAndRotate(this.kotatsu.tabletop, reset);
    this._moveScaleAndRotate(this.kotatsu.tableBase, reset);
  }

  rotateTabletop() {
    const target = this.kotatsu.tabletop;
    const rotationTo = target.metadata.isRotated ? 0 : Math.PI * 3;
    const presentScale = target.scaling.x;
    const scaleFrom = new Vector3(
      presentScale * 1.4,
      presentScale * 1.4,
      presentScale * 1.4
    );
    target.metadata.isRotated = !target.metadata.isRotated;
    this._animate(
      'rotation',
      target,
      'rotation.y',
      15,
      target.rotation.y,
      rotationTo
    );
    this._animate(
      'scaling',
      target,
      'scaling',
      15,
      scaleFrom,
      new Vector3(presentScale, presentScale, presentScale)
    );
  }

  changeMaterials(wireframe: boolean = false) {
    const root = this.kotatsu.root;
    const childMeshes = root.getChildMeshes();
    if (!root.metadata.isNormalMaterial) {
      childMeshes.forEach((mesh) => {
        mesh.material = new NormalMaterial('normalMaterial', this.scene);
        mesh.material.wireframe = wireframe ? true : false;
        root.metadata.isNormalMaterial = true;
      });
    } else {
      childMeshes.forEach((mesh) => {
        mesh.material = mesh.metadata.initialMaterial;
        mesh.material.wireframe = false;
        root.metadata.isNormalMaterial = false;
      });
    }
  }

  bounce() {
    const root = this.kotatsu.root;
    this._animate(
      'bounce',
      root,
      'scaling',
      15,
      new Vector3(1.2, 1.2, 1.2),
      Vector3.One
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

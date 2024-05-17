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
import { WebMidi } from 'webmidi';

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

    WebMidi.enable()
      .then(() => {
        const input = WebMidi.inputs[0];
        console.log(
          `[WebMidi] ${input.manufacturer} ${input.name} was detected.`
        );

        input.addListener('noteon', (e) => {
          const numberOfAnimations = 8;
          const group = e.note.number % numberOfAnimations;

          this.velocityToScale(e.note.attack);

          switch (group) {
            case 0:
              this.changeClearColor();
              break;
            case 1:
              this.changeCameraPosition();
              break;
            case 2:
              this.heatKotatsu();
              break;
            case 3:
              this.shuffleComponents();
              break;
            case 4:
              this.rotateTabletop();
              break;
            case 5:
              this.changeMaterials();
              break;
            case 6:
              this.changeMaterials(true);
              break;
            case 7:
              this.reset();
          }
        });

        input.addListener('noteoff', (_e) => {
          this.velocityToScale(0);
        });

        input.addListener('controlchange', (e) => {
          this.floatFuton(e.value);
        });

        input.addListener('pitchbend', (e) => {
          this.moveCameraBeta(e.value);
        });
      })
      .catch((err) => alert(err));

    window.addEventListener('keydown', (e) => {
      console.log(e);
      switch (e.code) {
        case 'Digit1':
          this.changeClearColor();
          break;
        case 'Digit2':
          this.changeCameraPosition();
          break;
        case 'Digit3':
          this.heatKotatsu();
          break;
        case 'Digit4':
          this.shuffleComponents();
          break;
        case 'Digit5':
          this.rotateTabletop();
          break;
        case 'Digit6':
          this.changeMaterials();
          break;
        case 'Digit7':
          this.changeMaterials(true);
          break;
        case 'Digit8':
          this.bounce();
          break;
        case 'Escape':
          this.reset();
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
    const presentScale = this.kotatsu.root.metadata.isShuffled
      ? target.scaling.x
      : 1;

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

  reset() {
    // Reset Kotatsu positions and rotations.
    this._moveScaleAndRotate(this.kotatsu.futon, true);
    this._moveScaleAndRotate(this.kotatsu.tabletop, true);
    this._moveScaleAndRotate(this.kotatsu.tableBase, true);

    // Reset camera.
    const camera = this.camera;
    const alpha = Math.PI * 2;
    const beta = -Math.PI;
    const radius = 6;

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

    this._animate(
      'changeCameraPositionRadius',
      camera,
      'radius',
      20,
      camera.radius,
      radius
    );

    // Reset materials.
    const root = this.kotatsu.root;
    const childMeshes = root.getChildMeshes();
    childMeshes.forEach((mesh) => {
      mesh.material = mesh.metadata.initialMaterial;
      mesh.material.wireframe = false;
    });

    // Reset animation flags.
    root.metadata.isNormalMaterial = false;
    root.metadata.isShuffled = false;
  }

  velocityToScale(velocity: number) {
    const target = this.kotatsu.root;
    const scalingTo = new Vector3(1 + velocity, 1 + velocity, 1 + velocity);
    this._animate(
      'velocityToScale',
      target,
      'scaling',
      10,
      target.scaling,
      scalingTo
    );
  }

  floatFuton(value: number | boolean) {
    const tabletop = this.kotatsu.tabletop;
    const tableBase = this.kotatsu.tableBase;
    const futon = this.kotatsu.futon;
    if (typeof value === 'number') {
      tabletop.position.y = value / 2;
      tableBase.position.y = -value / 2;
      futon.rotation = new Vector3(0, (Math.PI * value) / 2, 0);
    }
  }

  moveCameraBeta(value: number | boolean) {
    const camera = this.camera;
    if (typeof value === 'number') {
      if (value === 0) {
        this._animate(
          'cameraBeta',
          camera,
          'beta',
          10,
          camera.beta,
          Math.PI * 0.25
        );
      } else {
        const valueMin = -1;
        const valueMax = 1;
        const rangeMin = 0;
        const rangeMax = 1;
        const range =
          ((value - valueMax) * (rangeMax - rangeMin)) / (valueMax - valueMin) +
          rangeMax;
        camera.beta = Math.PI * range;
      }
    }
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
    const position_to = reset ? Vector3.Zero() : this._randomVector3(0.5);
    const rotation_to = reset ? Vector3.Zero() : this._randomVector3(2);
    const scaling = Math.random() * 1.5 + 0.3;
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

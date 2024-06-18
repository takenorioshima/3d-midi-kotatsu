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
import Embroidery from './embroidery';

export default class Motion {
  clearColorIndex: number;
  fps: number;
  easeOutFunction: CircleEase;
  hemiLight: Light;
  zoomToMeshIndex: number;
  activeModel: string;

  constructor(
    public kotatsu: Kotatsu,
    public embroidery: Embroidery,
    public scene: Scene,
    public camera: ArcRotateCamera,
    public engine: Engine
  ) {
    this.clearColorIndex = 0;
    this.zoomToMeshIndex = 0;
    this.activeModel = 'kotatsu';
    this.fps = 60;

    this.easeOutFunction = new CircleEase();
    this.easeOutFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);

    this.hemiLight = this.scene.getLightByName('hemiLight');
  }

  changeClearColor() {
    const colors = ['#33BF4F', '#DC4829', '#FFD000', '#2D94CE', '#B7BC9B', '#000000'];
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

  moveCamera() {
    const camera = this.camera;
    const alpha = Math.random() * Math.PI * 2;
    const beta = Math.random() * Math.PI;
    const radius = Math.random() * 3 + 4;

    this._animate('moveCameraAlpha', camera, 'alpha', 20, camera.alpha, alpha);

    this._animate('moveCameraBeta', camera, 'beta', 20, camera.beta, beta);

    this._animate('moveCameraRadius', camera, 'radius', 20, camera.radius, radius);
  }

  heat() {
    const target = this.kotatsu.heaterLight;
    const intensityFrom = Math.random() * 15 + 30;
    this._animate('heat', target, 'intensity', 10, intensityFrom, 1);
  }

  dissolve() {
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
    const presentScale = this.kotatsu.root.metadata.isShuffled ? target.scaling.x : 1;

    const scaleFrom = new Vector3(presentScale * 1.4, presentScale * 1.4, presentScale * 1.4);
    const scaleTo = new Vector3(presentScale, presentScale, presentScale);

    target.metadata.isRotated = !target.metadata.isRotated;
    this._animate('rotation', target, 'rotation.y', 15, target.rotation.y, rotationTo);
    this._animate('scaling', target, 'scaling', 15, scaleFrom, scaleTo);
  }

  changeMaterials(wireframe: boolean = false) {
    const kotatsu = this.kotatsu.root;
    const kotatsuMeshes = kotatsu.getChildMeshes();
    if (!kotatsu.metadata.isNormalMaterial) {
      kotatsuMeshes.forEach((mesh) => {
        mesh.material = new NormalMaterial('normalMaterial', this.scene);
        mesh.material.wireframe = wireframe ? true : false;
        kotatsu.metadata.isNormalMaterial = true;
      });
    } else {
      kotatsuMeshes.forEach((mesh) => {
        mesh.material = mesh.metadata.initialMaterial;
        mesh.material.wireframe = false;
        kotatsu.metadata.isNormalMaterial = false;
      });
    }

    const embroidery = this.embroidery.root;
    const embroideryMeshes = embroidery.getChildMeshes();
    embroideryMeshes.forEach((mesh) => {
      if (!embroidery.metadata.isWireframe) {
        mesh.material.wireframe = true;
      } else {
        mesh.material.wireframe = false;
      }
    });
    embroidery.metadata.isWireframe = !embroidery.metadata.isWireframe;
  }

  zoomToMesh() {
    const targets = ['take', 'oreo', 'toreko', 'o1', 'cha', 'no', 'ma', 'to', 'ri', 'o2'];
    const target = targets[this.zoomToMeshIndex];
    targets.forEach((e) => {
      if (e === target) {
        const target = this.embroidery[e];
        this._animate('position', target, 'position', 10, target.position, Vector3.Zero);
        if (e.length < 4) {
          this._animate('scaling', target, 'scaling', 10, target.scaling, new Vector3(5, 5, 5));
        } else {
          this._animate('scaling', target, 'scaling', 10, target.scaling, new Vector3(2, 2, 2));
        }
      } else {
        const target = this.embroidery[e];
        this._animate('position', target, 'position', 10, target.position, this._randomVector3(4));
        this._animate('rotation', target, 'rotation', 10, target.rotation, this._randomVector3);
        this._animate('scaling', target, 'scaling', 10, target.scaling, new Vector3(1, 1, 1));
      }
    });
    this.zoomToMeshIndex++;
    if (this.zoomToMeshIndex >= targets.length) {
      this.zoomToMeshIndex = 0;
    }
  }

  bounce() {
    const root = this[this.activeModel].root;
    this._animate('bounce', root, 'scaling', 15, new Vector3(1.2, 1.2, 1.2), Vector3.One);
  }

  reset() {
    // Reset Kotatsu positions and rotations.
    this._moveScaleAndRotate(this.kotatsu.futon, true);
    this._moveScaleAndRotate(this.kotatsu.tabletop, true);
    this._moveScaleAndRotate(this.kotatsu.tableBase, true);

    // Reset embroidery and text positions.
    const embroideryChildren = this.embroidery.root.getChildTransformNodes(true);
    embroideryChildren.forEach((node) => {
      this._animate('scaling', node, 'scaling', 10, node.scaling, Vector3.One);
      this._animate('rotation', node, 'rotation', 10, node.rotation, Vector3.Zero);
      this._animate('position', node, 'position', 10, node.position, node.metadata.initialPosition);
    });

    // Reset materials.
    const kotatsu = this.kotatsu.root;
    const kotatsuMeshes = kotatsu.getChildMeshes();
    kotatsuMeshes.forEach((mesh) => {
      mesh.material = mesh.metadata.initialMaterial;
      mesh.material.wireframe = false;
    });

    const embroidery = this.embroidery.root;
    const embroideryMeshes = embroidery.getChildMeshes();
    embroideryMeshes.forEach((mesh) => {
      mesh.material.wireframe = false;
    });

    // Reset animation flags.
    embroidery.metadata.isNormalMaterial = false;
    embroidery.metadata.isShuffled = false;
    embroidery.metadata.isWireframe = false;
  }

  scaleFromVelocity(velocity: number) {
    const target = this[this.activeModel].root;
    const scalingTo = new Vector3(1 + velocity, 1 + velocity, 1 + velocity);
    this._animate('scaleFromVelocity', target, 'scaling', 10, target.scaling, scalingTo);
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
        this._animate('cameraBeta', camera, 'beta', 10, camera.beta, Math.PI * 0.25);
      } else {
        const valueMin = -1;
        const valueMax = 1;
        const rangeMin = 0;
        const rangeMax = 1;
        const range = ((value - valueMax) * (rangeMax - rangeMin)) / (valueMax - valueMin) + rangeMax;
        camera.beta = Math.PI * range;
      }
    }
  }

  changeModel() {
    if (this.activeModel == 'kotatsu') {
      // Hide kotatsu, show embroidery.
      this._animate('scaling', this.embroidery.root, 'scaling', 20, this.embroidery.root.scaling, Vector3.One);
      this._animate('scaling', this.kotatsu.root, 'scaling', 20, this.kotatsu.root.scaling, Vector3.Zero);
      this.kotatsu.heaterLight.setEnabled(false);
      this.activeModel = 'embroidery';
    } else if (this.activeModel == 'embroidery') {
      // Show kotatsu, hide embroidery.
      this._animate('scaling', this.embroidery.root, 'scaling', 20, this.embroidery.root.scaling, Vector3.Zero);
      this._animate('scaling', this.kotatsu.root, 'scaling', 20, this.kotatsu.root.scaling, Vector3.One);
      this.kotatsu.heaterLight.setEnabled(true);
      this.activeModel = 'kotatsu';
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
    Animation.CreateAndStartAnimation(name, target, targetProperty, this.fps, totalFrame, from, to, 0, easingFunction);
  }

  private _randomVector3(multiple: number = 2) {
    return new Vector3(
      Math.random() * (multiple + 1) - multiple,
      Math.random() * (multiple + 1) - multiple,
      Math.random() * (multiple + 1) - multiple
    );
  }

  private _moveScaleAndRotate(target: AbstractMesh | TransformNode, reset: boolean = false) {
    const positionTo = reset ? Vector3.Zero() : this._randomVector3(0.5);
    const rotationTo = reset ? Vector3.Zero() : this._randomVector3(2);
    const scaling = Math.random() * 1.5 + 0.3;
    const scalingTo = reset ? Vector3.One() : new Vector3(scaling, scaling, scaling);

    this._animate('position', target, 'position', 20, target.position, positionTo);
    this._animate('rotation', target, 'rotation', 20, target.rotation, rotationTo);
    this._animate('scaling', target, 'scaling', 20, target.scaling, scalingTo);
  }
}

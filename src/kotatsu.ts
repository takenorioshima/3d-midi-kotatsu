import {
  AbstractMesh,
  Color3,
  PointLight,
  Scene,
  SceneLoader,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';

export default class Kotatsu extends AbstractMesh {
  isLoaded: boolean;

  root: AbstractMesh;
  tableTop: TransformNode;
  futon: AbstractMesh;
  heater: AbstractMesh;
  heaterLight: PointLight;
  legTL: AbstractMesh;
  legTR: AbstractMesh;
  legBL: AbstractMesh;
  legBR: AbstractMesh;

  constructor(public scene: Scene) {
    super('kotatsu', scene);

    SceneLoader.ImportMeshAsync('', './models/', 'kotatsu.glb', scene)
      .then((result) => {
        this.root = result.meshes[0];

        // Tabletop
        this.tableTop = new TransformNode('tableTop');
        const tableTopBase = scene.getMeshByName('tableTopBase');
        const tableTopPicture = scene.getMeshByName('tableTopPicture');
        tableTopBase.parent = this.tableTop;
        tableTopPicture.parent = this.tableTop;

        // Futon
        this.futon = scene.getMeshByName('futon');

        // Legs
        this.legTL = scene.getMeshByName('legTL');
        this.legTR = scene.getMeshByName('legTR');
        this.legBL = scene.getMeshByName('legBL');
        this.legBR = scene.getMeshByName('legBR');

        // Heater
        this.heater = scene.getMeshByName('heater');
        const heaterMaterial = new StandardMaterial('heaterMaterial');
        heaterMaterial.emissiveColor = new Color3(1, 0, 0);
        this.heater.material = heaterMaterial;

        // Heater Light
        this.heaterLight = new PointLight(
          'heaterLight',
          new Vector3(0, 0.3, 0),
          scene
        );
        this.heaterLight.diffuse = new Color3(1, 0, 0);
        this.heaterLight.intensity = 1;
        this.heaterLight.parent = this.root;
      })
      .catch(console.error);
  }
}

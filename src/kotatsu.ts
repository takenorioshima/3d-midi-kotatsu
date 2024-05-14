import {
  AbstractMesh,
  Color3,
  Light,
  PointLight,
  Scene,
  SceneLoader,
  SpotLight,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';

export default class Kotatsu extends AbstractMesh {
  isLoaded: boolean;

  root: AbstractMesh;
  tabletop: TransformNode;
  tableBase: AbstractMesh;
  futon: AbstractMesh;
  heater: AbstractMesh;
  heaterLight: PointLight;
  legTL: AbstractMesh;
  legTR: AbstractMesh;
  legBL: AbstractMesh;
  legBR: AbstractMesh;
  spotLight: SpotLight;

  constructor(public scene: Scene) {
    super('kotatsu', scene);

    SceneLoader.ImportMeshAsync('', './models/', 'kotatsu.glb', scene)
      .then((result) => {
        this.root = result.meshes[0];
        this.root.scaling = Vector3.One();
        this.root.metadata = {
          isShuffled: false,
          isNormalMaterial: false,
        };

        // Tabletop
        this.tabletop = new TransformNode('tabletop');
        this.tabletop.metadata = { isRotated: false };
        this.tabletop.parent = this.root;
        const tabletopBase = scene.getMeshByName('tabletopBase');
        const tabletopPicture = scene.getMeshByName('tabletopPicture');
        tabletopBase.parent = this.tabletop;
        tabletopPicture.parent = this.tabletop;

        // Futon
        this.futon = scene.getMeshByName('futon');

        // Table base
        this.tableBase = scene.getMeshByName('tableBase');
        this.tableBase.parent = this.root;
        scene.getMeshByName('lattice').parent = this.tableBase;
        scene.getMeshByName('tableBasePanel').parent = this.tableBase;

        // Legs
        this.legTL = scene.getMeshByName('legTL');
        this.legTR = scene.getMeshByName('legTR');
        this.legBL = scene.getMeshByName('legBL');
        this.legBR = scene.getMeshByName('legBR');
        this.legTL.parent = this.tableBase;
        this.legTR.parent = this.tableBase;
        this.legBL.parent = this.tableBase;
        this.legBR.parent = this.tableBase;

        // Heater
        this.heater = scene.getMeshByName('heater');
        const heaterMaterial = new StandardMaterial('heaterMaterial');
        heaterMaterial.emissiveColor = new Color3(1, 0, 0);
        this.heater.material = heaterMaterial;
        scene.getMeshByName('heaterCase').parent = this.heater;
        scene.getMeshByName('heaterPanel').parent = this.heater;
        scene.getMeshByName('meshLarge').parent = this.heater;
        scene.getMeshByName('meshSmall').parent = this.heater;
        this.heater.parent = this.tableBase;

        // Heater Light
        this.heaterLight = new PointLight(
          'heaterLight',
          new Vector3(0, 0.3, 0),
          scene
        );
        this.heaterLight.diffuse = new Color3(1, 0, 0);
        this.heaterLight.intensity = 1;
        this.heaterLight.parent = this.heater;

        // Spot light
        this.spotLight = new SpotLight(
          'spotLight',
          new Vector3(0, 5, 1),
          new Vector3(0, -1, -0.25),
          Math.PI / 3,
          2,
          scene
        );
        this.spotLight.diffuse = new Color3(0.4, 0.5, 0.8);
        this.spotLight.intensity = 40;
        this.spotLight.parent = this.root;
        this.spotLight.setEnabled(false);

        // Set initial material.
        const childMeshes = this.root.getChildMeshes();
        childMeshes.forEach((mesh) => {
          mesh.metadata = {
            initialMaterial: mesh.material.clone('initialMaterial'),
          };
        });
      })
      .catch(console.error);
  }
}

import { AbstractMesh, Scene, SceneLoader, TransformNode } from '@babylonjs/core';

export default class Embroidery extends AbstractMesh {
  root: AbstractMesh;
  take: TransformNode;
  oreo: TransformNode;
  toreko: TransformNode;
  o1: AbstractMesh;
  cha: AbstractMesh;
  no: AbstractMesh;
  ma: AbstractMesh;
  to: AbstractMesh;
  ri: AbstractMesh;
  o2: AbstractMesh;

  constructor(public scene: Scene) {
    super('embroidery', scene);

    SceneLoader.ImportMeshAsync('', './models/', 'embroidery.glb', scene)
      .then((result) => {
        this.root = result.meshes[0];
        this.take = scene.getTransformNodeByName('take');
        this.oreo = scene.getTransformNodeByName('oreo');
        this.toreko = scene.getTransformNodeByName('toreko');
        this.o1 = scene.getMeshByName('o1');
        this.cha = scene.getMeshByName('cha');
        this.no = scene.getMeshByName('no');
        this.ma = scene.getMeshByName('ma');
        this.to = scene.getMeshByName('to');
        this.ri = scene.getMeshByName('ri');
        this.o2 = scene.getMeshByName('o2');

        const childTransformNodes = this.root.getChildTransformNodes(true);
        childTransformNodes.forEach((node) => {
          node.metadata = {
            initialPosition: node.position.clone(),
          };
        });
      })
      .catch(console.error);
  }
}

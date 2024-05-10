import { AbstractMesh, Scene, SceneLoader } from "@babylonjs/core";

export default class Kotatsu extends AbstractMesh {
  constructor(public scene: Scene) {
    super("kotatsu", scene);

    SceneLoader.ImportMeshAsync("", "./models/", "kotatsu.glb", scene)
      .then((result) => {
        console.log(result);
      })
      .catch((console.error));
  }
}

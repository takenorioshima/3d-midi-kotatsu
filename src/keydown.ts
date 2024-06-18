import Motion from './motion';

export default class Keydown {
  constructor(public motion: Motion) {
    window.addEventListener('keydown', (e) => {
      console.log(e);
      switch (e.code) {
        case 'Digit1':
          this.motion.changeClearColor();
          break;
        case 'Digit2':
          this.motion.moveCamera();
          break;
        case 'Digit3':
          this.motion.heat();
          break;
        case 'Digit4':
          this.motion.dissolve();
          break;
        case 'Digit5':
          this.motion.rotateTabletop();
          break;
        case 'Digit6':
          this.motion.changeMaterials();
          break;
        case 'Digit7':
          this.motion.changeMaterials(true);
          break;
        case 'Digit8':
          this.motion.bounce();
          break;
        case 'KeyZ':
          this.motion.zoomToMesh();
          break;
        case 'KeyS':
          this.motion.reset();
          this.motion.changeModel();
          break;
        case 'Escape':
          this.motion.reset();
      }
    });
  }
}

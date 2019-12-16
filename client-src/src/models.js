import * as PIXI from "pixi.js";

export class Models {
  constructor(app) {
    this.app = app;
  }
  load() {
    const { resources } = this.app.loader;
    const { shaders } = this.app;

    const shapesJson = resources["shapes"].data;

    this.all = {
      banana: {
        texture: PIXI.Texture.from("banana.png"),
        tint: 0xffffff,
        shapeJson: shapesJson["banana"]
        //program: shaders.basicProgram
      },
      crate: {
        texture: PIXI.Texture.from("crate.png"),
        tint: 0xffffff,
        shapeJson: shapesJson["crate"],
        program: shaders.basicProgram
      },
      cherry: {
        texture: PIXI.Texture.from("cherries.png"),
        tint: 0xffffff,
        shapeJson: shapesJson["cherries"],
        program: shaders.basicProgram
      },
      orange: {
        texture: resources["sprites"].textures["orange.png"],
        tint: 0xffffff,
        shapeJson: shapesJson["orange"],
        program: shaders.basicProgram
      },
      ground: {
        texture: resources["sprites"].textures["ground.png"],
        shapeJson: shapesJson["ground"]
      }
    };
  }
}

import * as PIXI from "pixi.js";

export class Assets {
  constructor(app) {
    this.app = app;
  }
  init() {
    const loadOptions = { crossOrigin: true };
    const loader = this.app.loader;
    loader.baseUrl = "assets/";
    loader.add("sprites", "fruit-pixi.json", loadOptions);
    loader.add("shapes", "fruit-shapes.json", loadOptions);

    loader.load(() => {
      this.app.runners.load.run();
    });
  }
}

import * as PIXI from "pixi.js";
import { Level } from "./level";
import { Assets } from "./assets";
import { Models } from "./models";
import { Phys } from "./phys";
import { Mouse } from "./mouse";
import { Shaders } from "./shaders";

export class Application {
  constructor() {
    const options = {
      width: 720,
      height: 1280,
      backgroundColor: 0x1099bb
    };

    this.renderer = new PIXI.Renderer(options);

    this.stage = new PIXI.Container();

    this.ticker = new PIXI.Ticker();

    this.ticker.add(() => {
      this.render();
    }, PIXI.UPDATE_PRIORITY.LOW);

    this.ticker.start();

    // Application components
    this.runners = {
      init: new PIXI.Runner("init", 0),
      load: new PIXI.Runner("load", 0),
      beforeAdd: new PIXI.Runner("beforeAdd", 1)
    };

    this.loader = new PIXI.Loader();

    this.addComponent((this.assets = new Assets(this)));
    this.addComponent((this.phys = new Phys(this)));
    this.addComponent((this.mouse = new Mouse(this)));
    this.addComponent((this.shaders = new Shaders(this)));

    this.addComponent((this.models = new Models(this)));
    this.addComponent((this.level = new Level(this)));
  }

  addComponent(comp) {
    for (let key in this.runners) {
      let runner = this.runners[key];
      runner.add(comp);
    }
  }

  get view() {
    return this.renderer.view;
  }

  get screen() {
    return this.renderer.screen;
  }

  render() {
    this.renderer.render(this.stage);
  }

  destroy() {
    this.renderer.destroy();
    this.ticker.destroy();
  }
}

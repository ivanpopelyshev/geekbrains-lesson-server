import * as PIXI from "pixi.js";
import * as p2 from "./lib/p2";
import { METER_TO_PIXEL, PIXEL_TO_METER, PixiBody } from "./pixi-p2";

export class Phys {
  constructor(app) {
    this.app = app;
  }
  init() {
    this.world = new p2.World({
      gravity: [0, -9],
      solver: new p2.GSSolver({
        iterations: 5
      })
    });

    // To animate the bodies, we must step the world forward in time, using a fixed time step size.
    // The World will run substeps and interpolate automatically for us, to get smooth animation.
    var fixedTimeStep = 1 / 60; // seconds
    var maxSubSteps = 10; // Max sub steps to catch up with the wall clock

    this.world.step(fixedTimeStep, 0, maxSubSteps);
    this.app.ticker.add(delta => {
      if (!(delta >= 0 && delta < 2)) {
        delta = 2;
      }
      this.world.step(fixedTimeStep, delta * fixedTimeStep, maxSubSteps);
    });
  }

  createPlane(pos, angle) {
    const body = new PixiBody();
    body.addShape(new p2.Plane({ position: [pos.x, pos.y], angle }));
    return body;
  }
}

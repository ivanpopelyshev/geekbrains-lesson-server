import * as PIXI from "pixi.js";
import * as p2 from "./lib/p2";
import { METER_TO_PIXEL, PIXEL_TO_METER, PixiBody } from "./pixi-p2";

export class Mouse {
  constructor(app) {
    this.app = app;
  }
  init() {
    const pickPrecision = 5;
    let drag = null;
    let mouseConstraint = {};
    let nullBody = new p2.Body();
    let { app } = this;
    let { world } = app.phys;

    app.stage.hitArea = new PIXI.Rectangle(-10000, -10000, 20000, 20000);
    app.stage.interactive = true;
    app.stage.on("mousedown", event => {
      endDrag();
      var pixiPoint = app.stage.toLocal(event.data.global);
      var physicsPoint = p2.vec2.create();
      physicsPoint[0] = -pixiPoint.x * PIXEL_TO_METER;
      physicsPoint[1] = -pixiPoint.y * PIXEL_TO_METER;
      var result = world.hitTest(physicsPoint, world.bodies, pickPrecision);
      // Remove static bodies
      var b;
      while (result.length > 0) {
        b = result.shift();
        if (b.type === p2.Body.STATIC) {
          b = null;
        } else {
          break;
        }
      }

      if (b) {
        drag = b;
        b.wakeUp();
        // Add mouse joint to the body
        var localPoint = p2.vec2.create();
        b.toLocalFrame(localPoint, physicsPoint);
        world.addBody(nullBody);
        mouseConstraint = new p2.RevoluteConstraint(nullBody, b, {
          localPivotA: physicsPoint,
          localPivotB: localPoint,
          maxForce: 1000 * b.mass
        });
        world.addConstraint(mouseConstraint);
      }
    });
    app.stage.on("mousemove", event => {
      if (!drag) {
        return;
      }

      var pixiPoint = app.stage.toLocal(event.data.global);
      var physicsPoint = p2.vec2.create();
      physicsPoint[0] = -pixiPoint.x * PIXEL_TO_METER;
      physicsPoint[1] = -pixiPoint.y * PIXEL_TO_METER;

      p2.vec2.copy(mouseConstraint.pivotA, physicsPoint);
      mouseConstraint.bodyA.wakeUp();
      mouseConstraint.bodyB.wakeUp();
    });
    function endDrag() {
      if (!drag) {
        return;
      }
      // drag.display.dead = true;
      // console.log(drag)
      drag = null;
      world.removeConstraint(mouseConstraint);
      mouseConstraint = null;
      world.removeBody(nullBody);
    }
    app.stage.on("mouseup", event => {
      endDrag();
    });
  }
}

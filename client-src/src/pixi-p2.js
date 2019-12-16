import * as PIXI from "pixi.js";
import * as p2 from "./lib/p2";

const { Body, Circle, Plane, Convex } = p2;

export const METER_TO_PIXEL = 30;
export const PIXEL_TO_METER = 1 / 30;

export class PixiBody extends Body {
  constructor(options) {
    super(options);
    this.flag = false;
  }

  setFromJson(json, offset, size) {
    size = size * PIXEL_TO_METER;
    json.fixtures.forEach(fixture => {
      let shape;
      const { circle } = fixture;
      if (circle) {
        shape = new Circle({ radius: circle.radius * size });
        this.addShape(shape, [
          -(offset.x + circle.x) * size,
          -(offset.y + circle.y) * size
        ]);
      } else if (fixture.vertices) {
        fixture.vertices.forEach(polygon => {
          let vertices = [];
          let n = polygon.length;
          let prevX = Infinity,
            prevY = Infinity;
          for (let i = n - 1; i >= 0; i--) {
            const { x, y } = polygon[i];
            if (Math.abs(x - prevX) < 1 && Math.abs(y - prevY) < 1) {
              console.log(`duplicate ${x} ${y}`);
              continue;
            }
            prevX = x;
            prevY = y;
            vertices.push([-(x + offset.x) * size, -(y + offset.y) * size]);
          }
          shape = new Convex({ vertices });
          //this.fixedRotation = true;
          this.addShape(shape);
          //this.fromPolygon(vertices);
        });
      }
    });
  }

  getOrCreateDebug() {
    if (this.debug) {
      return this.debug;
    }

    const { shapes } = this;

    const debug = (this.debug = new PIXI.Graphics());
    const color = (Math.random() * 0xffffff) | 0;
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape instanceof Circle) {
        debug.lineStyle(3.0, color, 1.0);
        //debug.beginFill(color, 1.0);
        debug.drawCircle(
          -shape.position[0] * METER_TO_PIXEL,
          -shape.position[1] * METER_TO_PIXEL,
          shape.radius * METER_TO_PIXEL
        );
        //debug.endFill();
        debug.lineStyle(0.0);
      }
      if (shape instanceof Plane) {
        debug.lineStyle(10.0, 0x000000, 1.0);
        debug.moveTo(-2000, 0);
        debug.lineTo(2000, 0);
      } else if (shape instanceof Convex) {
        const pos = shape.position;
        const vertices = shape.vertices;

        debug.lineStyle(3.0, color, 1.0);
        //debug.beginFill(color, 1.0);
        debug.moveTo(
          -(vertices[0][0] + pos[0]) * METER_TO_PIXEL,
          -(vertices[0][1] + pos[1]) * METER_TO_PIXEL
        );
        let n = vertices.length;
        for (let i = 1; i < n; i++) {
          debug.lineTo(
            -(vertices[i][0] + pos[0]) * METER_TO_PIXEL,
            -(vertices[i][1] + pos[1]) * METER_TO_PIXEL
          );
        }
        debug.closePath();
        //debug.endFill();

        debug.lineStyle(2.0, color, 1.0);
        // lets add normals!
        const normals = shape.normals;

        for (let i = 0; i < n; i++) {
          const p1 = vertices[i];
          const p2 = vertices[(i + 1) % n];
          const n1 = normals[i];

          debug.moveTo(
            (-(p1[0] + p2[0]) / 2) * METER_TO_PIXEL,
            (-(p1[1] + p2[1]) / 2) * METER_TO_PIXEL
          );
          debug.lineTo(
            -((p1[0] + p2[0]) / 2 + n1[0] * 0.5) * METER_TO_PIXEL,
            -((p1[1] + p2[1]) / 2 + n1[1] * 0.5) * METER_TO_PIXEL
          );
        }

        debug.lineStyle(0.0);
      }
    }
    debug.body = this;

    return debug;
  }

  update() {
    const { debug, display } = this;

    if (debug) {
      debug.position.set(
        -this.interpolatedPosition[0] * METER_TO_PIXEL,
        -this.interpolatedPosition[1] * METER_TO_PIXEL
      );
      debug.rotation = this.interpolatedAngle;
    }

    if (!display) {
      return;
    }

    if (this._memLocalId !== display.transform._localID) {
      this.previousPosition[0] = this.position[0] =
        -display.position.x * PIXEL_TO_METER;
      this.previousPosition[1] = this.position[1] =
        -display.position.y * PIXEL_TO_METER;
      this.previousAngle = this.angle = display.rotation;
      this.wakeUp();
    } else {
      display.position.set(
        -this.interpolatedPosition[0] * METER_TO_PIXEL,
        -this.interpolatedPosition[1] * METER_TO_PIXEL
      );
      display.rotation = this.interpolatedAngle;
    }
    this._memLocalId = display.transform._localID;
  }
}

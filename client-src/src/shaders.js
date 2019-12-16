import * as PIXI from "pixi.js";

const vertexSrc = `

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`;

const fragmentSrc = `

    precision mediump float;

    uniform vec3 uColor;
    varying vec2 vUvs;
    uniform float speed;

    uniform sampler2D uSampler2;

    void main() {

      vec4 color = texture2D(uSampler2, vUvs);

      if (color.a > 0.0) {
        color.rgb /= color.a;
      }

      vec3 new_color = (color.rgb - 0.5) * (1.0 + uColor * speed) + 0.5;
      gl_FragColor = vec4(new_color, 1.0) * color.a;
    }`;

export class Shaders {
  constructor(app) {
    this.app = app;
  }
  init() {
    this.basicProgram = new PIXI.Program(vertexSrc, fragmentSrc);
  }

  createMesh(model) {
    const texture = model.texture;
    const width = texture.width;
    const height = texture.height;

    texture.updateUvs();

    const geometry = new PIXI.Geometry()
      .addAttribute(
        "aVertexPosition", // the attribute name
        [
          -width / 2,
          -height / 2, // x, y
          width / 2,
          -height / 2, // x, y
          width / 2,
          height / 2,
          -width / 2,
          height / 2
        ], // x, y
        2
      ) // the size of the attribute
      .addAttribute(
        "aUvs", // the attribute name
        texture._uvs.uvsFloat32, // u, v
        2
      )
      .addIndex([0, 1, 2, 0, 2, 3]); // the size of the attribute;
    const uniforms = {
      uSampler2: texture,
      uColor: [2.0, 1.0, 1.0],
      speed: [0.0]
    };
    const shader = new PIXI.Shader(model.program, uniforms);
    const triangle = new PIXI.Mesh(geometry, shader);

    return triangle;
  }

  beforeAdd(entity) {
    if (entity.model.program) {
      entity.pixi.addChild((entity.mesh = this.createMesh(entity.model)));
    }
  }
}

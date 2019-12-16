import * as PIXI from "pixi.js";
import { Entity } from "./entity";
import {
  SSL_OP_SSLEAY_080_CLIENT_DH_BUG,
  SSL_OP_NO_COMPRESSION
} from "constants";

export class Level {
  constructor(app) {
    this.app = app;
    this.entities = [];
    this.models = null;
    this.scorePoints = 0;
    this.scorePick = [];
  }
  getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  createReportScore() {
    this.basicText = new PIXI.Text("", this.getTextStyle());
    this.basicText.x = 10;
    this.basicText.y = 10;
    this.app.stage.addChild(this.basicText);
  }
  renderReportScore() {
    this.basicText.text = `Score: ${this.scorePoints}`;
  }
  getTextStyle() {
    const style = new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: ["#00ffff", "#00ff99"], // gradient
      stroke: "#4a1850",
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: "#0000dd",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 700
    });
    return style;
  }
  createLevelLine(y) {
    const randModels = ["banana", "crate", "cherry", "orange"];
    for (let i = 0; i < 720; i += 120) {
      const entityNameRand = randModels[this.getRandomInt(0, 4)];
      let randEntity = new Entity(
        {
          size: 1,
          mass: this.getRandomInt(1, 3),
          game: 1,
          entityName: entityNameRand
        },
        this.models[entityNameRand]
      );
      randEntity.pixi.position.set(
        i + 60,
        this.app.screen.height / 2 - y * 120 - 500
        //this.app.screen.height / 2 - 500
      );
      this.add(randEntity);
    }
  }
  load() {
    this.debugContainer = new PIXI.Container();
    this.models = this.app.models.all;

    this.debugContainer.alpha = 0.0;

    this.createReportScore();
    for (let y = 0; y < 10; y++) {
      this.createLevelLine(y);
    }

    let ground = new Entity(
      {
        size: 0.6,
        mass: 0
      },
      this.models.ground
    );
    ground.pixi.position.set(360, 1100);

    this.add(ground);

    this.app.ticker.add(delta => {
      this.update(delta);
    });

    this.createPlaneEntity(new PIXI.Point(1, 0), Math.PI / 2);
    this.createPlaneEntity(new PIXI.Point(719, 0), -Math.PI / 2);

    this.app.stage.addChild(this.debugContainer);
  }

  add(entity) {
    this.entities.push(entity);
    this.app.runners.beforeAdd.run(entity);
    if (entity.pixi) {
      this.app.stage.addChild(entity.pixi);
    }
    if (entity.body) {
      this.app.phys.world.addBody(entity.body);
      this.debugContainer.addChild(entity.body.getOrCreateDebug());

      entity.body.update();
    }
  }
  addScoreText(x, y, text) {
    const style = this.getTextStyle();
    style.dropShadowColor = "#00dddd";
    style.stroke = "#4add50";
    const textScore = new PIXI.Text(text, style);
    textScore.x = x;
    textScore.y = y;
    this.scorePick.push(textScore);
    this.app.stage.addChild(textScore);
  }
  updateScoreText(delta) {
    let { scorePick } = this;
    for (let i = scorePick.length - 1; i >= 0; i--) {
      const textPick = scorePick[i];
      if (textPick.position.y < 0) {
        scorePick.splice(i, 1);
        this.app.stage.removeChild(textPick);
      } else {
        textPick.position.y -= 6 * delta;
      }
    }
  }

  markAsDead(entities, position, entityName) {
    let magicPoint = 1;
    let deadRect = new PIXI.Rectangle(
      position.x - 150.0,
      position.y - 150.0,
      300.0,
      300.0
    );
    for (let i = entities.length - 1; i >= 0; i--) {
      if (deadRect.contains(entities[i].position.x, entities[i].position.y)) {
        if (
          entities[i].game &&
          entities[i].entityName === entityName &&
          !entities[i].dead
        ) {
          entities[i].dead = 50;
          entities[i].scorePoint = magicPoint++;
        }
      }
    }
  }

  update(delta) {
    const { entities } = this;
    entities.forEach(entity => entity.update(delta));

    this.updateScoreText(delta);
    if (entities.length < 50) {
      this.createLevelLine(1);
    }

    let scoreCount = 0;
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (entity.dead === 1) {
        this.markAsDead(entities, entity.position, entity.entityName);
      }
    }

    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (entity.dead === 1) {
        scoreCount += entities[i].scorePoint;
        this.scorePoints += scoreCount;
        this.addScoreText(
          entity.position.x,
          entity.position.y,
          `+${scoreCount}`
        );
        this.renderReportScore();

        entities.splice(i, 1);

        if (entity.pixi) {
          this.app.stage.removeChild(entity.pixi);
        }
        if (entity.body) {
          this.app.phys.world.removeBody(entity.body);
          this.debugContainer.removeChild(entity.body.debug);
        }
      }
    }
  }

  createPlaneEntity(pos, angle) {
    const body = this.app.phys.createPlane(pos, angle);
    const obj = new Entity(
      {
        body
      },
      {}
    );
    obj.pixi.rotation = angle;
    obj.pixi.position.copyFrom(pos);

    this.add(obj);

    return obj;
  }
}

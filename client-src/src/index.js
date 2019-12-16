import "./styles.css";

import * as PIXI from "pixi.js";
import * as p2 from "./lib/p2";
import { Application } from "./app";

let app = new Application();
app.runners.init.run();

try {
  if (module.hot) {
    module.hot.dispose(function() {
      console.log("destroyed");
      app.destroy();
    });
  }
} catch (e) {}

document.getElementById("app").appendChild(app.view);

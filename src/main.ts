// Game entry point: starts the office scene in the page.
import { startOfficeScene } from "./scene";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");
startOfficeScene(container);

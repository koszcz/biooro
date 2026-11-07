// Game entry point: shows the loading screen, loads every GLB, then starts the office scene.
import { loadModels, startOfficeScene } from "./scene";
import { showLoadingScreen } from "./ui";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
loading.close();
startOfficeScene(container, models);

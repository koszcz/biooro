// Game entry point: shows the loading screen, loads every GLB, then starts the office scene.
import { tierOf } from "./rules";
import { loadModels, startOfficeScene } from "./scene";
import { createStore } from "./store";
import { showLoadingScreen } from "./ui";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
loading.close();
const store = createStore(window.localStorage);
startOfficeScene(container, models, store, tierOf(store.state.escalation));
Object.assign(window, { __store: store });

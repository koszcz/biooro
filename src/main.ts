// Game entry point: shows the loading screen, loads every GLB, then starts the office scene, the HUD and a new game.
import { tierOf } from "./rules";
import { loadModels, startOfficeScene } from "./scene";
import { createStore } from "./store";
import { mountGameUi, showLoadingScreen } from "./ui";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
loading.close();
const store = createStore(window.localStorage);
const office = startOfficeScene(container, models, store, tierOf(store.state.escalation));
mountGameUi(container, store, office.headAt, office.onActionCue);
// The title screen ticket replaces this with Continue and New game.
store.startOver();
Object.assign(window, { __store: store });

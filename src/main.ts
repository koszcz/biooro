// Game entry point: shows the loading screen, loads every GLB, then starts the office scene, the HUD and Conversations.
import { Conversations, Dialogue } from "./dialogue";
import { tierOf } from "./rules";
import { loadModels, startOfficeScene } from "./scene";
import { createStore } from "./store";
import { story } from "./story";
import { mountDebugPanel, mountGameUi, mountTalk, showLoadingScreen } from "./ui";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
loading.close();
const store = createStore(window.localStorage);
const dialogue = new Dialogue(store, story);
// The title screen ticket replaces this with Continue and New game. Continuing the save lets a reload
// in the middle of a Conversation replay it from its start. The HUD draws a loaded save when it mounts.
const continued = store.continueGame(dialogue.loadInk);
const office = startOfficeScene(container, models, store, tierOf(store.state.escalation));
mountGameUi(container, store, office.headAt);
const talk = mountTalk(container, office, store);
const conversations = new Conversations(store, dialogue, office, talk.view);
talk.connect((person) => conversations.availability(person));
office.onPersonClick((person) => void conversations.click(person));
// A new game starts after the HUD mounts, so the HUD sees Monday's `dayStarted`.
if (!continued) store.startOver();
// Vite sets import.meta.env.DEV to false in production builds, so the bundle drops the panel.
if (import.meta.env.DEV) mountDebugPanel(container, store);
Object.assign(window, { __store: store, __conversations: conversations });

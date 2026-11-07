// Game entry point: shows the loading screen, loads every GLB, then starts the office scene and Conversations.
import { Conversations, Dialogue } from "./dialogue";
import { tierOf } from "./rules";
import { loadModels, startOfficeScene } from "./scene";
import { createStore } from "./store";
import { story } from "./story";
import { mountTalk, showLoadingScreen } from "./ui";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
loading.close();
const store = createStore(window.localStorage);
const dialogue = new Dialogue(store, story);
// The title screen ticket replaces this with Continue and New game.
if (!store.continueGame(dialogue.loadInk)) store.startOver();
const office = startOfficeScene(container, models, store, tierOf(store.state.escalation));
const talk = mountTalk(container, office, store);
const conversations = new Conversations(store, dialogue, office, talk.view);
talk.connect((person) => conversations.availability(person));
office.onPersonClick((person) => void conversations.click(person));
Object.assign(window, { __store: store, __conversations: conversations });

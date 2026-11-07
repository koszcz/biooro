// Game entry point: loads every GLB behind the loading screen, shows the title screen, then starts the office
// scene, the HUD, Conversations and the scripted scenes.
import { Conversations, Dialogue, Scenes } from "./dialogue";
import { tierOf } from "./rules";
import { loadModels, startOfficeScene } from "./scene";
import { createStore, hasSave } from "./store";
import { story } from "./story";
import { mountDebugPanel, mountGameUi, mountSceneFrame, mountTalk, showLoadingScreen } from "./ui";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
const store = createStore(window.localStorage);
const dialogue = new Dialogue(store, story);
// The audio ticket plugs its unlock in here. It must run inside the title screen's click.
const choice = await loading.toTitle({ canContinue: hasSave(window.localStorage), unlockAudio: () => {} });
// Continuing the save lets a reload in the middle of a Conversation replay it from its start.
// The HUD draws a loaded save when it mounts. If the save fails to load, a new game starts.
const continued = choice === "continue" && store.continueGame(dialogue.loadInk);
const office = startOfficeScene(container, models, store, tierOf(store.state.escalation));
mountGameUi(container, store, office.headAt, office.onActionCue);
const talk = mountTalk(container, office, store);
const conversations = new Conversations(store, dialogue, office, talk.view);
talk.connect((person) => conversations.availability(person));
const scenes = new Scenes(store, dialogue, office, talk.view, mountSceneFrame(container));
office.onPersonClick((person) => {
  if (!scenes.playing) void conversations.click(person);
});
// A new game starts after the HUD mounts, so the HUD and the scenes see Monday's `dayStarted`.
if (continued) scenes.resume();
else store.startOver();
// Vite sets import.meta.env.DEV to false in production builds, so the bundle drops the panel.
if (import.meta.env.DEV) mountDebugPanel(container, store);
Object.assign(window, { __store: store, __conversations: conversations, __scenes: scenes });

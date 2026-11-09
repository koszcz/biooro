// Game entry point: loads every GLB behind the loading screen, shows the title screen, then starts the office
// scene, the HUD, Conversations and the scripted scenes.
import { blipsBetween, loadAudio } from "./audio/index";
import { Conversations, Dialogue, readHandOffLine, Scenes } from "./dialogue/index";
import { tierOf } from "./rules/index";
import { loadModels, startOfficeScene } from "./scene/index";
import { createSettings, createStore, hasSave } from "./store/index";
import { story } from "./story/index";
import {
  type HandOffText,
  mountConversations,
  mountDebugPanel,
  mountGameUi,
  mountMuteButton,
  mountSceneFrame,
  type RevealListener,
  showLoadingScreen,
} from "./ui/index";

const container = document.getElementById("app");
if (!container) throw new Error("index.html needs an element with id 'app'");

const loading = showLoadingScreen(container);
const models = await loadModels((share) => loading.setProgress(share));
const store = createStore(window.localStorage);
const audio = await loadAudio(store, createSettings(window.localStorage), import.meta.env.BASE_URL);
const dialogue = new Dialogue(store, story);
// Audio resumes on the first click, so either title screen button unlocks it.
const choice = await loading.toTitle({ canContinue: hasSave(window.localStorage) });
// Continuing the save lets a reload in the middle of a Conversation replay it from its start.
// The HUD draws a loaded save when it mounts. If the save fails to load, a new game starts.
const continued = choice === "continue" && store.continueGame(dialogue.loadInk);
const office = startOfficeScene(container, models, store, tierOf(store.state.escalation));
const blip: RevealListener = (speaker, text, from, to) => audio.blip(speaker, blipsBetween(text, from, to));
const handOffText: HandOffText = (colleague) => readHandOffLine(dialogue, colleague).text;
mountGameUi(container, store, office.headAt, office.onActionCue, handOffText, blip);
mountMuteButton(container, audio);
const overlay = mountConversations(container, office, store, blip);
const conversations = new Conversations(store, dialogue, office, overlay.view);
overlay.connect((person) => conversations.availability(person));
const scenes = new Scenes(store, dialogue, office, overlay.view, mountSceneFrame(container));
office.onPersonClick((person) => {
  if (!scenes.playing) void conversations.click(person);
});
// A new game starts after the HUD mounts, so the HUD and the scenes see Monday's `dayStarted`.
if (continued) scenes.resume();
else store.startOver();
// Vite sets import.meta.env.DEV to false in production builds, so the bundle drops the panel.
if (import.meta.env.DEV) mountDebugPanel(container, store);
Object.assign(window, { __store: store, __conversations: conversations, __scenes: scenes });

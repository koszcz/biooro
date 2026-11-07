// The state store, its commands and event emitter, autosave and the day-start snapshot.

export { jumpToDay, playDefaultDay, setDebugFlag, setDebugPressure } from "./debug";
export type { Listener, StoreEvent, StoreEventOf, StoreEventType } from "./events";
export {
  type DayStartSnapshot,
  hasSave,
  SAVE_KEY,
  SAVE_VERSION,
  type SaveRecord,
  type SaveStorage,
  SETTINGS_KEY,
  type Settings,
} from "./save";
export { createSettings, SettingsStore } from "./settings";
export { createStore, GameStore } from "./store";

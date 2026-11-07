// The save record and the settings record, each in one localStorage key.
import type { GameState } from "../rules/index";

/** Bump this whenever a `.ink` file or the shape of the save record changes. */
export const SAVE_VERSION = 1;
export const SAVE_KEY = "biooro.save";
export const SETTINGS_KEY = "biooro.settings";

/** The parts of localStorage the store uses, so tests can pass a fake. */
export type SaveStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** A copy of the game taken at morning step 8. Retry restores it. */
export interface DayStartSnapshot {
  state: GameState;
  inkState: string | null;
}

export interface SaveRecord {
  version: number;
  state: GameState;
  /** Ink's state JSON from `story.state.toJson()`, kept as an opaque string. */
  inkState: string | null;
  snapshot: DayStartSnapshot | null;
}

export interface Settings {
  muted: boolean;
}

export const DEFAULT_SETTINGS: Settings = { muted: false };

export function writeSave(storage: SaveStorage, record: Omit<SaveRecord, "version">): void {
  storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, ...record }));
}

function isSaveRecord(value: unknown): value is SaveRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<SaveRecord>;
  return record.version === SAVE_VERSION && typeof record.state === "object" && record.state !== null;
}

/** Reads the save. Discards it and returns `null` when the version differs or the JSON fails to parse. */
export function readSave(storage: SaveStorage): SaveRecord | null {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (isSaveRecord(parsed)) return parsed;
  storage.removeItem(SAVE_KEY);
  return null;
}

export function readSettings(storage: SaveStorage): Settings {
  const raw = storage.getItem(SETTINGS_KEY);
  if (raw === null) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(storage: SaveStorage, settings: Settings): void {
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

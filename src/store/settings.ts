// The player's settings, such as mute. They live apart from the game state and survive a new game.
import { readSettings, type SaveStorage, type Settings, writeSettings } from "./save";

export class SettingsStore {
  private current: Settings;

  constructor(private readonly storage: SaveStorage) {
    this.current = readSettings(storage);
  }

  get settings(): Settings {
    return this.current;
  }

  /** Changes some settings and saves them at once. */
  update(changes: Partial<Settings>): void {
    this.current = { ...this.current, ...changes };
    writeSettings(this.storage, this.current);
  }
}

export function createSettings(storage: SaveStorage): SettingsStore {
  return new SettingsStore(storage);
}

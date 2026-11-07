import { describe, expect, it } from "vitest";
import { FakeStorage } from "./fakeStorage";
import { SETTINGS_KEY } from "./save";
import { createSettings } from "./settings";
import { createStore } from "./store";

describe("settings", () => {
  it("keeps the settings record in its own key", () => {
    const storage = new FakeStorage();
    const settings = createSettings(storage);
    expect(settings.settings).toEqual({ muted: false });
    settings.update({ muted: true });
    expect(storage.getItem(SETTINGS_KEY)).not.toBeNull();
    expect(createSettings(storage).settings).toEqual({ muted: true });
  });

  it("survives a new game", () => {
    const storage = new FakeStorage();
    createSettings(storage).update({ muted: true });
    createStore(storage).startOver();
    expect(createSettings(storage).settings).toEqual({ muted: true });
  });
});

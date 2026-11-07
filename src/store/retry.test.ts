import { describe, expect, it } from "vitest";
import type { GameState } from "../rules/index";
import { FakeStorage } from "./fakeStorage";
import { SAVE_KEY } from "./save";
import { createStore, type GameStore } from "./store";

/** Starts a game, then edits the saved state and loads it into a fresh store. */
function storeWith(edit: (state: GameState) => void, storage = new FakeStorage()): GameStore {
  createStore(storage).startOver();
  const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
  edit(record.state);
  storage.setItem(SAVE_KEY, JSON.stringify(record));
  const store = createStore(storage);
  store.continueGame();
  return store;
}

describe("retry", () => {
  it("restores today's start, both GameState and Ink state, after a day Firing", () => {
    const storage = new FakeStorage();
    const store = createStore(storage);
    store.startOver();
    const mondayStart = store.state;
    store.startConversation("wiola", false);
    store.endConversation('{"ink":"after wiola"}');
    // Drop Performance to 1 through the save, then sabotage.
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state.pressures.performance = 1;
    storage.setItem(SAVE_KEY, JSON.stringify(record));
    const loaded = createStore(storage);
    loaded.continueGame();
    loaded.chooseTask(loaded.state.openTasks[0], "sabotage");
    loaded.finishTaskAction();
    expect(loaded.state.phase.kind).toBe("fired");

    loaded.retry();
    expect(loaded.state).toEqual(mondayStart);
    expect(loaded.inkState).toBeNull();
  });

  it("restores the previous day after a morning Firing", () => {
    const storage = new FakeStorage();
    const store = createStore(storage);
    store.startOver();
    const mondayStart = store.state;
    store.startConversation("wiola", false);
    store.endConversation('{"ink":"after wiola"}');
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state.pressures.sanity = 1;
    record.state.flags = ["edited"];
    storage.setItem(SAVE_KEY, JSON.stringify(record));
    const loaded = createStore(storage);
    loaded.continueGame();

    // Tuesday's morning drops Sanity to 0 before the day's snapshot exists.
    loaded.goHome();
    expect(loaded.state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "yesterday" });
    expect(loaded.state.day).toBe(2);

    loaded.retry();
    expect(loaded.state).toEqual(mondayStart);
    expect(loaded.state.day).toBe(1);
    expect(loaded.inkState).toBeNull();
  });

  it("emits dayStarted for the restored day", () => {
    const store = storeWith((state) => {
      state.pressures.performance = 1;
    });
    const days: number[] = [];
    store.on("dayStarted", (event) => days.push(event.day));
    store.chooseTask(store.state.openTasks[0], "sabotage");
    store.finishTaskAction();
    store.retry();
    expect(days).toEqual([1]);
  });
});

describe("loading", () => {
  it("resumes the Firing screen", () => {
    const storage = new FakeStorage();
    const store = storeWith((state) => {
      state.pressures.performance = 1;
    }, storage);
    store.chooseTask(store.state.openTasks[0], "sabotage");

    const reloaded = createStore(storage);
    expect(reloaded.continueGame()).toBe(true);
    expect(reloaded.state.phase).toEqual({ kind: "fired", pressure: "performance", retry: "thisDay" });
    reloaded.retry();
    expect(reloaded.state.phase).toEqual({ kind: "workday" });
  });

  it("runs the end-of-day steps when the save has 0 hours left", () => {
    const ended: number[] = [];
    const storage = new FakeStorage();
    createStore(storage).startOver();
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state.hoursLeft = 0;
    storage.setItem(SAVE_KEY, JSON.stringify(record));
    const reloaded = createStore(storage);
    reloaded.on("dayEnded", (event) => ended.push(event.day));
    reloaded.continueGame();
    expect(ended).toEqual([1]);
    expect(reloaded.state.day).toBe(2);
  });

  it("startOver overwrites the slot with a new Monday", () => {
    const storage = new FakeStorage();
    const store = storeWith((state) => {
      state.flags = ["old"];
    }, storage);
    store.startOver();
    const reloaded = createStore(storage);
    reloaded.continueGame();
    expect(reloaded.state.flags).toEqual([]);
    expect(reloaded.state.day).toBe(1);
  });
});

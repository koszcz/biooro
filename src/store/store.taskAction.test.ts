// Tests for store.ts: chooseTask and finishTaskAction. store.test.ts and the other store.*.test.ts files hold the rest.
import { describe, expect, it } from "vitest";
import type { StoreEvent } from "./events";
import { FakeStorage } from "./fakeStorage";
import { createStore, type GameStore } from "./store";

function recordEvents(store: GameStore): StoreEvent[] {
  const events: StoreEvent[] = [];
  for (const type of [
    "taskActionStarted",
    "pressureChanged",
    "hoursChanged",
    "taskResolved",
    "taskActionFinished",
    "dayEnded",
    "dayStarted",
    "fired",
  ] as const) {
    store.on(type, (event) => events.push(event));
  }
  return events;
}

function mondayStore(storage = new FakeStorage()): GameStore {
  const store = createStore(storage);
  store.startOver();
  return store;
}

describe("chooseTask and finishTaskAction", () => {
  it("emits taskActionStarted at once and holds pressureChanged until finishTaskAction", () => {
    const store = mondayStore();
    const events = recordEvents(store);
    const task = store.state.openTasks[0];

    store.chooseTask(task, "do");
    expect(events.map((event) => event.type)).toEqual(["taskActionStarted"]);
    expect(events[0]).toEqual({ type: "taskActionStarted", task, choice: "do", hours: 3 });
    // The Task choice is already applied at the click.
    expect(store.state.hoursLeft).toBe(5);

    store.finishTaskAction();
    const types = events.map((event) => event.type);
    expect(types).toContain("pressureChanged");
    expect(types.indexOf("pressureChanged")).toBeGreaterThan(0);
    expect(types.at(-1)).toBe("taskActionFinished");
  });

  it("autosaves the finished result at the click", () => {
    const storage = new FakeStorage();
    const store = mondayStore(storage);
    store.chooseTask(store.state.openTasks[0], "do");

    const reloaded = createStore(storage);
    reloaded.continueGame();
    expect(reloaded.state).toEqual(store.state);
  });

  it("runs the end-of-day steps when the action leaves 0 hours", () => {
    const store = mondayStore();
    const events = recordEvents(store);
    const [first, second] = store.state.openTasks;
    store.takeBreak();
    store.takeBreak();
    store.chooseTask(first, "do");
    store.finishTaskAction();
    store.chooseTask(second, "do");
    expect(events.map((event) => event.type)).not.toContain("dayEnded");

    store.finishTaskAction();
    const types = events.map((event) => event.type);
    expect(types.indexOf("dayEnded")).toBeGreaterThan(types.lastIndexOf("taskActionFinished"));
    expect(types.at(-1)).toBe("dayStarted");
    expect(store.state.day).toBe(2);
  });

  it("emits a mid-day Firing after taskActionFinished", () => {
    const storage = new FakeStorage();
    mondayStore(storage);
    const record = JSON.parse(storage.getItem("biooro.save") ?? "");
    record.state.pressures.performance = 1;
    storage.setItem("biooro.save", JSON.stringify(record));
    const store = createStore(storage);
    store.continueGame();
    const events = recordEvents(store);

    store.chooseTask(store.state.openTasks[0], "sabotage");
    expect(store.state.phase).toEqual({ kind: "fired", pressure: "performance", retry: "thisDay" });
    expect(events.map((event) => event.type)).toEqual(["taskActionStarted"]);
    store.finishTaskAction();
    expect(events.map((event) => event.type).slice(-2)).toEqual(["taskActionFinished", "fired"]);
  });
});

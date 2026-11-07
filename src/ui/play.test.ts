import { describe, expect, it } from "vitest";
import { createStore, type SaveStorage } from "../store/index";
import { createActing } from "./acting";
import { taskChoiceViews } from "./choices";
import { createPlay } from "./play";

function memoryStorage(): SaveStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

function newPlay() {
  const store = createStore(memoryStorage());
  const play = createPlay(store, createActing(store));
  store.startOver();
  return { store, play };
}

describe("createPlay", () => {
  it("starts a Task choice and leaves the finish to the scene", () => {
    const { store, play } = newPlay();
    const finished: string[] = [];
    store.on("taskActionFinished", (event) => finished.push(event.task.id));
    const task = store.state.openTasks[0];
    play.pick(task, taskChoiceViews(store.state, task)[0]);
    expect(finished).toEqual([]);
    store.finishTaskAction();
    expect(finished).toEqual(["mon-zbigniew"]);
    expect(store.state.hoursLeft).toBe(5);
    expect(store.state.pressures.performance).toBe(7);
  });

  it("ignores a locked pick", () => {
    const { store, play } = newPlay();
    const task = store.state.openTasks[0];
    const [, , delegate] = taskChoiceViews({ ...store.state, hoursLeft: 0 }, task);
    play.pick(task, delegate);
    expect(store.state.hoursLeft).toBe(8);
  });

  it("asks before going home while Tasks are open", () => {
    const { store, play } = newPlay();
    expect(play.goHome()).toBe("confirm");
    expect(store.state.day).toBe(1);
    play.goHome({ confirmed: true });
    expect(store.state.day).toBe(2);
  });

  it("goes home at once when no Tasks are open", () => {
    const { store, play } = newPlay();
    for (const task of [...store.state.openTasks]) {
      play.pick(task, taskChoiceViews(store.state, task)[1]);
      store.finishTaskAction();
    }
    expect(play.goHome()).toBe("done");
    expect(store.state.day).toBe(2);
  });

  it("plays Monday to Friday with Task choices, Breaks and going home", () => {
    const { store, play } = newPlay();
    const days: number[] = [];
    store.on("dayStarted", (event) => days.push(event.day));
    while (store.state.phase.kind === "workday") {
      const state = store.state;
      const task = state.openTasks[0];
      const pick = task && taskChoiceViews(state, task).find((view) => view.locked === null && view.rows === undefined);
      if (task && pick) {
        play.pick(task, pick);
        store.finishTaskAction();
      } else if (state.hoursLeft > 0 && state.pressures.sanity < 10) play.takeBreak();
      else play.goHome({ confirmed: true });
    }
    expect(days).toEqual([2, 3, 4, 5]);
    expect(store.state.phase.kind).toBe("audit");
  });
});

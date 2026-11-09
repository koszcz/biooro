import { describe, expect, it } from "vitest";
import type { GameState } from "../rules/index";
import { createStore, FakeStorage } from "../store/index";
import { createActing } from "./acting";
import { taskChoiceViews } from "./choices";
import { createPlay } from "./play";

function setUp() {
  const store = createStore(new FakeStorage());
  const acting = createActing(store);
  const play = createPlay(store, acting);
  store.startOver();
  const floats: string[][] = [];
  acting.onFloats((next) => floats.push(next.map((float) => float.text)));
  return { store, acting, play, floats };
}

/** Picks a Task choice by its label in the popover: Do it, Fake it or Sabotage it. */
function pick(setup: ReturnType<typeof setUp>, index: number, choice: "do" | "fake" | "sabotage") {
  const task = setup.store.state.openTasks[index];
  const view = taskChoiceViews(setup.store.state, task).find((v) => v.choice === choice);
  if (!view) throw new Error(`no ${choice} view`);
  setup.play.pick(task, view);
  return task;
}

const pressuresOf = (state: GameState) => state.pressures;

describe("what the HUD shows while a Task action plays", () => {
  it("keeps the old Pressures and Tasks on screen and drains one hour block per drained hour", () => {
    const setup = setUp();
    const before = setup.store.state;
    const task = pick(setup, 0, "do");

    expect(setup.acting.playing).toBe(true);
    const shown = setup.acting.shown(setup.store.state);
    expect(pressuresOf(shown)).toEqual(pressuresOf(before));
    expect(shown.openTasks).toEqual(before.openTasks);
    expect(shown.phase).toEqual({ kind: "workday" });
    expect(shown.hoursLeft).toBe(8);
    expect(setup.acting.busyTask).toEqual(task);

    setup.acting.drained(1);
    expect(setup.acting.shown(setup.store.state).hoursLeft).toBe(7);
    setup.acting.drained(3);
    setup.store.finishTaskAction();
    expect(setup.acting.playing).toBe(false);
    expect(setup.acting.shown(setup.store.state)).toBe(setup.store.state);
  });

  it("names the Task choice, the Task and the hours left in the tag over the Intern", () => {
    const setup = setUp();
    pick(setup, 0, "sabotage");
    expect(setup.acting.tag()).toEqual({
      label: "Sabotage it",
      task: "Print fifty of our new feedback moment forms, would you? Such a lovely shade of beige.",
      hours: 2,
      hoursLeft: 2,
      secret: true,
    });
    setup.acting.drained(1);
    expect(setup.acting.tag()?.hoursLeft).toBe(1);
  });

  it("floats each visible Pressure change when the action finishes, without goodwill on Monday", () => {
    const setup = setUp();
    pick(setup, 0, "do");
    expect(setup.floats).toEqual([]);
    setup.store.finishTaskAction();
    expect(setup.floats).toEqual([["+1 Performance", "−1 Sanity"]]);
  });

  it("floats goodwill changes from Tuesday", () => {
    const setup = setUp();
    setup.play.goHome({ confirmed: true });
    pick(setup, 0, "do"); // Pan Zbigniew's Launch Team Task, rolled over from Monday
    setup.store.finishTaskAction();
    expect(setup.floats).toEqual([["+1 Performance", "+1 Launch Team", "−1 Sanity"]]);
  });

  it("floats +2 Sanity at once for a Break", () => {
    const setup = setUp();
    setup.play.takeBreak();
    expect(setup.floats).toEqual([["+2 Sanity"]]);
    expect(setup.store.state.hoursLeft).toBe(7);
  });

  it("locks every Task choice, the Break and Go home while the action plays", () => {
    const setup = setUp();
    pick(setup, 0, "fake");
    pick(setup, 0, "fake");
    setup.play.takeBreak();
    expect(setup.play.goHome({ confirmed: true })).toBe("done");
    expect(setup.store.state.hoursLeft).toBe(7);
    expect(setup.store.state.day).toBe(1);
  });
});

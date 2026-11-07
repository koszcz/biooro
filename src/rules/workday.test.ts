import { describe, expect, it } from "vitest";
import {
  applyBreak,
  applyTaskChoice,
  breakLockedReason,
  type GameState,
  goHome,
  newGame,
  type OpenTask,
  taskChoiceLockedReason,
} from "./index";

const launchTask: OpenTask = { id: "mon-zbigniew", fallout: false };
const noSideTask: OpenTask = { id: "mon-anyone", fallout: false };

function monday(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(), day: 1, hoursLeft: 8, escalation: 1, openTasks: [launchTask, noSideTask], ...overrides };
}

describe("locked Task choices", () => {
  it("locks each Task choice that costs more hours than are left", () => {
    const at = (hoursLeft: number) =>
      (["do", "fake", "sabotage"] as const).map((choice) =>
        taskChoiceLockedReason(monday({ hoursLeft }), launchTask, choice),
      );
    expect(at(3)).toEqual([null, null, null]);
    expect(at(2)).toEqual(["notEnoughHours", null, null]);
    expect(at(1)).toEqual(["notEnoughHours", null, "notEnoughHours"]);
    expect(at(0)).toEqual(["notEnoughHours", "notEnoughHours", "notEnoughHours"]);
  });

  it("refuses to apply a locked Task choice", () => {
    expect(() => applyTaskChoice(monday({ hoursLeft: 2 }), launchTask, "do")).toThrow();
  });

  it("locks a Break when no hours are left", () => {
    expect(breakLockedReason(monday({ hoursLeft: 1 }))).toBeNull();
    expect(breakLockedReason(monday({ hoursLeft: 0 }))).toBe("notEnoughHours");
    expect(() => applyBreak(monday({ hoursLeft: 0 }))).toThrow();
  });
});

describe("applyBreak", () => {
  it("spends 1 hour and raises Sanity by 2", () => {
    const { state, events } = applyBreak(monday({ pressures: { ...newGame().pressures, sanity: 3 } }));
    expect(state.hoursLeft).toBe(7);
    expect(state.pressures.sanity).toBe(5);
    expect(events).toEqual([
      { type: "hoursChanged", hoursLeft: 7 },
      { type: "pressureChanged", pressure: "sanity", from: 3, to: 5 },
    ]);
  });

  it("never takes Sanity above 10", () => {
    const { state } = applyBreak(monday({ pressures: { ...newGame().pressures, sanity: 9 } }));
    expect(state.pressures.sanity).toBe(10);
  });

  it("helps nobody and finishes nothing", () => {
    const { state } = applyBreak(monday());
    expect(state.helpedToday).toEqual([]);
    expect(state.finishedToday).toEqual([]);
    expect(state.escalation).toBe(1);
  });
});

describe("goHome", () => {
  it("loses the leftover hours and leaves open Tasks open", () => {
    const { state, events } = goHome(monday({ hoursLeft: 5 }));
    expect(state.hoursLeft).toBe(0);
    expect(state.openTasks).toEqual([launchTask, noSideTask]);
    expect(events).toEqual([{ type: "hoursChanged", hoursLeft: 0 }]);
  });
});

describe("the mid-day Firing check", () => {
  it("fires the Intern straight after the Task choice that drops a Pressure to 0", () => {
    const start = monday({ pressures: { performance: 1, launchTeam: 6, paperTrail: 6, sanity: 6 } });
    const { state, events } = applyTaskChoice(start, noSideTask, "sabotage");
    expect(state.phase).toEqual({ kind: "fired", pressure: "performance", retry: "thisDay" });
    expect(events.at(-1)).toEqual({ type: "fired", pressure: "performance", retry: "thisDay" });
  });

  it("picks Performance over Launch Team goodwill when both reach 0 at once", () => {
    const start = monday({ pressures: { performance: 1, launchTeam: 2, paperTrail: 6, sanity: 6 } });
    const { state, events } = applyTaskChoice(start, launchTask, "sabotage");
    expect(state.pressures.performance).toBe(0);
    expect(state.pressures.launchTeam).toBe(0);
    expect(state.phase).toEqual({ kind: "fired", pressure: "performance", retry: "thisDay" });
    expect(events.filter((e) => e.type === "fired")).toEqual([
      { type: "fired", pressure: "performance", retry: "thisDay" },
    ]);
  });

  it("picks Launch Team goodwill over Paper Trail goodwill, and Paper Trail goodwill over Sanity", () => {
    const sabotagePaper = applyTaskChoice(
      monday({
        pressures: { performance: 6, launchTeam: 1, paperTrail: 2, sanity: 6 },
        openTasks: [{ id: "tue-halina", fallout: false }],
      }),
      { id: "tue-halina", fallout: false },
      "sabotage",
    );
    // Sabotage raises Launch Team goodwill, so only Paper Trail goodwill reaches 0 here.
    expect(sabotagePaper.state.phase).toEqual({ kind: "fired", pressure: "paperTrail", retry: "thisDay" });

    const doLaunch = applyTaskChoice(
      monday({ pressures: { performance: 6, launchTeam: 6, paperTrail: 0, sanity: 1 } }),
      launchTask,
      "do",
    );
    expect(doLaunch.state.pressures.sanity).toBe(0);
    expect(doLaunch.state.phase).toEqual({ kind: "fired", pressure: "paperTrail", retry: "thisDay" });
  });

  it("fires for Sanity when only Sanity reaches 0", () => {
    const start = monday({ pressures: { performance: 6, launchTeam: 6, paperTrail: 6, sanity: 1 } });
    const { state } = applyTaskChoice(start, launchTask, "do");
    expect(state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "thisDay" });
  });

  it("refuses Task choices and Breaks after a Firing", () => {
    const fired = monday({ phase: { kind: "fired", pressure: "sanity", retry: "thisDay" } });
    expect(() => applyTaskChoice(fired, launchTask, "fake")).toThrow();
    expect(() => applyBreak(fired)).toThrow();
  });
});

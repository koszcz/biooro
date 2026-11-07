import { describe, expect, it } from "vitest";
import { type GameState, newGame, startDay } from "./index";

/** The end of Monday, before Tuesday's morning steps. */
function mondayNight(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(), day: 1, escalation: 1, ...overrides };
}

describe("startDay: guards", () => {
  it("refuses to start a day after Friday or after a Firing", () => {
    expect(() => startDay({ ...newGame(), day: 5 })).toThrow();
    expect(() => startDay(mondayNight({ phase: { kind: "fired", pressure: "sanity", retry: "thisDay" } }))).toThrow();
  });
});

describe("startDay: Tuesday", () => {
  it("drops Sanity, reveals goodwill, and grows Tasks by 1 for every 2 finished yesterday", () => {
    const { state, events } = startDay(mondayNight({ finishedToday: ["mon-zbigniew", "mon-anyone"] }));
    expect(state.pressures.sanity).toBe(5);
    expect(state.openTasks.map((task) => task.id)).toEqual(["tue-halina", "tue-zbigniew", "tue-anyone"]);
    expect(state.finishedToday).toEqual([]);
    expect(events.map((event) => event.type)).toEqual([
      "pressureChanged",
      "goodwillRevealed",
      "taskAssigned",
      "taskAssigned",
      "taskAssigned",
      "dayStarted",
    ]);
  });

  it("puts rolled-over Tasks before the new ones", () => {
    const rolled = { id: "mon-anyone", fallout: false } as const;
    const { state } = startDay(mondayNight({ openTasks: [rolled] }));
    expect(state.openTasks).toEqual([
      rolled,
      { id: "tue-halina", fallout: false },
      { id: "tue-zbigniew", fallout: false },
    ]);
  });

  it("fires the Intern when Sanity drops to 0, with 'Retry yesterday', and stops the morning", () => {
    const tired = mondayNight({ pressures: { performance: 6, launchTeam: 6, paperTrail: 6, sanity: 1 } });
    const { state, events } = startDay(tired);
    expect(state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "yesterday" });
    expect(state.openTasks).toEqual([]);
    expect(events.at(-1)).toEqual({ type: "fired", pressure: "sanity", retry: "yesterday" });
    expect(events.map((event) => event.type)).not.toContain("dayStarted");
  });
});

describe("startDay: Monday", () => {
  it("runs the morning steps from a new game", () => {
    const { state, events } = startDay(newGame());
    expect(state.day).toBe(1);
    expect(state.escalation).toBe(1);
    expect(state.hoursLeft).toBe(8);
    expect(state.pressures.sanity).toBe(6);
    expect(state.openTasks).toEqual([
      { id: "mon-zbigniew", fallout: false },
      { id: "mon-anyone", fallout: false },
    ]);
    expect(events).toEqual([
      { type: "taskAssigned", task: { id: "mon-zbigniew", fallout: false } },
      { type: "taskAssigned", task: { id: "mon-anyone", fallout: false } },
      { type: "dayStarted", day: 1 },
    ]);
  });
});

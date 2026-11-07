import { describe, expect, it } from "vitest";
import { applyTaskChoice, type GameState, newGame, type OpenTask, startDay } from "./index";

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

describe("startDay on Friday", () => {
  it("starts with 5 Task hours", () => {
    expect(startDay({ ...newGame(), day: 4, escalation: 4 }).state.hoursLeft).toBe(5);
  });
});

function night(day: number, escalation: number, overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(), day, escalation, ...overrides };
}

describe("strange Task swaps", () => {
  it("leave Tuesday alone while the tier is still Mundane", () => {
    const { state } = startDay(night(1, 1));
    expect(state.openTasks).toEqual([
      { id: "tue-halina", fallout: false },
      { id: "tue-zbigniew", fallout: false },
    ]);
  });

  it("replace the last slot used when the tier is above the day's starting tier", () => {
    const { state, events } = startDay(night(1, 2));
    const strange: OpenTask = { id: "tue-zbigniew", fallout: false, strange: "tue-strange" };
    expect(state.openTasks).toEqual([{ id: "tue-halina", fallout: false }, strange]);
    expect(events).toContainEqual({ type: "taskAssigned", task: strange });
  });

  it("replace the last slot of a longer day, keeping that slot's side", () => {
    const finished = ["mon-zbigniew", "mon-anyone"] as const;
    const { state } = startDay(night(1, 2, { finishedToday: [...finished] }));
    expect(state.openTasks.at(-1)).toEqual({ id: "tue-anyone", fallout: false, strange: "tue-strange" });
  });

  it("leave Wednesday alone at Odd and swap it at Wrong", () => {
    expect(startDay(night(2, 3)).state.openTasks.at(-1)).toEqual({ id: "wed-wiola", fallout: false });
    expect(startDay(night(2, 4)).state.openTasks.at(-1)).toEqual({
      id: "wed-wiola",
      fallout: false,
      strange: "wed-strange",
    });
  });

  it("swap Thursday at Wrong", () => {
    expect(startDay(night(3, 4)).state.openTasks.at(-1)?.strange).toBe("thu-strange");
  });

  it("never touch Monday or Friday", () => {
    expect(startDay(night(4, 9)).state.openTasks.some((task) => task.strange)).toBe(false);
  });

  it("return as strange Fallout when faked", () => {
    const strange: OpenTask = { id: "tue-zbigniew", fallout: false, strange: "tue-strange" };
    const tuesday = night(2, 3, { hoursLeft: 8, openTasks: [strange] });
    const faked = applyTaskChoice(tuesday, strange, "fake").state;
    const thursday = startDay({ ...faked, day: 3 }).state;
    expect(thursday.openTasks).toContainEqual({ id: "tue-zbigniew", fallout: true, strange: "tue-strange" });
  });
});

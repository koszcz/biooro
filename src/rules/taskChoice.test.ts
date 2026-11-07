import { describe, expect, it } from "vitest";
import { applyTaskChoice, type GameState, newGame, type OpenTask } from "./index";

const launchTask: OpenTask = { id: "tue-zbigniew", fallout: false };
const paperTask: OpenTask = { id: "tue-halina", fallout: false };
const noSideTask: OpenTask = { id: "tue-anyone", fallout: false };

/** Tuesday at the start of work: all Pressures at 6, Escalation 2, three Tasks open. */
function tuesday(overrides: Partial<GameState> = {}): GameState {
  return {
    ...newGame(),
    day: 2,
    hoursLeft: 8,
    escalation: 2,
    openTasks: [paperTask, launchTask, noSideTask],
    ...overrides,
  };
}

describe("applyTaskChoice: Do it", () => {
  it("on a Launch Team Task spends 3 hours, raises Performance and Launch Team goodwill, costs Sanity", () => {
    const { state } = applyTaskChoice(tuesday(), launchTask, "do");
    expect(state.hoursLeft).toBe(5);
    expect(state.pressures).toEqual({ performance: 7, launchTeam: 7, paperTrail: 6, sanity: 5 });
    expect(state.escalation).toBe(2);
    expect(state.helpedToday).toEqual(["launchTeam"]);
    expect(state.finishedToday).toEqual(["tue-zbigniew"]);
    expect(state.openTasks).toEqual([paperTask, noSideTask]);
  });
});

// Rows of the spec's "Task choices" table, with the "Helping a Faction" column and Escalation.
// Each case starts from Tuesday: Pressures at 6, Escalation 2, 8 hours left.
// biome-ignore format: one line per row keeps the table readable against the spec.
const rows = [
  { name: "Do it, no side", task: noSideTask, choice: "do", hours: 5, perf: 7, launch: 6, paper: 6, sanity: 5, helped: [], esc: 2, finished: true },
  { name: "Do it, Paper Trail", task: paperTask, choice: "do", hours: 5, perf: 6, launch: 6, paper: 7, sanity: 5, helped: ["paperTrail"], esc: 3, finished: true },
  { name: "Fake it, Launch Team", task: launchTask, choice: "fake", hours: 7, perf: 7, launch: 6, paper: 6, sanity: 6, helped: [], esc: 2, finished: true },
  { name: "Fake it, Paper Trail", task: paperTask, choice: "fake", hours: 7, perf: 6, launch: 6, paper: 6, sanity: 6, helped: [], esc: 2, finished: true },
  { name: "Fake it, no side", task: noSideTask, choice: "fake", hours: 7, perf: 7, launch: 6, paper: 6, sanity: 6, helped: [], esc: 2, finished: true },
  { name: "Sabotage it, Launch Team", task: launchTask, choice: "sabotage", hours: 6, perf: 5, launch: 4, paper: 7, sanity: 7, helped: ["paperTrail"], esc: 3, finished: false },
  { name: "Sabotage it, Paper Trail", task: paperTask, choice: "sabotage", hours: 6, perf: 5, launch: 7, paper: 4, sanity: 7, helped: ["launchTeam"], esc: 3, finished: false },
  { name: "Sabotage it, no side", task: noSideTask, choice: "sabotage", hours: 6, perf: 5, launch: 6, paper: 6, sanity: 7, helped: [], esc: 3, finished: false },
] as const;

describe("applyTaskChoice: every row of the Task choices table", () => {
  it.each(rows)("$name", (row) => {
    const { state } = applyTaskChoice(tuesday(), row.task, row.choice);
    expect(state.hoursLeft).toBe(row.hours);
    expect(state.pressures).toEqual({
      performance: row.perf,
      launchTeam: row.launch,
      paperTrail: row.paper,
      sanity: row.sanity,
    });
    expect(state.helpedToday).toEqual(row.helped);
    expect(state.escalation).toBe(row.esc);
    expect(state.finishedToday).toEqual(row.finished ? [row.task.id] : []);
    expect(state.openTasks).not.toContainEqual(row.task);
  });
});

describe("applyTaskChoice: Pressures and Escalation", () => {
  it("never takes a Pressure above 10, and emits no change for a capped Pressure", () => {
    const start = tuesday({ pressures: { performance: 10, launchTeam: 10, paperTrail: 6, sanity: 6 } });
    const { state, events } = applyTaskChoice(start, launchTask, "do");
    expect(state.pressures).toEqual({ performance: 10, launchTeam: 10, paperTrail: 6, sanity: 5 });
    expect(events.filter((e) => e.type === "pressureChanged")).toEqual([
      { type: "pressureChanged", pressure: "sanity", from: 6, to: 5 },
    ]);
  });

  it("adds only 1 Escalation for sabotaging a Launch Team Task, which also helps the Paper Trail", () => {
    const { state } = applyTaskChoice(tuesday({ escalation: 0 }), launchTask, "sabotage");
    expect(state.escalation).toBe(1);
  });

  it("emits tierChanged when a Task choice moves Escalation across a tier boundary", () => {
    const { events } = applyTaskChoice(tuesday({ escalation: 2 }), paperTask, "do");
    expect(events).toContainEqual({ type: "tierChanged", tier: "odd" });
  });

  it("emits no tierChanged when the tier stays the same", () => {
    const { events } = applyTaskChoice(tuesday({ escalation: 3 }), paperTask, "do");
    expect(events.some((e) => e.type === "tierChanged")).toBe(false);
  });

  it("records each Faction once in the helped-today list", () => {
    const start = tuesday({ openTasks: [launchTask, { id: "mon-zbigniew", fallout: false }] });
    const first = applyTaskChoice(start, launchTask, "do").state;
    const second = applyTaskChoice(first, { id: "mon-zbigniew", fallout: false }, "do").state;
    expect(second.helpedToday).toEqual(["launchTeam"]);
  });

  it("emits the hours, Pressure changes and taskResolved", () => {
    const { events } = applyTaskChoice(tuesday(), launchTask, "fake");
    expect(events).toEqual([
      { type: "hoursChanged", hoursLeft: 7 },
      { type: "pressureChanged", pressure: "performance", from: 6, to: 7 },
      { type: "taskResolved", task: launchTask, choice: "fake" },
    ]);
  });
});

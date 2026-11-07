import { describe, expect, it } from "vitest";
import {
  applyTaskChoice,
  type ColleagueId,
  type GameState,
  newGame,
  type OpenTask,
  taskChoiceLockedReason,
} from "./index";

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

// Rows of the spec's "Delegating" table, plus the "Helping a Faction" column.
// Each case starts from Tuesday: Pressures at 6, Escalation 2, 8 hours left. Delegating costs 1 hour and 0 Sanity.
// biome-ignore format: one line per row keeps the table readable against the spec.
const rows = [
  { name: "Launch Team Task to Ryszard", task: launchTask, to: "ryszard", perf: 7, launch: 5, paper: 6, esc: 2, fallout: true, helped: [] },
  { name: "Launch Team Task to Wiola", task: launchTask, to: "wiola", perf: 7, launch: 6, paper: 6, esc: 2, fallout: false, helped: ["launchTeam"] },
  { name: "Launch Team Task to Kamil", task: launchTask, to: "kamil", perf: 6, launch: 5, paper: 5, esc: 3, fallout: false, helped: ["paperTrail"] },
  { name: "Paper Trail Task to Ryszard", task: paperTask, to: "ryszard", perf: 6, launch: 5, paper: 6, esc: 2, fallout: true, helped: [] },
  { name: "Paper Trail Task to Wiola", task: paperTask, to: "wiola", perf: 6, launch: 5, paper: 7, esc: 3, fallout: false, helped: ["paperTrail"] },
  { name: "Paper Trail Task to Kamil", task: paperTask, to: "kamil", perf: 6, launch: 6, paper: 6, esc: 3, fallout: false, helped: ["paperTrail"] },
  { name: "No-side Task to Ryszard", task: noSideTask, to: "ryszard", perf: 7, launch: 5, paper: 6, esc: 2, fallout: true, helped: [] },
  { name: "No-side Task to Wiola", task: noSideTask, to: "wiola", perf: 7, launch: 5, paper: 6, esc: 2, fallout: false, helped: [] },
  { name: "No-side Task to Kamil", task: noSideTask, to: "kamil", perf: 6, launch: 6, paper: 5, esc: 3, fallout: false, helped: ["paperTrail"] },
] as const;

describe("applyTaskChoice: every row of the Delegating table", () => {
  it.each(rows)("$name", (row) => {
    const { state } = applyTaskChoice(tuesday(), row.task, "delegate", row.to);
    expect(state.hoursLeft).toBe(7);
    expect(state.pressures).toEqual({
      performance: row.perf,
      launchTeam: row.launch,
      paperTrail: row.paper,
      sanity: 6,
    });
    expect(state.escalation).toBe(row.esc);
    expect(state.helpedToday).toEqual(row.helped);
    expect(state.finishedToday).toEqual([row.task.id]);
    expect(state.openTasks).not.toContainEqual(row.task);
    expect(state.pendingFallout).toEqual(row.fallout ? [{ id: row.task.id, dueDay: 4 }] : []);
  });

  it("emits taskResolved with the Colleague", () => {
    const { events } = applyTaskChoice(tuesday(), launchTask, "delegate", "wiola");
    expect(events).toContainEqual({ type: "taskResolved", task: launchTask, choice: "delegate", colleague: "wiola" });
  });
});

describe("Ryszard's Fallout", () => {
  it("never arrives when it would be due after Friday", () => {
    const { state } = applyTaskChoice(tuesday({ day: 4 }), launchTask, "delegate", "ryszard");
    expect(state.pendingFallout).toEqual([]);
  });
});

describe("the trust lock", () => {
  const colleagues: [ColleagueId, "launchTeam" | "paperTrail"][] = [
    ["ryszard", "launchTeam"],
    ["wiola", "launchTeam"],
    ["kamil", "paperTrail"],
  ];

  it.each(colleagues)("%s is locked when goodwill is below 5, with the spec's reason", (colleague, faction) => {
    const state = tuesday();
    state.pressures[faction] = 4;
    expect(taskChoiceLockedReason(state, launchTask, "delegate", colleague)).toBe(`${colleague}DoesntTrust`);
    expect(() => applyTaskChoice(state, launchTask, "delegate", colleague)).toThrow();
  });

  it.each(colleagues)("%s is open at goodwill of exactly 5", (colleague, faction) => {
    const state = tuesday();
    state.pressures[faction] = 5;
    expect(taskChoiceLockedReason(state, launchTask, "delegate", colleague)).toBeNull();
  });

  it("locks only the Colleagues of the distrusting Faction", () => {
    const state = tuesday();
    state.pressures.paperTrail = 2;
    expect(taskChoiceLockedReason(state, launchTask, "delegate", "ryszard")).toBeNull();
    expect(taskChoiceLockedReason(state, launchTask, "delegate", "kamil")).toBe("kamilDoesntTrust");
  });

  it("still reports not enough hours first", () => {
    expect(taskChoiceLockedReason(tuesday({ hoursLeft: 0 }), launchTask, "delegate", "wiola")).toBe("notEnoughHours");
  });

  it("needs a Colleague to delegate", () => {
    expect(() => applyTaskChoice(tuesday(), launchTask, "delegate")).toThrow();
  });
});

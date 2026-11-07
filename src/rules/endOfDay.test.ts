import { describe, expect, it } from "vitest";
import { answerAudit, endDay, type GameState, newGame, type OpenTask } from "./index";

const rolled: OpenTask = { id: "tue-anyone", fallout: false };
const fallout: OpenTask = { id: "mon-zbigniew", fallout: true };

function evening(day: number, overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(), day, escalation: day, ...overrides };
}

describe("endDay", () => {
  it("on Monday, rolls each unhandled Task over at Performance 1 each, with no neutrality cost", () => {
    const { state, events } = endDay(evening(1, { openTasks: [rolled, { id: "mon-anyone", fallout: false }] }));
    expect(state.pressures).toEqual({ performance: 4, launchTeam: 6, paperTrail: 6, sanity: 6 });
    expect(state.openTasks).toHaveLength(2);
    expect(events.at(-1)).toEqual({ type: "dayEnded", day: 1 });
  });

  it("expires ignored Fallout at Performance 3 and Escalation 1, without the rollover cost", () => {
    const { state, events } = endDay(
      evening(3, { escalation: 4, openTasks: [rolled, fallout], helpedToday: ["launchTeam", "paperTrail"] }),
    );
    expect(state.pressures.performance).toBe(2);
    expect(state.escalation).toBe(5);
    expect(state.openTasks).toEqual([rolled]);
    expect(events).toContainEqual({ type: "tierChanged", tier: "wrong" });
  });

  it("from Tuesday, costs 1 goodwill for each Faction the Intern did not help", () => {
    const { state } = endDay(evening(2, { helpedToday: ["paperTrail"] }));
    expect(state.pressures).toEqual({ performance: 6, launchTeam: 5, paperTrail: 6, sanity: 6 });
  });

  it("runs one Firing check with 'Retry this day' and skips dayEnded", () => {
    const low = { performance: 1, launchTeam: 1, paperTrail: 6, sanity: 6 };
    const { state, events } = endDay(evening(2, { pressures: low, openTasks: [rolled] }));
    expect(state.phase).toEqual({ kind: "fired", pressure: "performance", retry: "thisDay" });
    expect(events.filter((event) => event.type === "fired")).toHaveLength(1);
    expect(events.map((event) => event.type)).not.toContain("dayEnded");
  });
});

function fridayEvening(pressures: Partial<GameState["pressures"]> = {}): GameState {
  const base = newGame();
  return { ...base, day: 5, escalation: 5, pressures: { ...base.pressures, ...pressures } };
}

describe("endDay and answerAudit on Friday", () => {
  it("runs the end-of-day steps and a Firing check, then waits for the audit", () => {
    const { state, events } = endDay(fridayEvening());
    expect(state.phase).toEqual({ kind: "audit" });
    expect(state.pressures).toEqual({ performance: 6, launchTeam: 5, paperTrail: 5, sanity: 6 });
    expect(events.map((event) => event.type)).not.toContain("dayEnded");
  });

  it("fires before the audit when the end-of-day steps drop a Pressure to 0", () => {
    const { state } = endDay(fridayEvening({ paperTrail: 1 }));
    expect(state.phase).toEqual({ kind: "fired", pressure: "paperTrail", retry: "thisDay" });
  });

  it.each([
    ["bury", { launchTeam: 7, paperTrail: 5, sanity: 6 }, "launchTeam"],
    ["escalate", { launchTeam: 5, paperTrail: 7, sanity: 6 }, "paperTrail"],
    ["deflect", { launchTeam: 5, paperTrail: 5, sanity: 4 }, "equal"],
  ] as const)("answering '%s' applies its effect, then the week is survived", (answer, pressures, variant) => {
    const audit = endDay(fridayEvening()).state;
    const { state, events } = answerAudit(audit, answer);
    expect(state.pressures).toEqual({ performance: 6, ...pressures });
    expect(state.phase).toEqual({ kind: "weekSurvived", variant });
    expect(events.slice(-2)).toEqual([
      { type: "dayEnded", day: 5 },
      { type: "weekSurvived", variant },
    ]);
  });

  it("runs the second Firing check after the audit answer", () => {
    const audit = endDay(fridayEvening({ sanity: 2 })).state;
    const { state, events } = answerAudit(audit, "deflect");
    expect(state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "thisDay" });
    expect(events.map((event) => event.type)).not.toContain("weekSurvived");
  });

  it("rejects an audit answer outside the audit", () => {
    expect(() => answerAudit(fridayEvening(), "bury")).toThrow();
  });
});

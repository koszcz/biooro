import { describe, expect, it } from "vitest";
import { answerAudit, endDay, type GameState, newGame, startDay } from "./index";

function thursdayNight(): GameState {
  return { ...newGame(), day: 4, escalation: 4 };
}

function fridayEvening(pressures: Partial<GameState["pressures"]> = {}): GameState {
  const base = newGame();
  return { ...base, day: 5, escalation: 5, pressures: { ...base.pressures, ...pressures } };
}

describe("Friday", () => {
  it("starts with 5 Task hours", () => {
    expect(startDay(thursdayNight()).state.hoursLeft).toBe(5);
  });

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

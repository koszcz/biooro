import { describe, expect, it } from "vitest";
import { endDay, type GameState, newGame, type OpenTask } from "./index";

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

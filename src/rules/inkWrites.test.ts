import { describe, expect, it } from "vitest";
import { adjustPressure, escalate, newGame, setFlag } from "./index";

describe("Ink writes", () => {
  it("adjusts one Pressure and emits pressureChanged", () => {
    const result = adjustPressure(newGame(), "sanity", 1);
    expect(result.state.pressures.sanity).toBe(7);
    expect(result.events).toEqual([{ type: "pressureChanged", pressure: "sanity", from: 6, to: 7 }]);
  });

  it("never takes a Pressure below the floor", () => {
    const low = adjustPressure(newGame(), "launchTeam", -5).state;
    expect(low.pressures.launchTeam).toBe(1);
    const floored = adjustPressure(low, "launchTeam", -1, 1);
    expect(floored.state.pressures.launchTeam).toBe(1);
    expect(floored.events).toEqual([]);
    expect(adjustPressure(low, "launchTeam", -1).state.pressures.launchTeam).toBe(0);
  });

  it("sets a story flag once", () => {
    const state = setFlag(setFlag(newGame(), "met_halina").state, "met_halina").state;
    expect(state.flags).toEqual(["met_halina"]);
  });

  it("adds 1 Escalation and emits tierChanged at a tier boundary", () => {
    const start = { ...newGame(), escalation: 2 };
    const result = escalate(start);
    expect(result.state.escalation).toBe(3);
    expect(result.events).toEqual([{ type: "tierChanged", tier: "odd" }]);
  });
});

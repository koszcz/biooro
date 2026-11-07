import { describe, expect, it } from "vitest";
import { sceneTitle } from "./sceneFrame";

describe("sceneTitle", () => {
  it("names the day and the scene", () => {
    expect(sceneTitle({ kind: "onboarding" })).toBe("Monday 9:00 · Onboarding");
  });

  it("names the Pressure that hit 0 in a Firing", () => {
    expect(sceneTitle({ kind: "firing", pressure: "performance" })).toBe("Fired · Performance hit 0");
  });
});

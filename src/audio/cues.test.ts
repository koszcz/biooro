import { describe, expect, it } from "vitest";
import { cueFor, musicLevels } from "./cues";

const task = { id: "t", slot: 0 } as never;

describe("cueFor", () => {
  it("picks a sound for each moment the spec lists", () => {
    expect(cueFor({ type: "taskAssigned", task })).toBe("bubble");
    expect(cueFor({ type: "taskActionStarted", task, choice: "do", hours: 1 })).toBe("choice-do");
    expect(cueFor({ type: "taskActionStarted", task, choice: "fake", hours: 1 })).toBe("choice-fake");
    expect(cueFor({ type: "taskActionStarted", task, choice: "delegate", hours: 1 })).toBe("choice-delegate");
    expect(cueFor({ type: "taskActionStarted", task, choice: "sabotage", hours: 1 })).toBe("choice-sabotage");
    expect(cueFor({ type: "fired", pressure: "sanity", retry: "day" } as never)).toBe("fired");
    expect(cueFor({ type: "dayEnded", day: 2 })).toBe("day-end");
  });

  it("plays the drop sound only when a Pressure falls", () => {
    expect(cueFor({ type: "pressureChanged", pressure: "sanity", from: 5, to: 3 })).toBe("pressure-drop");
    expect(cueFor({ type: "pressureChanged", pressure: "sanity", from: 3, to: 5 })).toBeUndefined();
  });

  it("stays quiet for other events", () => {
    expect(cueFor({ type: "hoursChanged", hoursLeft: 3 })).toBeUndefined();
  });
});

describe("musicLevels", () => {
  it("plays only the variant for the tier", () => {
    expect(musicLevels("mundane", false)).toEqual({ clean: 1, odd: 0, wrong: 0 });
    expect(musicLevels("odd", false)).toEqual({ clean: 0, odd: 1, wrong: 0 });
    expect(musicLevels("wrong", false)).toEqual({ clean: 0, odd: 0, wrong: 1 });
  });

  it("cuts all music during a Firing scene", () => {
    expect(musicLevels("odd", true)).toEqual({ clean: 0, odd: 0, wrong: 0 });
  });
});

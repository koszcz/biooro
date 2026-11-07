import { describe, expect, it } from "vitest";
import { jumpToDay, playDefaultDay, setDebugFlag, setDebugPressure } from "./debug";
import { FakeStorage } from "./fakeStorage";
import { createStore } from "./store";

const playDayByHand = playDefaultDay;

describe("debug panel commands", () => {
  it("jumping to Thursday matches playing Monday to Wednesday with the default policy", () => {
    const played = createStore(new FakeStorage());
    played.startOver();
    for (let day = 1; day <= 3; day++) playDayByHand(played);
    expect(played.state.day).toBe(4);
    expect(played.state.phase).toEqual({ kind: "workday" });
    expect(played.state.hoursLeft).toBe(8);

    const jumped = createStore(new FakeStorage());
    jumped.startOver();
    jumpToDay(jumped, 4);
    expect(jumped.state).toEqual(played.state);
  });

  it("jumps from a later day back to an earlier one", () => {
    const store = createStore(new FakeStorage());
    store.startOver();
    jumpToDay(store, 4);
    jumpToDay(store, 2);
    expect(store.state.day).toBe(2);
  });

  it("jumps to Monday with a full day of hours", () => {
    const store = createStore(new FakeStorage());
    store.startOver();
    jumpToDay(store, 3);
    jumpToDay(store, 1);
    expect(store.state.day).toBe(1);
    expect(store.state.hoursLeft).toBe(8);
  });

  it("sets a Pressure, clamped to 0 through 10, and saves it", () => {
    const storage = new FakeStorage();
    const store = createStore(storage);
    store.startOver();
    setDebugPressure(store, "sanity", 99);
    expect(store.state.pressures.sanity).toBe(10);
    setDebugPressure(store, "sanity", 3);
    const reloaded = createStore(storage);
    reloaded.continueGame();
    expect(reloaded.state.pressures.sanity).toBe(3);
  });

  it("sets and clears a flag", () => {
    const store = createStore(new FakeStorage());
    store.startOver();
    setDebugFlag(store, "metWiola", true);
    expect(store.state.flags).toContain("metWiola");
    setDebugFlag(store, "metWiola", true);
    expect(store.state.flags.filter((f) => f === "metWiola")).toHaveLength(1);
    setDebugFlag(store, "metWiola", false);
    expect(store.state.flags).not.toContain("metWiola");
  });
});

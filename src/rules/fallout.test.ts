import { describe, expect, it } from "vitest";
import { applyTaskChoice, type GameState, newGame, type OpenTask, startDay, taskChoiceLockedReason } from "./index";

const task: OpenTask = { id: "mon-zbigniew", fallout: false };
const fallout: OpenTask = { id: "mon-zbigniew", fallout: true };

function workday(day: number, overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(), day, hoursLeft: 8, escalation: day, openTasks: [task], ...overrides };
}

describe("Fake it queues Fallout", () => {
  it("returns the Task two days later", () => {
    const { state } = applyTaskChoice(workday(1), task, "fake");
    expect(state.pendingFallout).toEqual([{ id: "mon-zbigniew", dueDay: 3 }]);
  });

  it.each([4, 5])("never queues Fallout that would arrive after Friday (day %i)", (day) => {
    const { state } = applyTaskChoice(workday(day), task, "fake");
    expect(state.pendingFallout).toEqual([]);
  });
});

describe("Fallout arrives", () => {
  it("on its due day, after rolled-over Tasks and before new Tasks", () => {
    const rolled: OpenTask = { id: "tue-anyone", fallout: false };
    const tuesdayNight = workday(2, {
      hoursLeft: 0,
      openTasks: [rolled],
      pendingFallout: [{ id: "mon-zbigniew", dueDay: 3 }],
    });
    const { state, events } = startDay(tuesdayNight);
    expect(state.openTasks).toEqual([
      rolled,
      fallout,
      { id: "wed-kamil", fallout: false },
      { id: "wed-wiola", fallout: false },
    ]);
    expect(state.pendingFallout).toEqual([]);
    expect(events).toContainEqual({ type: "falloutArrived", task: fallout });
  });
});

describe("Task choices on a Fallout Task", () => {
  it("Do it takes 4 hours and counts as finished", () => {
    const { state } = applyTaskChoice(workday(3, { openTasks: [fallout] }), fallout, "do");
    expect(state.hoursLeft).toBe(4);
    expect(state.pressures).toEqual({ performance: 7, launchTeam: 7, paperTrail: 6, sanity: 5 });
    expect(state.finishedToday).toEqual(["mon-zbigniew"]);
  });

  it("Do it is locked with 3 hours left", () => {
    expect(taskChoiceLockedReason(workday(3, { hoursLeft: 3, openTasks: [fallout] }), fallout, "do")).toBe(
      "notEnoughHours",
    );
  });

  it("Fake it is locked because the Task was already faked", () => {
    expect(taskChoiceLockedReason(workday(3, { openTasks: [fallout] }), fallout, "fake")).toBe("alreadyFaked");
  });

  it("Delegate it to Ryszard is locked because he already faked it", () => {
    const state = workday(3, { openTasks: [fallout] });
    expect(taskChoiceLockedReason(state, fallout, "delegate", "ryszard")).toBe("ryszardAlreadyFaked");
    expect(taskChoiceLockedReason(state, fallout, "delegate", "wiola")).toBeNull();
  });

  it("Sabotage it follows the normal row and creates no Fallout", () => {
    const { state } = applyTaskChoice(workday(3, { openTasks: [fallout] }), fallout, "sabotage");
    expect(state.pressures).toEqual({ performance: 5, launchTeam: 4, paperTrail: 7, sanity: 7 });
    expect(state.pendingFallout).toEqual([]);
  });
});

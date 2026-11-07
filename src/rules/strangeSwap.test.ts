import { describe, expect, it } from "vitest";
import { applyTaskChoice, type GameState, newGame, type OpenTask, startDay } from "./index";

function night(day: number, escalation: number, overrides: Partial<GameState> = {}): GameState {
  return { ...newGame(), day, escalation, ...overrides };
}

describe("strange Task swaps", () => {
  it("leave Tuesday alone while the tier is still Mundane", () => {
    const { state } = startDay(night(1, 1));
    expect(state.openTasks).toEqual([
      { id: "tue-halina", fallout: false },
      { id: "tue-zbigniew", fallout: false },
    ]);
  });

  it("replace the last slot used when the tier is above the day's starting tier", () => {
    const { state, events } = startDay(night(1, 2));
    const strange: OpenTask = { id: "tue-zbigniew", fallout: false, strange: "tue-strange" };
    expect(state.openTasks).toEqual([{ id: "tue-halina", fallout: false }, strange]);
    expect(events).toContainEqual({ type: "taskAssigned", task: strange });
  });

  it("replace the last slot of a longer day, keeping that slot's side", () => {
    const finished = ["mon-zbigniew", "mon-anyone"] as const;
    const { state } = startDay(night(1, 2, { finishedToday: [...finished] }));
    expect(state.openTasks.at(-1)).toEqual({ id: "tue-anyone", fallout: false, strange: "tue-strange" });
  });

  it("leave Wednesday alone at Odd and swap it at Wrong", () => {
    expect(startDay(night(2, 3)).state.openTasks.at(-1)).toEqual({ id: "wed-wiola", fallout: false });
    expect(startDay(night(2, 4)).state.openTasks.at(-1)).toEqual({
      id: "wed-wiola",
      fallout: false,
      strange: "wed-strange",
    });
  });

  it("swap Thursday at Wrong", () => {
    expect(startDay(night(3, 4)).state.openTasks.at(-1)?.strange).toBe("thu-strange");
  });

  it("never touch Monday or Friday", () => {
    expect(startDay(night(4, 9)).state.openTasks.some((task) => task.strange)).toBe(false);
  });

  it("return as strange Fallout when faked", () => {
    const strange: OpenTask = { id: "tue-zbigniew", fallout: false, strange: "tue-strange" };
    const tuesday = night(2, 3, { hoursLeft: 8, openTasks: [strange] });
    const faked = applyTaskChoice(tuesday, strange, "fake").state;
    const thursday = startDay({ ...faked, day: 3 }).state;
    expect(thursday.openTasks).toContainEqual({ id: "tue-zbigniew", fallout: true, strange: "tue-strange" });
  });
});

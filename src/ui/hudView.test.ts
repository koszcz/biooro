import { describe, expect, it } from "vitest";
import { type GameState, newGame, startDay } from "../rules/index";
import { bubbleGroups, bubbleViews, hudView, urgentTasks } from "./hudView";

function monday(): GameState {
  return startDay(newGame()).state;
}

function tuesday(): GameState {
  return startDay({ ...monday(), hoursLeft: 0 }).state;
}

describe("hudView gauges", () => {
  it("shows only Perf and Sanity on Monday", () => {
    expect(hudView(monday()).gauges.map((gauge) => [gauge.label, gauge.value])).toEqual([
      ["Perf", 6],
      ["Sanity", 6],
    ]);
  });

  it("shows all four gauges from Tuesday", () => {
    expect(hudView(tuesday()).gauges.map((gauge) => gauge.label)).toEqual(["Perf", "Launch", "Paper", "Sanity"]);
  });

  it("pulses a gauge at 2 or lower", () => {
    const state = { ...tuesday(), pressures: { performance: 3, launchTeam: 2, paperTrail: 1, sanity: 0 } };
    expect(hudView(state).gauges.map((gauge) => gauge.low)).toEqual([false, true, true, true]);
  });

  it("previews a Task choice as a striped section between the old and new value", () => {
    const preview = { hours: 3, deltas: { performance: 1, launchTeam: 1, sanity: -1 } };
    const gauges = hudView(monday(), preview).gauges;
    expect(gauges.map((gauge) => gauge.preview)).toEqual([
      { from: 6, to: 7 },
      { from: 6, to: 5 },
    ]);
  });

  it("clamps the preview to 0 and 10", () => {
    const state = { ...monday(), pressures: { ...monday().pressures, performance: 10 } };
    const gauges = hudView(state, { hours: 1, deltas: { performance: 1 } }).gauges;
    expect(gauges[0].preview).toBeNull();
  });
});

describe("hudView hours", () => {
  it("shows 8 blocks with the spent ones empty", () => {
    const view = hudView({ ...monday(), hoursLeft: 5 });
    expect(view.hoursLabel).toBe("5h");
    expect(view.blocks).toEqual(["left", "left", "left", "left", "left", "spent", "spent", "spent"]);
  });

  it("previews the hours a Task choice would spend in orange", () => {
    const view = hudView({ ...monday(), hoursLeft: 5 }, { hours: 3, deltas: {} });
    expect(view.blocks).toEqual(["left", "left", "preview", "preview", "preview", "spent", "spent", "spent"]);
  });

  it("locks the Break with no hours left", () => {
    expect(hudView(monday()).breakLocked).toBeNull();
    expect(hudView({ ...monday(), hoursLeft: 0 }).breakLocked).toBe("Not enough hours left today.");
  });
});

describe("bubbleViews", () => {
  it("puts each Task over its assigner, and anyone Tasks over the Intern", () => {
    expect(bubbleViews(monday()).map((bubble) => [bubble.over, bubble.task.id])).toEqual([
      ["zbigniew", "mon-zbigniew"],
      ["intern", "mon-anyone"],
    ]);
  });

  it("shows the full Task text", () => {
    expect(bubbleViews(monday())[0].text).toBe(
      "Print fifty of our new feedback moment forms, would you? Such a lovely shade of beige.",
    );
  });

  it("uses a grey border on Monday and the Task side from Tuesday", () => {
    expect(bubbleViews(monday()).map((bubble) => bubble.border)).toEqual(["none", "none"]);
    expect(bubbleViews(tuesday()).map((bubble) => [bubble.task.id, bubble.border])).toEqual([
      ["mon-zbigniew", "launchTeam"],
      ["mon-anyone", "none"],
      ["tue-halina", "paperTrail"],
      ["tue-zbigniew", "launchTeam"],
    ]);
  });

  it("marks a Fallout Task and uses its Fallout wording", () => {
    const state = { ...tuesday(), openTasks: [{ id: "mon-anyone" as const, fallout: true }] };
    const [bubble] = bubbleViews(state);
    expect(bubble.fallout).toBe(true);
    expect(bubble.text).toBe(
      "The mugs are back, and the teabag has grown something. Scrub every mug properly this time.",
    );
  });
});

describe("bubbleGroups", () => {
  const zbigniew = (...fallout: boolean[]) => ({
    ...monday(),
    openTasks: fallout.map((isFallout, i) => ({
      id: i % 2 ? ("tue-zbigniew" as const) : ("mon-zbigniew" as const),
      fallout: isFallout,
    })),
  });

  it("shows every bubble and no pill for a person with fewer than 3 Tasks", () => {
    const [group] = bubbleGroups(zbigniew(false, false));
    expect(group.bubbles).toHaveLength(2);
    expect(group.pill).toBeNull();
  });

  it("shows two bubbles and a pill with the hidden count for five Tasks on one person", () => {
    const groups = bubbleGroups(zbigniew(false, false, false, false, false));
    expect(groups).toHaveLength(1);
    expect(groups[0].bubbles).toHaveLength(2);
    expect(groups[0].pill).toEqual({ text: "+3 more from Pan Zbigniew", fallout: null });
  });

  it("adds a warning count to the pill when a hidden Task is Fallout", () => {
    const [group] = bubbleGroups(zbigniew(false, false, false, true, true, true));
    expect(group.bubbles.map((bubble) => bubble.fallout)).toEqual([true, true]);
    expect(group.pill).toEqual({ text: "+4 more from Pan Zbigniew", fallout: "⚠ 1" });
  });

  it("sorts Fallout first, then oldest first", () => {
    const state = zbigniew(false, true, false);
    const [group] = bubbleGroups(state);
    expect(group.bubbles.map((bubble) => [bubble.task.id, bubble.fallout])).toEqual([
      ["tue-zbigniew", true],
      ["mon-zbigniew", false],
    ]);
    expect(urgentTasks(state, "zbigniew").map((bubble) => bubble.fallout)).toEqual([true, false, false]);
  });
});

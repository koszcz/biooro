import { describe, expect, it } from "vitest";
import { type GameState, newGame, type OpenTask, startDay } from "../rules";
import { taskChoiceViews } from "./choices";

function monday(): GameState {
  return startDay(newGame()).state;
}

function tuesday(): GameState {
  return { ...monday(), day: 2, hoursLeft: 8 };
}

const launchTask: OpenTask = { id: "mon-zbigniew", fallout: false };
const chipTexts = (view: { chips: { text: string }[] }) => view.chips.map((chip) => chip.text);

describe("taskChoiceViews", () => {
  it("shows all four Task choices with their hours", () => {
    const views = taskChoiceViews(monday(), launchTask);
    expect(views.map((view) => [view.label, view.hours])).toEqual([
      ["Do it", 3],
      ["Fake it", 1],
      ["Delegate it", 1],
      ["Sabotage it", 2],
    ]);
  });

  it("leaves goodwill out of the chips on Monday", () => {
    const [doIt, , , sabotage] = taskChoiceViews(monday(), launchTask);
    expect(chipTexts(doIt)).toEqual(["+1 Perf", "−1 Sanity"]);
    expect(chipTexts(sabotage)).toEqual(["−1 Perf", "+1 Sanity"]);
  });

  it("shows goodwill chips from Tuesday", () => {
    const [doIt, , , sabotage] = taskChoiceViews(tuesday(), launchTask);
    expect(chipTexts(doIt)).toEqual(["+1 Perf", "+1 Launch", "−1 Sanity"]);
    expect(chipTexts(sabotage)).toEqual(["−1 Perf", "−2 Launch", "+1 Paper", "+1 Sanity"]);
  });

  it("keeps hidden goodwill in the preview deltas", () => {
    const [doIt] = taskChoiceViews(monday(), launchTask);
    expect(doIt.deltas).toEqual({ performance: 1, launchTeam: 1, sanity: -1 });
  });

  it("locks a Task choice that needs more hours than are left, with its reason", () => {
    const state = { ...monday(), hoursLeft: 2 };
    const [doIt, fake] = taskChoiceViews(state, launchTask);
    expect(doIt.locked).toBe("Not enough hours left today.");
    expect(fake.locked).toBeNull();
  });

  it("locks faking a Fallout Task and Ryszard on it", () => {
    const fallout: OpenTask = { id: "mon-zbigniew", fallout: true };
    const state = { ...tuesday(), openTasks: [fallout] };
    const [doIt, fake, delegate] = taskChoiceViews(state, fallout);
    expect(doIt.hours).toBe(4);
    expect(fake.locked).toBe("You already faked this once.");
    expect(delegate.rows?.[0]).toMatchObject({ colleague: "ryszard", locked: "Ryszard already faked this once." });
  });

  it("opens one delegate row per Colleague with effects and a note", () => {
    const [, , delegate] = taskChoiceViews(tuesday(), launchTask);
    expect(delegate.rows?.map((row) => [row.name, chipTexts(row), row.note])).toEqual([
      ["Ryszard", ["+1 Perf", "−1 Launch"], "He fakes it. It comes back as Fallout in 2 days."],
      ["Wiola", ["+1 Perf"], "She does it properly."],
      ["Kamil", ["−1 Launch", "−1 Paper"], "He escalates it to the Paper Trail."],
    ]);
    expect(delegate.locked).toBeNull();
  });

  it('says "Nobody will take it" when all three Colleagues are locked', () => {
    const state = { ...tuesday(), pressures: { performance: 6, launchTeam: 4, paperTrail: 4, sanity: 6 } };
    const [, , delegate] = taskChoiceViews(state, launchTask);
    expect(delegate.rows?.map((row) => row.locked)).toEqual([
      "Ryszard doesn't trust you yet",
      "Wiola doesn't trust you yet",
      "Kamil doesn't trust you yet",
    ]);
    expect(delegate.locked).toBe("Nobody will take it");
  });
});

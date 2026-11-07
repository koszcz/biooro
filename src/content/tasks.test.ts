import { describe, expect, it } from "vitest";
import { COLLEAGUES, STRANGE_TASKS, TASK_SLOTS, TASKS, taskById } from "./index";

describe("Colleagues", () => {
  it("match the spec's cast table and delegation rules", () => {
    expect(COLLEAGUES).toEqual({
      ryszard: { name: "Ryszard", faction: "launchTeam", handling: "fakes" },
      wiola: { name: "Wiola", faction: "launchTeam", handling: "doesProperly" },
      kamil: { name: "Kamil", faction: "paperTrail", handling: "escalates" },
    });
  });
});

describe("Task slots", () => {
  it("match the spec's Task slots table, with each assigner's Task side", () => {
    const table = Object.values(TASK_SLOTS).map((ids) =>
      ids.map((id) => `${taskById(id).assigner}:${taskById(id).side ?? "none"}`),
    );
    expect(table).toEqual([
      ["zbigniew:launchTeam", "anyone:none"],
      ["halina:paperTrail", "zbigniew:launchTeam", "anyone:none"],
      ["kamil:paperTrail", "wiola:launchTeam", "ryszard:launchTeam"],
      ["halina:paperTrail", "zbigniew:launchTeam", "kamil:paperTrail", "anyone:none"],
      ["zbigniew:launchTeam", "halina:paperTrail", "wiola:launchTeam", "ryszard:launchTeam"],
    ]);
  });

  it("use each of the 16 slot Tasks exactly once", () => {
    const used = Object.values(TASK_SLOTS).flat();
    expect(used).toHaveLength(16);
    expect(new Set(used)).toEqual(new Set(Object.keys(TASKS)));
  });
});

describe("Task places", () => {
  it("put each slot Task where its work happens, with the desk only for Tasks with no better place", () => {
    const places = Object.fromEntries(Object.entries(TASKS).map(([id, task]) => [id, task.place]));
    expect(places).toEqual({
      "mon-zbigniew": "printer",
      "mon-anyone": "sink",
      "tue-halina": "evidenceShelf",
      "tue-zbigniew": "shredder",
      "tue-anyone": "plant",
      "wed-kamil": "printer",
      "wed-wiola": "room4",
      "wed-ryszard": "desk",
      "thu-halina": "evidenceShelf",
      "thu-zbigniew": "shredder",
      "thu-kamil": "room4",
      "thu-anyone": "plant",
      "fri-zbigniew": "shredder",
      "fri-halina": "evidenceShelf",
      "fri-wiola": "room4",
      "fri-ryszard": "printer",
    });
  });

  it("put each strange swap Task where its work happens", () => {
    expect(STRANGE_TASKS).toEqual({
      "tue-strange": { place: "room4" },
      "wed-strange": { place: "desk" },
      "thu-strange": { place: "printer" },
    });
  });
});

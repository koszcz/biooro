import { describe, expect, it } from "vitest";
import { TASK_SLOTS, TASKS, taskById } from "./index";

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

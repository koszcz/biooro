import { describe, expect, it } from "vitest";
import { FALLOUT_WORDING, STRANGE_TASK_WORDING, TASK_WORDING } from "../index";

const ALL_LINES = { ...TASK_WORDING, ...STRANGE_TASK_WORDING, ...FALLOUT_WORDING };

describe("Fallout wording", () => {
  it("has one line for each of the 11 Tasks that can return: Monday to Wednesday slots plus the 3 swaps", () => {
    expect(Object.keys(FALLOUT_WORDING).sort()).toEqual(
      [
        "mon-zbigniew.fallout",
        "mon-anyone.fallout",
        "tue-halina.fallout",
        "tue-zbigniew.fallout",
        "tue-anyone.fallout",
        "wed-kamil.fallout",
        "wed-wiola.fallout",
        "wed-ryszard.fallout",
        "tue-strange.fallout",
        "wed-strange.fallout",
        "thu-strange.fallout",
      ].sort(),
    );
  });
});

describe("Task wording", () => {
  it("has real wording for every slot Task, strange swap Task and Fallout Task", () => {
    expect(Object.keys(ALL_LINES)).toHaveLength(16 + 3 + 11);
    for (const [id, line] of Object.entries(ALL_LINES)) {
      expect(line.trim(), id).not.toBe("");
      expect(line, id).not.toMatch(/placeholder/i);
    }
  });
});

const INFORMAL_BOSS_NAME = /(?<!Pan )Zbigniew|(?<!Pani )Halina/;

describe("Polish names", () => {
  it("names the Bosses formally, as Pan Zbigniew and Pani Halina", () => {
    expect("Ask Zbigniew.").toMatch(INFORMAL_BOSS_NAME);
    expect(Object.values(ALL_LINES).filter((line) => INFORMAL_BOSS_NAME.test(line))).toEqual([]);
  });
});

describe("Tone", () => {
  it("keeps Monday dull: no Faction and no Smart range before the Intern discovers them on Tuesday", () => {
    expect(TASK_WORDING["mon-zbigniew"]).not.toMatch(/Launch Team|Paper Trail|Smart/);
    expect(TASK_WORDING["mon-anyone"]).not.toMatch(/Launch Team|Paper Trail|Smart/);
  });

  it("never reveals what the Smart range does with what it measures", () => {
    for (const [id, line] of Object.entries(ALL_LINES)) {
      expect(line, id).not.toMatch(/harvest|\bdata\b|upload|collect/i);
    }
  });
});

describe("Strange swap Tasks", () => {
  // A swap takes over whichever slot came last, so any Boss, Colleague or the Intern may say it.
  it("name no cast member, so the line works from any assigner", () => {
    const swapLines = [
      ...Object.values(STRANGE_TASK_WORDING),
      FALLOUT_WORDING["tue-strange.fallout"],
      FALLOUT_WORDING["wed-strange.fallout"],
      FALLOUT_WORDING["thu-strange.fallout"],
    ];
    for (const line of swapLines) expect(line).not.toMatch(/Zbigniew|Halina|Ryszard|Wiola|Kamil/);
  });
});

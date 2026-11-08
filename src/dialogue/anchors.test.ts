import { Story } from "inkjs";
import { describe, expect, it } from "vitest";
import { story } from "../story/index";

// The voice anchors are sample scenes from docs/writing/voice.md. The game never starts them.
// They show each character at every tier, so they must play cleanly and change no game state.

const ANCHORS = ["zbigniew", "halina", "ryszard", "wiola", "kamil"].map((person) => `${person}_voice_anchor`);
const TIERS = ["mundane", "odd", "wrong"] as const;

interface Played {
  lines: string[];
  untagged: string[];
}

/** Plays `knot` at `tier`, taking choice `pick` at every choice point. Any game write throws. */
function playAnchor(knot: string, tier: string, pick: number): Played {
  const ink = new Story(story);
  const write = (name: string) => () => {
    throw new Error(`${knot} calls ${name}(), but a voice anchor must not change the game.`);
  };
  ink.BindExternalFunction("tier", () => tier, true);
  ink.BindExternalFunction("pressure", () => 5, true);
  ink.BindExternalFunction("flag", () => false, true);
  ink.BindExternalFunction("day", () => 1, true);
  ink.BindExternalFunction("adjust", write("adjust"));
  ink.BindExternalFunction("set_flag", write("set_flag"));
  ink.BindExternalFunction("escalate", write("escalate"));
  ink.ChoosePathString(knot);
  const played: Played = { lines: [], untagged: [] };
  for (;;) {
    while (ink.canContinue) {
      const text = (ink.Continue() ?? "").trim();
      if (text === "") continue;
      played.lines.push(text);
      if (!(ink.currentTags ?? []).some((tag) => tag.startsWith("id:"))) played.untagged.push(text);
    }
    if (ink.currentChoices.length === 0) return played;
    ink.ChooseChoiceIndex(Math.min(pick, ink.currentChoices.length - 1));
  }
}

describe.each(ANCHORS)("the voice anchor %s", (knot) => {
  it("plays every choice path at every tier, with an id on every line", () => {
    for (const tier of TIERS) {
      for (const pick of [0, 1, 2]) {
        const played = playAnchor(knot, tier, pick);
        expect(played.lines.length).toBeGreaterThan(3);
        expect(played.untagged).toEqual([]);
      }
    }
  });

  it("sounds different at each tier", () => {
    const [mundane, odd, wrong] = TIERS.map((tier) => playAnchor(knot, tier, 0).lines.join("\n"));
    expect(new Set([mundane, odd, wrong]).size).toBe(3);
  });
});

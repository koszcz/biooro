import { describe, expect, it } from "vitest";
import { CAST, COLLEAGUES, type ColleagueId } from "../content/index";
import { brushOffKnot, Dialogue, readHandOffLine } from "../dialogue/index";
import { type Tier, tierOf } from "../rules/index";
import { createStore, FakeStorage, SAVE_KEY } from "../store/index";
import { story } from "../story/index";
import { SAY_MS } from "./actionLayer";
import { BRUSH_OFF_MS } from "./conversationStyles";
import { REVEAL_SPEED } from "./conversationText";

// Brush-offs and hand-off lines fade on a timer. Each must finish its reveal by half that time,
// so the player has the other half to read it.

const TIERS: Tier[] = ["mundane", "odd", "wrong"];
const TIER_ESCALATION: Record<Tier, number> = { mundane: 0, odd: 3, wrong: 5 };
const COLLEAGUE_IDS = Object.keys(COLLEAGUES) as ColleagueId[];

/** The longest line, in characters, that reveals within half of `shownMs`. */
const longestFor = (shownMs: number): number => Math.floor((REVEAL_SPEED * shownMs) / 1000 / 2);

function dialogueAt(tier: Tier): Dialogue {
  const storage = new FakeStorage();
  createStore(storage).startOver();
  const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
  record.state = { ...record.state, escalation: TIER_ESCALATION[tier] };
  storage.setItem(SAVE_KEY, JSON.stringify(record));
  const store = createStore(storage);
  store.continueGame();
  expect(tierOf(store.state.escalation)).toBe(tier);
  return new Dialogue(store, story);
}

describe("short line timing", () => {
  it.each(TIERS)("gives every brush-off at the %s tier time to be read", (tier) => {
    const dialogue = dialogueAt(tier);
    const tooLong = CAST.flatMap((person) => dialogue.readLines(brushOffKnot(person)))
      .map((line) => line.text)
      .filter((text) => text.length > longestFor(BRUSH_OFF_MS));
    expect(tooLong).toEqual([]);
  });

  it("gives every hand-off line time to be read", () => {
    const dialogue = dialogueAt("mundane");
    const tooLong = COLLEAGUE_IDS.map((colleague) => readHandOffLine(dialogue, colleague).text).filter(
      (text) => text.length > longestFor(SAY_MS),
    );
    expect(tooLong).toEqual([]);
  });
});

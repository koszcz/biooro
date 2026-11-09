import { describe, expect, it } from "vitest";
import { type CastId, COLLEAGUES } from "../content/index";
import { type ColleagueId, type GameState, type Tier, tierOf } from "../rules/index";
import { createStore, FakeStorage, SAVE_KEY } from "../store/index";
import { story } from "../story/index";
import { Dialogue } from "./bridge";
import { type ConversationStage, Conversations, type ConversationView, handOffLine } from "./conversations";

// The short lines every character says outside a full Conversation: brush-offs and hand-off lines.

const CAST: CastId[] = ["zbigniew", "halina", "ryszard", "wiola", "kamil"];
const COLLEAGUE_IDS = Object.keys(COLLEAGUES) as ColleagueId[];
const TIERS: Tier[] = ["mundane", "odd", "wrong"];
/** The lowest Escalation for each tier. */
const TIER_ESCALATION: Record<Tier, number> = { mundane: 0, odd: 3, wrong: 5 };

/** A store that continues a Monday save at `tier`, after the onboarding. */
function storeAt(tier: Tier) {
  const storage = new FakeStorage();
  const seed = createStore(storage);
  seed.startOver();
  const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
  const state: GameState = record.state;
  record.state = { ...state, escalation: TIER_ESCALATION[tier], flags: ["onboarded"] };
  storage.setItem(SAVE_KEY, JSON.stringify(record));
  const store = createStore(storage);
  store.continueGame();
  expect(tierOf(store.state.escalation)).toBe(tier);
  return store;
}

const stage: ConversationStage = {
  walkBeside: async () => {},
  faceEachOther: () => () => {},
};

/** Clicks `person` once, or twice for a Colleague so the second click finds their Conversation held. */
async function brushOffOf(person: CastId, tier: Tier): Promise<string[]> {
  const store = storeAt(tier);
  const shown: string[] = [];
  const view: ConversationView = {
    say: async () => {},
    choose: async () => 0,
    brushOff: (who, text) => void shown.push(`${who}: ${text}`),
    approach: () => {},
  };
  const conversations = new Conversations(store, new Dialogue(store, story), stage, view);
  if (conversations.availability(person) === "available") await conversations.click(person);
  await conversations.click(person);
  return shown;
}

describe("brush-offs", () => {
  it.each(CAST)("gives %s one drafted line at each tier, different at each tier", async (person) => {
    const lines: string[] = [];
    for (const tier of TIERS) {
      const shown = await brushOffOf(person, tier);
      expect(shown).toHaveLength(1);
      expect(shown[0].startsWith(`${person}: `)).toBe(true);
      lines.push(shown[0]);
    }
    expect(lines.filter((line) => line.includes("Placeholder"))).toEqual([]);
    expect(new Set(lines).size).toBe(TIERS.length);
  });

  it("gives every cast member a line of their own", async () => {
    const texts = new Set<string>();
    for (const person of CAST) {
      for (const tier of TIERS) {
        for (const line of await brushOffOf(person, tier)) texts.add(line.slice(`${person}: `.length));
      }
    }
    expect(texts.size).toBe(CAST.length * TIERS.length);
  });
});

describe("hand-off lines", () => {
  it.each(COLLEAGUE_IDS)("gives %s one drafted line with an id", (colleague) => {
    const store = storeAt("mundane");
    const line = handOffLine(new Dialogue(store, story), colleague);
    expect(line.id).not.toBeNull();
    expect(line.text).not.toBe("");
    expect(line.text).not.toContain("Placeholder");
  });

  it("gives each Colleague a different line", () => {
    const store = storeAt("mundane");
    const dialogue = new Dialogue(store, story);
    const texts = COLLEAGUE_IDS.map((colleague) => handOffLine(dialogue, colleague).text);
    expect(new Set(texts).size).toBe(COLLEAGUE_IDS.length);
  });

  it("says the same line at every tier", () => {
    for (const colleague of COLLEAGUE_IDS) {
      const texts = TIERS.map((tier) => handOffLine(new Dialogue(storeAt(tier), story), colleague).text);
      expect(new Set(texts).size).toBe(1);
    }
  });
});

import { describe, expect, it } from "vitest";
import { type GameState, PRESSURES, type Pressure, type Tier } from "../rules/index";
import { createStore, SAVE_KEY, type SaveStorage } from "../store/index";
import { story } from "../story/index";
import { Dialogue } from "./bridge";
import { sceneSpec } from "./scenes";

// Plays the four Firing scenes through the bridge, every choice path at every tier.
// A Firing can play on any day, so each scene needs a line for each tier.

/** The lowest Escalation that gives each tier. */
const TIER_ESCALATION: Record<Tier, number> = { mundane: 0, odd: 3, wrong: 5 };
const TIERS = Object.keys(TIER_ESCALATION) as Tier[];

function memoryStorage(): SaveStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

/** A store that continues a Monday save at the lowest Escalation for `tier`. */
function storeAt(tier: Tier) {
  const storage = memoryStorage();
  createStore(storage).startOver();
  const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
  const state: GameState = record.state;
  record.state = { ...state, escalation: TIER_ESCALATION[tier], flags: ["onboarded"] };
  storage.setItem(SAVE_KEY, JSON.stringify(record));
  const store = createStore(storage);
  store.continueGame();
  return store;
}

interface Played {
  lines: string[];
  untagged: string[];
  /** How many choices each choice point offered, in order. */
  branching: number[];
  pressures: Record<Pressure, number>;
  before: Record<Pressure, number>;
}

/** Plays one Firing scene, taking `choice` at its choice point. */
function play(pressure: Pressure, tier: Tier, choice: number): Played {
  const store = storeAt(tier);
  const before = { ...store.state.pressures };
  const spec = sceneSpec({ kind: "firing", pressure });
  const dialogue = new Dialogue(store, story, { strict: true });
  dialogue.start(spec.person, spec.knot, true);
  const played: Played = { lines: [], untagged: [], branching: [], pressures: before, before };
  while (dialogue.active) {
    if (dialogue.canContinue) {
      const line = dialogue.continue();
      if (line.text === "") continue;
      played.lines.push(line.text);
      if (line.id === null) played.untagged.push(line.text);
    } else if (dialogue.finished) dialogue.end();
    else {
      const choices = dialogue.choices;
      played.branching.push(choices.length);
      played.untagged.push(...choices.filter((option) => option.id === null).map((option) => option.text));
      const picked = choices[choice] ?? choices[0];
      played.lines.push(`> ${picked.text}`);
      dialogue.choose(picked.index);
    }
  }
  played.pressures = { ...store.state.pressures };
  return played;
}

describe.each(PRESSURES)("the %s Firing scene", (pressure) => {
  it("plays both choices at every tier, with an id on every line and no Pressure change", () => {
    for (const tier of TIERS) {
      for (const choice of [0, 1]) {
        const played = play(pressure, tier, choice);
        expect(played.lines.length).toBeGreaterThanOrEqual(5);
        expect(played.lines.length).toBeLessThanOrEqual(9);
        expect(played.branching).toEqual([2]);
        expect(played.untagged).toEqual([]);
        expect(played.lines.filter((line) => line.includes("Placeholder"))).toEqual([]);
        expect(played.pressures).toEqual(played.before);
      }
    }
  });

  it("sounds different at each tier", () => {
    const texts = TIERS.map((tier) => play(pressure, tier, 0).lines.join("\n"));
    expect(new Set(texts).size).toBe(TIERS.length);
  });
});

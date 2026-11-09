import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { type ColleagueId, type GameState, PRESSURES, type Pressure, type Tier, tierOf } from "../rules/index";
import { createStore, FakeStorage, SAVE_KEY } from "../store/index";
import { story } from "../story/index";
import { Dialogue } from "./bridge";
import { conversationKnot } from "./conversations";

// Plays all 14 Colleague Conversations through the bridge, with the caps on.
// Each one plays every choice path at every tier its day can reach, with and without the story flags.

const WEEK: ReadonlyArray<readonly [ColleagueId, readonly number[]]> = [
  ["ryszard", [2, 3, 4, 5]],
  ["wiola", [1, 2, 3, 4, 5]],
  ["kamil", [1, 2, 3, 4, 5]],
];

const CONVERSATIONS = WEEK.flatMap(([colleague, days]) => days.map((day) => ({ colleague, day })));

/** The Escalation that gives each tier. Escalation adds 1 each morning, so a day never starts below its number. */
const TIER_ESCALATION: Record<Tier, number> = { mundane: 0, odd: 3, wrong: 5 };

const reachableTiers = (day: number): Tier[] =>
  (Object.keys(TIER_ESCALATION) as Tier[]).filter((tier) => tierOf(Math.max(day, TIER_ESCALATION[tier])) === tier);

/** Every flag that a Conversation sets, read from the Ink files. */
const STORY_FLAGS: string[] = (() => {
  const folder = join(import.meta.dirname, "../story");
  const names = new Set<string>();
  for (const file of readdirSync(folder).filter((name) => name.endsWith(".ink") && name !== "test.ink")) {
    for (const match of readFileSync(join(folder, file), "utf8").matchAll(/set_flag\("(\w+)"\)/g)) names.add(match[1]);
  }
  // The onboarding sets "onboarded". Every save in these tests already holds it.
  names.delete("onboarded");
  return [...names];
})();

/** A store that continues a save on `day`, at the lowest Escalation for `tier`, holding `flags`. */
function storeOn(day: number, tier: Tier, flags: string[]) {
  const storage = new FakeStorage();
  const seed = createStore(storage);
  seed.startOver();
  const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
  const state: GameState = record.state;
  record.state = { ...state, day, escalation: Math.max(day, TIER_ESCALATION[tier]), flags: ["onboarded", ...flags] };
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
  /** The net change to each Pressure that the Conversation moved. */
  changes: Partial<Record<Pressure, number>>;
}

/** Takes `path[i]` at the i-th choice point, or the first choice after the path runs out. */
function pick(dialogue: Dialogue, path: number[], played: Played): void {
  const choices = dialogue.choices;
  const choice = choices[path[played.branching.length] ?? 0];
  played.branching.push(choices.length);
  played.untagged.push(...choices.filter((option) => option.id === null).map((option) => option.text));
  played.lines.push(`> ${choice.text}`);
  dialogue.choose(choice.index);
}

function changesBetween(before: Record<Pressure, number>, after: Record<Pressure, number>): Played["changes"] {
  return Object.fromEntries(
    PRESSURES.filter((pressure) => after[pressure] !== before[pressure]).map((pressure) => [
      pressure,
      after[pressure] - before[pressure],
    ]),
  );
}

/** Plays one Conversation along `path`. */
function play(colleague: ColleagueId, day: number, tier: Tier, flags: string[], path: number[]): Played {
  const store = storeOn(day, tier, flags);
  const before = { ...store.state.pressures };
  const dialogue = new Dialogue(store, story, { strict: true });
  dialogue.start(colleague, conversationKnot(colleague, day), false);
  const played: Played = { lines: [], untagged: [], branching: [], changes: {} };
  while (dialogue.active) {
    if (dialogue.canContinue) {
      const line = dialogue.continue();
      if (line.text === "") continue;
      played.lines.push(line.text);
      if (line.id === null) played.untagged.push(line.text);
    } else if (dialogue.finished) dialogue.end();
    else pick(dialogue, path, played);
  }
  played.changes = changesBetween(before, store.state.pressures);
  return played;
}

/** Plays every choice path, by trying each choice at each choice point in turn. */
function playEveryPath(colleague: ColleagueId, day: number, tier: Tier, flags: string[]): Played[] {
  const all: Played[] = [];
  const pending: number[][] = [[]];
  for (let path = pending.pop(); path; path = pending.pop()) {
    const played = play(colleague, day, tier, flags, path);
    all.push(played);
    for (let point = path.length; point < played.branching.length; point += 1) {
      const taken = Array.from({ length: point }, (_, i) => path[i] ?? 0);
      for (let other = 1; other < played.branching[point]; other += 1) pending.push([...taken, other]);
    }
  }
  return all;
}

describe.each(CONVERSATIONS)("the Conversation of $colleague on day $day", ({ colleague, day }) => {
  it("plays every choice path at every reachable tier, within the caps, with an id on every line", () => {
    for (const tier of reachableTiers(day)) {
      for (const flags of [[], STORY_FLAGS]) {
        for (const played of playEveryPath(colleague, day, tier, flags)) {
          // A real Conversation has an opening, a choice and a reply at least.
          expect(played.lines.length).toBeGreaterThan(3);
          expect(played.untagged).toEqual([]);
          expect(played.lines.filter((line) => line.includes("Placeholder"))).toEqual([]);
          expect(Object.keys(played.changes).length).toBeLessThanOrEqual(1);
          expect(played.changes.performance).toBeUndefined();
        }
      }
    }
  });

  it("offers the Intern a choice", () => {
    const [played] = playEveryPath(colleague, day, reachableTiers(day)[0], []);
    expect(played.branching.length).toBeGreaterThan(0);
  });

  it("sounds different at each tier its day can reach", () => {
    const tiers = reachableTiers(day);
    const texts = tiers.map((tier) => play(colleague, day, tier, [], []).lines.join("\n"));
    expect(new Set(texts).size).toBe(tiers.length);
  });
});

describe.each(WEEK)("%s's week", (colleague, days) => {
  it("has roughly as many choice paths that raise a Pressure as paths that lower one", () => {
    let raises = 0;
    let lowers = 0;
    for (const day of days) {
      for (const played of playEveryPath(colleague, day, reachableTiers(day)[0], [])) {
        const net = Object.values(played.changes).reduce((sum, change) => sum + change, 0);
        if (net > 0) raises += 1;
        if (net < 0) lowers += 1;
      }
    }
    expect(raises).toBeGreaterThan(0);
    expect(Math.abs(raises - lowers)).toBeLessThanOrEqual(1);
  });
});

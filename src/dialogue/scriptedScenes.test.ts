import { describe, expect, it } from "vitest";
import type { AuditAnswer, GameState, SurvivalVariant } from "../rules/index";
import { createStore, FakeStorage, SAVE_KEY } from "../store/index";
import { story } from "../story/index";
import { Dialogue } from "./bridge";
import type { ConversationStage, ConversationView, Speaker } from "./conversations";
import { type SceneFrame, Scenes } from "./scenes";

// Plays the drafted scripted scenes through the bridge and the scene player: the Monday onboarding,
// the Friday audit and the three survival scenes. Each test tries every choice path.

/** A view that takes `path[i]` at the i-th choice point, or the first choice once the path runs out. */
class PathView implements ConversationView {
  readonly shown: string[] = [];
  readonly speakers = new Set<Speaker>();
  /** The lines of each scene, keyed by its kind, such as "audit". */
  readonly byScene = new Map<string, string[]>();
  scene = "";
  /** How many choices each choice point offered, in order. */
  readonly branching: number[] = [];

  constructor(private readonly path: number[]) {}

  async say(speaker: Speaker, text: string): Promise<void> {
    this.speakers.add(speaker);
    this.shown.push(`${speaker}: ${text}`);
    const lines = this.byScene.get(this.scene) ?? [];
    lines.push(`${speaker}: ${text}`);
    this.byScene.set(this.scene, lines);
  }

  async choose(choices: readonly string[]): Promise<number> {
    const picked = this.path[this.branching.length] ?? 0;
    this.branching.push(choices.length);
    return picked;
  }

  brushOff(): void {}
  approach(): void {}
}

const stage: ConversationStage = {
  walkBeside: async () => {},
  faceEachOther: () => () => {},
};

/** Plays the scene a store starts, with a view that follows `path`. */
async function play(path: number[], state?: (fresh: GameState) => GameState) {
  const storage = new FakeStorage();
  if (state) {
    const seed = createStore(storage);
    seed.startOver();
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state = state({ ...record.state, flags: ["onboarded"] });
    storage.setItem(SAVE_KEY, JSON.stringify(record));
  }
  const store = createStore(storage);
  const dialogue = new Dialogue(store, story, { strict: true });
  const view = new PathView(path);
  const frame: SceneFrame = {
    open: (scene) => {
      view.scene = scene.kind;
    },
    close() {},
  };
  const scenes = new Scenes(store, dialogue, stage, view, frame);
  if (state) {
    store.continueGame(dialogue.loadInk);
    scenes.resume();
  }
  return { store, view, scenes, dialogue };
}

/** Runs `once` for every choice path, by trying each choice at each choice point in turn. */
async function everyPath(once: (path: number[]) => Promise<PathView>): Promise<PathView[]> {
  const all: PathView[] = [];
  const pending: number[][] = [[]];
  for (let path = pending.pop(); path; path = pending.pop()) {
    const view = await once(path);
    all.push(view);
    for (let point = path.length; point < view.branching.length; point += 1) {
      const taken = Array.from({ length: point }, (_, i) => path[i] ?? 0);
      for (let other = 1; other < view.branching[point]; other += 1) pending.push([...taken, other]);
    }
  }
  return all;
}

const placeholders = (view: PathView) => view.shown.filter((line) => line.includes("Placeholder"));

async function playOnboarding(path: number[]) {
  const { store, view, scenes } = await play(path);
  const before = { ...store.state.pressures };
  store.startOver();
  await scenes.settled;
  return { store, view, before };
}

describe("the Monday onboarding", () => {
  it("plays every choice path with Pan Zbigniew, Ryszard and the Intern, then marks the Intern onboarded", async () => {
    const views = await everyPath(async (path) => {
      const { store, view, before } = await playOnboarding(path);
      expect(placeholders(view)).toEqual([]);
      expect(view.shown[0]).toMatch(/^zbigniew: /);
      expect([...view.speakers].sort()).toEqual(["intern", "ryszard", "zbigniew"]);
      expect(store.state.flags).toContain("onboarded");
      expect(store.state.pressures).toEqual(before);
      return view;
    });
    expect(views.length).toBeGreaterThan(1);
  });

  it("has Ryszard teach the Intern to fake Tasks", async () => {
    const { view } = await playOnboarding([]);
    expect(view.shown.some((line) => line.startsWith("ryszard: ") && /fake/i.test(line))).toBe(true);
  });
});

/** A Friday save one hour before the audit, with both Factions helped and the goodwills given. */
const friday =
  (launchTeam: number, paperTrail: number) =>
  (state: GameState): GameState => ({
    ...state,
    day: 5,
    escalation: 5,
    hoursLeft: 1,
    helpedToday: ["launchTeam", "paperTrail"],
    openTasks: [],
    pressures: { ...state.pressures, launchTeam, paperTrail, sanity: 6 },
  });

/** Plays the audit and the survival scene after it. */
async function playFriday(path: number[], launchTeam: number, paperTrail: number) {
  const { store, view, scenes } = await play(path, friday(launchTeam, paperTrail));
  store.goHome();
  await scenes.settled;
  return { store, view };
}

describe("the Friday audit", () => {
  const answers: ReadonlyArray<readonly [AuditAnswer, Partial<GameState["pressures"]>]> = [
    ["bury", { launchTeam: 8, paperTrail: 6, sanity: 6 }],
    ["escalate", { launchTeam: 6, paperTrail: 8, sanity: 6 }],
    ["deflect", { launchTeam: 6, paperTrail: 6, sanity: 4 }],
  ];

  it("offers the three answers, in the order bury, escalate, deflect", async () => {
    const views = await everyPath(async (path) => (await playFriday(path, 6, 6)).view);
    expect(views).toHaveLength(3);
    for (const view of views) expect(view.branching).toEqual([3]);
  });

  it.each(answers.map(([answer, pressures], index) => ({ answer, pressures, index })))(
    "plays the $answer answer with Head office and Pani Halina, then applies its effect",
    async ({ index, pressures }) => {
      const { store, view } = await playFriday([index], 6, 6);
      const audit = view.byScene.get("audit") ?? [];
      expect(placeholders(view)).toEqual([]);
      expect(audit[0]).toMatch(/^headOffice: /);
      expect(audit.some((line) => line.startsWith("halina: "))).toBe(true);
      expect(store.state.pressures).toMatchObject(pressures);
    },
  );
});

describe("the survival scenes", () => {
  // The audit answer "deflect" leaves both goodwills where they were.
  const variants: ReadonlyArray<readonly [SurvivalVariant, number, number, Speaker]> = [
    ["launchTeam", 7, 6, "zbigniew"],
    ["paperTrail", 6, 7, "halina"],
    ["equal", 6, 6, "intern"],
  ];

  it.each(variants)("plays the %s scene with its main person", async (variant, launchTeam, paperTrail, person) => {
    const { store, view } = await playFriday([2], launchTeam, paperTrail);
    const survival = view.byScene.get("survival") ?? [];
    expect(store.state.phase).toEqual({ kind: "weekSurvived", variant });
    expect(placeholders(view)).toEqual([]);
    expect(survival.length).toBeGreaterThan(3);
    expect(survival[0]).toMatch(new RegExp(`^${person}: `));
  });

  it("gives the equal scene to the Intern alone", async () => {
    const { view } = await playFriday([2], 6, 6);
    const survival = view.byScene.get("survival") ?? [];
    expect(survival.filter((line) => !line.startsWith("intern: "))).toEqual([]);
  });
});

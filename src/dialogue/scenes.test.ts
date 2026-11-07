import { describe, expect, it } from "vitest";
import type { CastId } from "../content/index";
import type { GameState } from "../rules/index";
import { createStore, playDefaultDay, SAVE_KEY, type SaveStorage } from "../store/index";
import { story } from "../story/index";
import { Dialogue } from "./bridge";
import type { Speaker, TalkStage, TalkView } from "./conversations";
import { type SceneFrame, Scenes, type ScriptedScene } from "./scenes";

function memoryStorage(): SaveStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
  };
}

/** A view that reads every line at once. At each choice it picks the one whose text contains `pick`. */
class FakeView implements TalkView {
  readonly shown: string[] = [];
  pick = "";

  async say(speaker: Speaker, text: string): Promise<void> {
    this.shown.push(`${speaker}: ${text}`);
  }

  async choose(choices: readonly string[]): Promise<number> {
    return Math.max(
      0,
      choices.findIndex((text) => text.includes(this.pick)),
    );
  }

  brushOff(): void {}

  approach(): void {}
}

class FakeStage implements TalkStage {
  readonly moves: string[] = [];

  async walkBeside(person: CastId): Promise<void> {
    this.moves.push(`walk to ${person}`);
  }

  faceEachOther(person: CastId): () => void {
    this.moves.push(`face ${person}`);
    return () => this.moves.push(`${person} turns back`);
  }
}

class FakeFrame implements SceneFrame {
  readonly log: string[] = [];

  open(scene: ScriptedScene): void {
    this.log.push(`open ${JSON.stringify(scene)}`);
  }

  close(): void {
    this.log.push("close");
  }
}

/** Sets up the store, the scenes and fakes. With `state`, it continues a save holding that state. */
function setUp(state?: (fresh: GameState) => GameState) {
  const storage = memoryStorage();
  if (state) {
    const seed = createStore(storage);
    seed.startOver();
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state = state({ ...record.state, flags: ["onboarded"] });
    storage.setItem(SAVE_KEY, JSON.stringify(record));
  }
  const store = createStore(storage);
  const dialogue = new Dialogue(store, story, { strict: true });
  const view = new FakeView();
  const stage = new FakeStage();
  const frame = new FakeFrame();
  const scenes = new Scenes(store, dialogue, stage, view, frame);
  if (state) {
    store.continueGame(dialogue.loadInk);
    scenes.resume();
  }
  return { store, storage, dialogue, view, stage, frame, scenes };
}

describe("the Monday onboarding", () => {
  it("plays after a new game starts, beside Pan Zbigniew", async () => {
    const { store, view, stage, frame, scenes } = setUp();
    store.startOver();
    await scenes.settled;

    expect(frame.log).toEqual([`open ${JSON.stringify({ kind: "onboarding" })}`, "close"]);
    expect(stage.moves).toEqual(["walk to zbigniew", "face zbigniew", "zbigniew turns back"]);
    expect(view.shown[0]).toMatch(/^zbigniew: /);
    expect(store.state.flags).toContain("onboarded");
  });

  it("starts the scene only once the Intern stands beside Pan Zbigniew", async () => {
    const { store, stage, scenes } = setUp();
    store.on("conversationStarted", () => stage.moves.push("scene starts"));
    store.startOver();
    await scenes.settled;

    expect(stage.moves.slice(0, 3)).toEqual(["walk to zbigniew", "face zbigniew", "scene starts"]);
  });
});

describe("Continue", () => {
  it("replays the onboarding when the save stopped before it ended", async () => {
    const { store, frame, scenes } = setUp((state) => ({ ...state, flags: [] }));
    await scenes.settled;

    expect(frame.log[0]).toBe(`open ${JSON.stringify({ kind: "onboarding" })}`);
    expect(store.state.flags).toContain("onboarded");
  });

  it("plays no scene on the Firing screen", async () => {
    const fired = { kind: "fired", pressure: "sanity", retry: "yesterday" } as const;
    const { store, frame, scenes } = setUp((state) => ({ ...state, phase: fired }));
    await scenes.settled;

    expect(frame.log).toEqual([]);
    expect(store.state.phase).toEqual(fired);
  });
});

describe("the Firing scenes", () => {
  const walkUp = ["walk to zbigniew", "face zbigniew", "zbigniew turns back"];
  const firings = [
    { pressure: "performance", speaker: "zbigniew", moves: walkUp },
    { pressure: "launchTeam", speaker: "ryszard", moves: [] },
    { pressure: "paperTrail", speaker: "halina", moves: [] },
    { pressure: "sanity", speaker: "intern", moves: [] },
  ] as const;

  for (const { pressure, speaker, moves } of firings) {
    it(`plays the ${pressure} Firing, then offers "Retry this day"`, async () => {
      const { store, view, stage, frame, scenes } = setUp((state) => ({
        ...state,
        day: 2,
        pressures: { ...state.pressures, [pressure]: 0 },
      }));
      store.goHome();
      await scenes.settled;

      expect(frame.log).toEqual([`open ${JSON.stringify({ kind: "firing", pressure })}`, "close"]);
      expect(view.shown[0]).toMatch(new RegExp(`^${speaker}: `));
      expect(stage.moves).toEqual(moves);
      expect(store.state.phase).toEqual({ kind: "fired", pressure, retry: "thisDay" });
    });
  }

  it('offers "Retry yesterday" after a morning Firing', async () => {
    const { store, frame, scenes } = setUp((state) => ({ ...state, pressures: { ...state.pressures, sanity: 1 } }));
    store.goHome();
    await scenes.settled;

    expect(frame.log).toEqual([`open ${JSON.stringify({ kind: "firing", pressure: "sanity" })}`, "close"]);
    expect(store.state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "yesterday" });
  });
});

describe("the Friday audit", () => {
  const friday =
    (pressures: Partial<GameState["pressures"]>) =>
    (state: GameState): GameState => ({
      ...state,
      day: 5,
      hoursLeft: 1,
      helpedToday: ["launchTeam", "paperTrail"],
      openTasks: [],
      pressures: { ...state.pressures, ...pressures },
    });

  it("applies the answer after the scene, then plays the survival scene", async () => {
    const { store, storage, view, frame, scenes } = setUp(friday({ launchTeam: 6, paperTrail: 6 }));
    view.pick = "Bury";
    store.goHome();
    await scenes.settled;

    expect(frame.log).toEqual([
      `open ${JSON.stringify({ kind: "audit" })}`,
      `open ${JSON.stringify({ kind: "survival", variant: "launchTeam" })}`,
      "close",
    ]);
    expect(view.shown[0]).toMatch(/^headOffice: /);
    expect(store.state.pressures.launchTeam).toBe(8);
    expect(store.state.phase).toEqual({ kind: "weekSurvived", variant: "launchTeam" });
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("runs the second Firing check after the answer", async () => {
    const { store, view, frame, scenes } = setUp(friday({ sanity: 2 }));
    view.pick = "Deflect";
    store.goHome();
    await scenes.settled;

    expect(frame.log.at(-2)).toBe(`open ${JSON.stringify({ kind: "firing", pressure: "sanity" })}`);
    expect(store.state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "thisDay" });
  });

  it("replays the audit on Continue", async () => {
    const { store, view, scenes } = setUp((state) => ({
      ...friday({})(state),
      hoursLeft: 0,
      phase: { kind: "audit" },
    }));
    view.pick = "Escalate";
    await scenes.settled;

    expect(store.state.phase).toEqual({ kind: "weekSurvived", variant: "paperTrail" });
  });
});

describe("a full week", () => {
  it("plays from New game to the survival scene", async () => {
    const { store, frame, scenes } = setUp();
    store.startOver();
    await scenes.settled;
    while (store.state.phase.kind === "workday") {
      playDefaultDay(store);
      await scenes.settled;
    }

    const opened = frame.log.filter((entry) => entry.startsWith("open "));
    expect(opened.map((entry) => JSON.parse(entry.slice("open ".length)).kind)).toEqual([
      "onboarding",
      "audit",
      "survival",
    ]);
    expect(store.state.phase.kind).toBe("weekSurvived");
  });
});

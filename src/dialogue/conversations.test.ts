import { describe, expect, it } from "vitest";
import type { CastId } from "../content/index";
import { createStore, type SaveStorage, type StoreEvent } from "../store/index";
import { story, testStory } from "../story/index";
import { Dialogue } from "./bridge";
import {
  type ConversationStage,
  Conversations,
  type ConversationView,
  playDialogue,
  type Speaker,
} from "./conversations";

function memoryStorage(): SaveStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, value),
    removeItem: (key) => items.delete(key),
  };
}

/** A view that reads every line at once and picks `pick` at each choice. It records what it showed. */
class FakeView implements ConversationView {
  readonly shown: string[] = [];
  readonly brushOffs: string[] = [];
  readonly approached: CastId[] = [];
  onSay: (speaker: Speaker, text: string) => void = () => {};

  constructor(private readonly pick = 0) {}

  async say(speaker: Speaker, text: string): Promise<void> {
    this.shown.push(`${speaker}: ${text}`);
    this.onSay(speaker, text);
  }

  async choose(choices: readonly string[]): Promise<number> {
    this.shown.push(`choices: ${choices.join(" | ")}`);
    return this.pick;
  }

  brushOff(person: CastId, text: string): void {
    this.brushOffs.push(`${person}: ${text}`);
  }

  approach(person: CastId): void {
    this.approached.push(person);
  }
}

/** A stage that records each walk and turn. */
class FakeStage implements ConversationStage {
  readonly moves: string[] = [];
  /** Each walk waits for this before the Intern arrives. */
  arrival: Promise<void> = Promise.resolve();

  async walkBeside(person: CastId): Promise<void> {
    this.moves.push(`walk to ${person}`);
    await this.arrival;
  }

  faceEachOther(person: CastId): () => void {
    this.moves.push(`face ${person}`);
    return () => this.moves.push(`${person} turns back`);
  }
}

function setUp(storage = memoryStorage(), pick = 0) {
  const store = createStore(storage);
  if (!store.continueGame()) store.startOver();
  const dialogue = new Dialogue(store, story);
  const view = new FakeView(pick);
  const stage = new FakeStage();
  const events: StoreEvent[] = [];
  for (const type of ["conversationStarted", "conversationEnded", "pressureChanged"] as const) {
    store.on(type, (event) => events.push(event));
  }
  return { store, view, stage, events, storage, conversations: new Conversations(store, dialogue, stage, view) };
}

describe("holding a Conversation with a Colleague", () => {
  it("walks beside them, plays the Conversation and turns them back at the end", async () => {
    const { store, view, stage, conversations } = setUp();
    await conversations.click("wiola");

    expect(stage.moves).toEqual(["walk to wiola", "face wiola", "wiola turns back"]);
    expect(view.shown[0]).toMatch(/^wiola: /);
    const offered = view.shown.findIndex((shown) => shown.startsWith("choices: "));
    const [firstChoice] = view.shown[offered].slice("choices: ".length).split(" | ");
    expect(view.shown[offered + 1]).toBe(`intern: ${firstChoice}`);
    expect(view.shown.at(-1)).toMatch(/^wiola: /);
    expect(store.state.talkedToday).toEqual(["wiola"]);
  });

  it("gives a line tagged #speaker:intern to the Intern, and one tagged #speaker:headOffice to Head office", async () => {
    const { store } = setUp();
    const dialogue = new Dialogue(store, testStory);
    const view = new FakeView();
    dialogue.start("wiola", "test_speakers", false);
    await playDialogue(dialogue, view, "wiola");
    expect(view.shown).toEqual([
      "wiola: Morning.",
      "intern: Morning, Wiola.",
      "headOffice: Head office thanks you for your attendance.",
    ]);
  });

  it("moves the gauge only after the Intern says the chosen text", async () => {
    const { view, events, conversations } = setUp();
    // Every choice in Wiola's Monday Conversation moves one gauge.
    const moved = () => events.filter((event) => event.type === "pressureChanged");
    view.onSay = (speaker) => {
      if (speaker === "intern") expect(moved()).toHaveLength(0);
    };
    await conversations.click("wiola");
    expect(moved()).toHaveLength(1);
  });

  it("ends the Conversation only after the last line is read", async () => {
    const { view, events, conversations } = setUp();
    view.onSay = () => {
      expect(events.map((event) => event.type)).not.toContain("conversationEnded");
    };
    await conversations.click("wiola");
    expect(events.at(-1)).toEqual({ type: "conversationEnded", person: "wiola" });
  });

  it("locks the overlay at the click, and starts the Conversation only when the Intern arrives", async () => {
    const { view, stage, events, conversations } = setUp();
    let arrive = () => {};
    stage.arrival = new Promise((resolve) => {
      arrive = resolve;
    });
    const running = conversations.click("wiola");
    await Promise.resolve();
    expect(view.approached).toEqual(["wiola"]);
    expect(events).toEqual([]);

    arrive();
    await running;
    expect(events[0]).toEqual({ type: "conversationStarted", person: "wiola", scripted: false });
  });

  it("is busy from the click until the Conversation ends", async () => {
    const { conversations } = setUp();
    const running = conversations.click("wiola");
    expect(conversations.busy).toBe(true);
    await running;
    expect(conversations.busy).toBe(false);
  });
});

describe("brush-offs", () => {
  it("shows a brush-off after the day's Conversation, and the Intern does not walk", async () => {
    const { store, view, stage, conversations } = setUp();
    await conversations.click("kamil");
    stage.moves.length = 0;
    const sanity = store.state.pressures.sanity;

    await conversations.click("kamil");
    expect(view.brushOffs).toEqual([expect.stringMatching(/^kamil: ./)]);
    expect(stage.moves).toEqual([]);
    expect(store.state.pressures.sanity).toBe(sanity);
  });

  it("shows a brush-off for a Boss, and the Intern does not walk", async () => {
    const { view, stage, events, conversations } = setUp();
    await conversations.click("halina");
    expect(view.brushOffs).toEqual([expect.stringMatching(/^halina: ./)]);
    expect(stage.moves).toEqual([]);
    expect(events).toEqual([]);
  });

  it("offers the Colleague a new Conversation the next day", async () => {
    const { store, conversations } = setUp();
    await conversations.click("kamil");
    expect(conversations.availability("kamil")).toBe("held");
    store.goHome();
    expect(conversations.availability("kamil")).toBe("available");
  });
});

describe("what a click on a person offers", () => {
  it("tells a Colleague with a Conversation from a used one and from a Boss", async () => {
    const { conversations } = setUp();
    expect(conversations.availability("wiola")).toBe("available");
    expect(conversations.availability("zbigniew")).toBe("boss");
    await conversations.click("wiola");
    expect(conversations.availability("wiola")).toBe("held");
  });

  it("has no Monday Conversation for Ryszard, because the onboarding is his", () => {
    const { conversations } = setUp();
    expect(conversations.availability("ryszard")).toBe("held");
  });

  it("ignores clicks while a Conversation runs", async () => {
    const { stage, conversations } = setUp();
    const running = conversations.click("wiola");
    await conversations.click("kamil");
    await running;
    expect(stage.moves).toEqual(["walk to wiola", "face wiola", "wiola turns back"]);
  });
});

describe("reloading in the middle of a Conversation", () => {
  it("replays it from its start, and its effects apply once", async () => {
    const storage = memoryStorage();
    const first = setUp(storage);
    const before = { ...first.store.state.pressures };
    // The player reloads while Wiola replies, after the pick has moved the gauge.
    let opening = "";
    const reload = new Promise<void>((resolve) => {
      let picked = false;
      first.view.say = async (speaker, text) => {
        opening ||= text;
        if (speaker === "intern") picked = true;
        if (!picked || speaker !== "wiola") return;
        resolve();
        await new Promise(() => {});
      };
    });
    void first.conversations.click("wiola");
    await reload;
    const after = { ...first.store.state.pressures };
    expect(after).not.toEqual(before);

    const second = setUp(storage);
    expect(second.store.state.pressures).toEqual(before);
    expect(second.conversations.availability("wiola")).toBe("available");
    await second.conversations.click("wiola");
    expect(second.view.shown[0]).toBe(`wiola: ${opening}`);
    expect(second.store.state.pressures).toEqual(after);

    const third = setUp(storage);
    expect(third.store.state.pressures).toEqual(after);
    expect(third.store.state.talkedToday).toEqual(["wiola"]);
  });
});

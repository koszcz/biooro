import { Compiler } from "inkjs/full";
import { describe, expect, it } from "vitest";
import { createStore, type GameStore, type StoreEvent } from "../store/index";
import { story, testStory } from "../story/index";
import { Dialogue } from "./bridge";

/** A fresh store on Monday morning, with every event it emits. */
function monday() {
  const storage = new Map<string, string>();
  const store = createStore({
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  });
  store.startOver();
  const events: StoreEvent[] = [];
  for (const type of ["pressureChanged", "tierChanged", "conversationStarted", "conversationEnded", "fired"] as const) {
    store.on(type, (event) => events.push(event));
  }
  return { store, events };
}

/** Plays a knot to its end. Picks `choice` at each choice point. Returns the text of each line. */
function play(dialogue: Dialogue, choice = 0): string[] {
  const lines: string[] = [];
  while (dialogue.active) {
    if (dialogue.canContinue) lines.push(dialogue.continue().text);
    else if (dialogue.finished) dialogue.end();
    else dialogue.choose(choice);
  }
  return lines;
}

/** Compiles a small Ink knot named `test` that may call the game functions. */
function inkStory(body: string): string {
  const externals = ["pressure(n)", "tier()", "flag(n)", "day()", "adjust(p, d)", "set_flag(n)", "escalate()"];
  const source = `${externals.map((name) => `EXTERNAL ${name}`).join("\n")}\n-> DONE\n=== test ===\n${body}\n-> END\n`;
  return new Compiler(source).Compile().ToJson() ?? "";
}

function runTest(store: GameStore, body: string, scripted = false, strict = true): void {
  const dialogue = new Dialogue(store, inkStory(body), { strict });
  dialogue.start(scripted ? "zbigniew" : "wiola", "test", scripted);
  play(dialogue);
}

describe("a Colleague Conversation through the bridge", () => {
  it("applies each write at once, emits its events and ends the Conversation", () => {
    const { store, events } = monday();
    store.on("pressureChanged", () => expect(store.state.escalation).toBe(1));
    const dialogue = new Dialogue(store, testStory);
    dialogue.start("wiola", "test_colleague_conversation", false);

    expect(play(dialogue, 1)).toEqual(["Morning. Coffee?", "Do not ask about the launch."]);
    expect(events).toEqual([
      { type: "conversationStarted", person: "wiola", scripted: false },
      { type: "pressureChanged", pressure: "launchTeam", from: 6, to: 7 },
      { type: "conversationEnded", person: "wiola" },
    ]);
    expect(store.state.escalation).toBe(2);
    expect(store.state.flags).toEqual(["asked_about_launch"]);
    expect(store.state.talkedToday).toEqual(["wiola"]);
    expect(store.inkState).not.toBeNull();
  });

  it("skips the empty line Ink gives for a tag after a choice's brackets", () => {
    const { store } = monday();
    const dialogue = new Dialogue(store, inkStory("Hi.\n* [Wave] #note:a wave\n  Bye."));
    dialogue.start("wiola", "test", false);
    expect(play(dialogue)).toEqual(["Hi.", "Bye."]);
  });

  it("gives each line and choice its #id: tag", () => {
    const { store } = monday();
    const dialogue = new Dialogue(store, testStory);
    dialogue.start("wiola", "test_colleague_conversation", false);
    expect(dialogue.continue().id).toBe("test.test_colleague_conversation.2");
    expect(dialogue.choices.map((choice) => choice.id)).toEqual([
      "test.test_colleague_conversation.3",
      "test.test_colleague_conversation.5",
    ]);
  });

  it("reads the tier, flags, Pressures and day from the store", () => {
    const { store } = monday();
    const dialogue = new Dialogue(store, testStory);
    dialogue.start("wiola", "test_colleague_conversation", false);
    play(dialogue, 1);
    dialogue.start("zbigniew", "test_onboarding", true);
    expect(play(dialogue)).toEqual(["Welcome to the team.", "I hear you asked about the launch.", "Good."]);
    expect(dialogue.readLines("test_firing").map((line) => line.text)).toEqual(["We are letting you go."]);
    expect(dialogue.readLines("test_survival")).toEqual([]);
  });

  it("never takes a Pressure below 1", () => {
    const { store } = monday();
    runTest(store, '~ adjust("sanity", -5)\nA long morning.', true);
    expect(store.state.pressures.sanity).toBe(1);
    runTest(store, '~ adjust("sanity", -1)\nOuch.');
    expect(store.state.pressures.sanity).toBe(1);
  });
});

describe("the Conversation caps", () => {
  const broken = {
    "changes Performance": '~ adjust("performance", 1)',
    "changes two Pressures": '~ adjust("sanity", 1)\n~ adjust("launchTeam", -1)',
    "changes one Pressure by more than 1": '~ adjust("sanity", 1)\n~ adjust("sanity", 1)',
    "calls escalate() twice": "~ escalate()\n~ escalate()",
  };

  for (const [name, body] of Object.entries(broken)) {
    it(`throws when a Colleague Conversation ${name}`, () => {
      expect(() => runTest(monday().store, `${body}\nDone.`)).toThrow(/Conversation cap/);
    });

    it(`does not apply to a scripted scene that ${name}`, () => {
      expect(() => runTest(monday().store, `${body}\nDone.`, true)).not.toThrow();
    });

    it(`does not throw outside development when a Conversation ${name}`, () => {
      expect(() => runTest(monday().store, `${body}\nDone.`, false, false)).not.toThrow();
    });
  }

  it("allows a change that comes back within 1 in total", () => {
    expect(() => runTest(monday().store, '~ adjust("sanity", 1)\n~ adjust("sanity", -1)\nDone.')).not.toThrow();
  });
});

describe("the Firing check after an Ink choice", () => {
  it("ends the scene at the Firing and saves the Ink state", () => {
    const { store, events } = monday();
    const dialogue = new Dialogue(store, testStory);
    dialogue.start("zbigniew", "test_scripted_drop", true);

    expect(play(dialogue)).toEqual(["This is going badly.", "It got worse."]);
    expect(dialogue.active).toBe(false);
    expect(events.slice(-2)).toEqual([
      { type: "conversationEnded", person: "zbigniew" },
      { type: "fired", pressure: "sanity", retry: "thisDay" },
    ]);
    expect(store.state.phase.kind).toBe("fired");
  });
});

describe("Ink state across saves", () => {
  it("restores the Ink state the store holds when a Conversation starts", () => {
    const { store } = monday();
    const dialogue = new Dialogue(store, inkStory("{ test > 1: Again.|First. }"));
    dialogue.start("wiola", "test", false);
    expect(play(dialogue)).toEqual(["First."]);
    dialogue.start("wiola", "test", false);
    expect(play(dialogue)).toEqual(["Again."]);

    store.retry();
    dialogue.start("wiola", "test", false);
    expect(play(dialogue)).toEqual(["First."]);
  });

  it("checks a saved Ink state for the store to load", () => {
    const dialogue = new Dialogue(monday().store, story);
    expect(() => dialogue.loadInk("{not ink")).toThrow();
    expect(() => dialogue.loadInk(null)).not.toThrow();
  });
});

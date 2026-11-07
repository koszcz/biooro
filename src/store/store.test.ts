import { describe, expect, it } from "vitest";
import { FakeStorage } from "./fakeStorage";
import { SAVE_KEY, SAVE_VERSION } from "./save";
import { createStore } from "./store";

describe("save and load", () => {
  it("continues a new game from the saved slot", () => {
    const storage = new FakeStorage();
    const first = createStore(storage);
    first.startOver();

    const second = createStore(storage);
    expect(second.continueGame()).toBe(true);
    expect(second.state).toEqual(first.state);
    expect(second.state.day).toBe(1);
    expect(second.state.hoursLeft).toBe(8);
  });

  it("has nothing to continue when the slot is empty", () => {
    expect(createStore(new FakeStorage()).continueGame()).toBe(false);
  });
});

describe("Conversations", () => {
  it("saves at the end of a Conversation, never inside it", () => {
    const storage = new FakeStorage();
    const store = createStore(storage);
    store.startOver();
    const events: string[] = [];
    store.on("conversationStarted", (event) => events.push(`started ${event.person}`));
    store.on("conversationEnded", (event) => events.push(`ended ${event.person}`));

    store.startConversation("wiola", false);
    const midway = createStore(storage);
    midway.continueGame();
    expect(midway.state.talkedToday).toEqual([]);

    store.endConversation('{"ink":1}');
    const after = createStore(storage);
    after.continueGame();
    expect(after.state.talkedToday).toEqual(["wiola"]);
    expect(after.inkState).toBe('{"ink":1}');
    expect(events).toEqual(["started wiola", "ended wiola"]);
  });

  it("does not mark anyone as talked today after a scripted scene", () => {
    const store = createStore(new FakeStorage());
    store.startOver();
    store.startConversation("zbigniew", true);
    store.endConversation("{}");
    expect(store.state.talkedToday).toEqual([]);
  });
});

describe("the Friday audit", () => {
  it("applies the answer, ends the week and removes Continue", () => {
    const storage = new FakeStorage();
    createStore(storage).startOver();
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state.phase = { kind: "audit" };
    record.state.day = 5;
    storage.setItem(SAVE_KEY, JSON.stringify(record));
    const store = createStore(storage);
    store.continueGame();
    const survived: string[] = [];
    store.on("weekSurvived", (event) => survived.push(event.variant));

    store.answerAudit("bury");
    expect(survived).toEqual(["launchTeam"]);
    expect(createStore(storage).continueGame()).toBe(false);
  });

  it("keeps Continue away after the survival scene ends", () => {
    const storage = new FakeStorage();
    createStore(storage).startOver();
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    record.state.phase = { kind: "audit" };
    record.state.day = 5;
    storage.setItem(SAVE_KEY, JSON.stringify(record));
    const store = createStore(storage);
    store.continueGame();
    store.answerAudit("bury");

    store.startConversation("zbigniew", true);
    store.endConversation('{"ink":1}');
    expect(createStore(storage).continueGame()).toBe(false);
  });
});

describe("discarding a save", () => {
  it("discards a save with a different version", () => {
    const storage = new FakeStorage();
    createStore(storage).startOver();
    const record = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    storage.setItem(SAVE_KEY, JSON.stringify({ ...record, version: SAVE_VERSION + 1 }));

    expect(createStore(storage).continueGame()).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("discards a save whose JSON fails to parse", () => {
    const storage = new FakeStorage();
    storage.setItem(SAVE_KEY, "{not json");

    expect(createStore(storage).continueGame()).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("discards a save when the Ink state fails to load", () => {
    const storage = new FakeStorage();
    createStore(storage).startOver();
    const loadInk = () => {
      throw new Error("bad Ink state");
    };

    expect(createStore(storage).continueGame(loadInk)).toBe(false);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });
});

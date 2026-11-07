import { describe, expect, it } from "vitest";
import { FakeStorage } from "./fakeStorage";
import { SAVE_KEY } from "./save";
import { createStore } from "./store";

function storeInConversation(person: "wiola" | "zbigniew", scripted: boolean, storage = new FakeStorage()) {
  const store = createStore(storage);
  store.startOver();
  store.startConversation(person, scripted);
  return store;
}

describe("Ink writes", () => {
  it("apply at once and emit their events inside a Conversation", () => {
    const store = storeInConversation("wiola", false);
    const events: string[] = [];
    store.on("pressureChanged", (event) => events.push(`${event.pressure} ${event.from}->${event.to}`));
    store.adjust("sanity", 1);
    store.setFlag("wiola_lent_stapler");
    expect(events).toEqual(["sanity 6->7"]);
    expect(store.state.flags).toEqual(["wiola_lent_stapler"]);
  });

  it("never take a Pressure below 1 in a Colleague Conversation", () => {
    const store = storeInConversation("wiola", false);
    store.adjust("launchTeam", -10);
    expect(store.state.pressures.launchTeam).toBe(1);
  });

  it("may take a Pressure to 0 in a scripted scene", () => {
    const store = storeInConversation("zbigniew", true);
    store.adjust("performance", -10);
    expect(store.state.pressures.performance).toBe(0);
  });

  it("throw outside a Conversation", () => {
    const store = createStore(new FakeStorage());
    store.startOver();
    expect(() => store.escalate()).toThrow(/Conversation/);
  });
});

describe("the Firing check after an Ink choice", () => {
  it("does nothing while every Pressure is above 0", () => {
    const store = storeInConversation("zbigniew", true);
    expect(store.checkFiring('{"ink":"midway"}')).toBe(false);
    expect(store.state.phase.kind).toBe("workday");
  });

  it("ends the Conversation, saves the Ink state and fires the Intern", () => {
    const storage = new FakeStorage();
    const store = storeInConversation("zbigniew", true, storage);
    const events: string[] = [];
    store.on("conversationEnded", (event) => events.push(`ended ${event.person}`));
    store.on("fired", (event) => events.push(`fired ${event.pressure} ${event.retry}`));
    store.adjust("sanity", -10);

    expect(store.checkFiring('{"ink":"at the firing"}')).toBe(true);
    expect(events).toEqual(["ended zbigniew", "fired sanity thisDay"]);
    const saved = JSON.parse(storage.getItem(SAVE_KEY) ?? "");
    expect(saved.state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "thisDay" });
    expect(saved.inkState).toBe('{"ink":"at the firing"}');
  });
});

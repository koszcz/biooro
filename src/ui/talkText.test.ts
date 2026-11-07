import { describe, expect, it } from "vitest";
import { hoverLabel, pressureChangeLabel, revealedLength } from "./talkText";

describe("the hover label under a person's head", () => {
  it("uses the spec's wording for each kind of person", () => {
    expect(hoverLabel("wiola", "talk")).toBe("💬 Talk to Wiola");
    expect(hoverLabel("kamil", "talked")).toBe("Kamil · talked today");
    expect(hoverLabel("zbigniew", "boss")).toBe("Pan Zbigniew · busy (Boss)");
  });
});

describe("the label that floats up when a Conversation moves a gauge", () => {
  it("names the change", () => {
    expect(pressureChangeLabel("sanity", 6, 7, 1)).toBe("+1 Sanity");
    expect(pressureChangeLabel("paperTrail", 6, 5, 2)).toBe("−1 Paper Trail");
  });

  it("floats nothing for a goodwill gauge on Monday, while it is hidden", () => {
    expect(pressureChangeLabel("launchTeam", 6, 5, 1)).toBeNull();
    expect(pressureChangeLabel("launchTeam", 6, 5, 2)).toBe("−1 Launch Team");
  });
});

describe("the text reveal", () => {
  it("shows 45 characters a second", () => {
    expect(revealedLength(0, 100)).toBe(0);
    expect(revealedLength(1000, 100)).toBe(45);
    expect(revealedLength(2000, 60)).toBe(60);
  });
});

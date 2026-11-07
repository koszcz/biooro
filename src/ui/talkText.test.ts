import { describe, expect, it } from "vitest";
import { createLineReveal } from "./talkText";

describe("createLineReveal", () => {
  it("reveals a line at 45 characters a second and reports each newly shown stretch, up to the last character", () => {
    const text = "Fine. Leave it on my desk.";
    const reported: [number, number][] = [];
    const reveal = createLineReveal(text, (from, to) => reported.push([from, to]));

    reveal.at(100);
    expect(reveal.shown).toBe("Fine");
    reveal.at(300);
    expect(reveal.shown).toBe("Fine. Leave i");
    reveal.at(5000);
    expect(reveal.shown).toBe(text);
    expect(reveal.done).toBe(true);
    expect(reported).toEqual([
      [0, 4],
      [4, 13],
      [13, 26],
    ]);
  });

  it("shows the rest of the line at once when completed early, with no more reports", () => {
    const reported: [number, number][] = [];
    const reveal = createLineReveal("Not now.", (from, to) => reported.push([from, to]));
    reveal.at(50);
    reveal.complete();
    expect(reveal.shown).toBe("Not now.");
    expect(reveal.done).toBe(true);
    expect(reported).toEqual([[0, 2]]);
  });
});

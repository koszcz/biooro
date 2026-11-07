import { describe, expect, it } from "vitest";
import { blipsBetween } from "./blips";

describe("blipsBetween", () => {
  it("plays one blip per two revealed characters", () => {
    expect(blipsBetween("abcdefgh", 0, 8)).toBe(4);
    expect(blipsBetween("abcdefgh", 0, 1)).toBe(0);
    expect(blipsBetween("abcdefgh", 1, 2)).toBe(1);
  });

  it("makes no blip for a space", () => {
    expect(blipsBetween("a b c d", 0, 7)).toBe(0);
    expect(blipsBetween("ab cd ef", 0, 8)).toBe(3);
  });

  it("counts each character once across many small steps", () => {
    const text = "Hello there, intern";
    let total = 0;
    for (let shown = 1; shown <= text.length; shown++) total += blipsBetween(text, shown - 1, shown);
    expect(total).toBe(blipsBetween(text, 0, text.length));
  });
});

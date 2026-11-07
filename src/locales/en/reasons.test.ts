import { describe, expect, it } from "vitest";
import { LOCKED_REASONS } from "../index";

describe("locked reasons", () => {
  it("uses the spec's exact wording", () => {
    expect(LOCKED_REASONS.notEnoughHours).toBe("Not enough hours left today.");
    expect(LOCKED_REASONS.alreadyFaked).toBe("You already faked this once.");
  });
});

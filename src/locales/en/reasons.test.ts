import { describe, expect, it } from "vitest";
import { LOCKED_REASONS } from "../index";

describe("locked reasons", () => {
  it("uses the spec's exact wording", () => {
    expect(LOCKED_REASONS.notEnoughHours).toBe("Not enough hours left today.");
  });

  it("names the Colleague who doesn't trust the Intern yet", () => {
    expect(LOCKED_REASONS.ryszardDoesntTrust).toBe("Ryszard doesn't trust you yet");
    expect(LOCKED_REASONS.wiolaDoesntTrust).toBe("Wiola doesn't trust you yet");
    expect(LOCKED_REASONS.kamilDoesntTrust).toBe("Kamil doesn't trust you yet");
  });
});

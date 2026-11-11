import { describe, expect, it } from "vitest";
import { LANGUAGE, pickLanguage } from "./index";

describe("pickLanguage", () => {
  it("lets a ?lang= query win over the saved pick and the browser", () => {
    expect(pickLanguage("?lang=pl", "en", ["en-GB"])).toBe("pl");
  });

  it("uses the saved pick over the browser", () => {
    expect(pickLanguage("", "en", ["pl-PL"])).toBe("en");
  });

  it("uses the browser's first known language", () => {
    expect(pickLanguage("", null, ["de-DE", "pl-PL", "en"])).toBe("pl");
  });

  it("falls back to English for unknown values", () => {
    expect(pickLanguage("?lang=xx", "fr", ["de"])).toBe("en");
  });

  it("is English outside a browser, so tests read the English tables", () => {
    expect(LANGUAGE).toBe("en");
  });
});

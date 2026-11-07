import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const RULES_DIR = import.meta.dirname;
const ruleFiles = readdirSync(RULES_DIR).filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"));

describe("rule files", () => {
  it.each(ruleFiles)("%s uses no randomness, Date, DOM or Three.js", (name) => {
    const source = readFileSync(join(RULES_DIR, name), "utf8");
    expect(source).not.toMatch(/Math\.random|\bDate\b|\bdocument\b|\bwindow\b|from "three"/);
  });
});

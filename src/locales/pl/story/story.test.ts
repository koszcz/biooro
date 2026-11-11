import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STORY_LINES } from "./index";

const STORY_DIR = fileURLToPath(new URL("../../../story/", import.meta.url));

/** Every #id: the game can show. Test knots and voice anchors never reach the player. */
function shownIds(): string[] {
  return readdirSync(STORY_DIR)
    .filter((name) => name.endsWith(".ink") && name !== "test.ink")
    .flatMap((name) => [...readFileSync(join(STORY_DIR, name), "utf8").matchAll(/#\s*id:\s*([^\s#\]]+)/g)])
    .map((match) => match[1] ?? "")
    .filter((id) => !id.includes("_voice_anchor"));
}

describe("Polish Ink lines", () => {
  it("have one line for every Ink line the game can show, and no line for an id that is gone", () => {
    expect(Object.keys(STORY_LINES).sort()).toEqual(shownIds().sort());
  });

  it("are never empty", () => {
    for (const [id, line] of Object.entries(STORY_LINES)) expect(line.trim(), id).not.toBe("");
  });
});

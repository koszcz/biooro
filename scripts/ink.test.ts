import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compileInk } from "./ink.ts";

let root: string;

function write(path: string, text: string): string {
  const full = join(root, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, text);
  return full;
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "ink-compile-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("compileInk", () => {
  it("compiles a story and the files it includes", () => {
    write("story/other.ink", "=== other ===\nHello from the other file.\n-> END\n");
    const main = write("story/main.ink", "INCLUDE other.ink\n-> other\n");
    const result = compileInk(main);
    expect(result.errors).toEqual([]);
    expect(JSON.parse(result.json ?? "").inkVersion).toBeGreaterThan(0);
    expect(result.files.sort()).toEqual([join(root, "story/main.ink"), join(root, "story/other.ink")]);
  });

  it("reports an Ink error and returns no JSON", () => {
    const main = write("story/main.ink", "-> missing_knot\n");
    const result = compileInk(main);
    expect(result.json).toBeNull();
    expect(result.errors.join("\n")).toContain("missing_knot");
  });
});

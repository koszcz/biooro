import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inkPlugin } from "./vite-plugin-ink.ts";

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "ink-plugin-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function load(path: string) {
  const watched: string[] = [];
  const context = {
    addWatchFile: (file: string) => watched.push(file),
    error: (message: string): never => {
      throw new Error(message);
    },
  };
  const plugin = inkPlugin();
  const hook = plugin.load as unknown as (this: typeof context, id: string) => string | undefined;
  const code = hook.call(context, path);
  return { code, watched };
}

describe("inkPlugin", () => {
  it("turns an .ink import into the compiled story JSON", () => {
    const path = join(root, "main.ink");
    writeFileSync(path, "Hello.\n");
    const { code, watched } = load(path);
    expect(code).toMatch(/^export default \{"inkVersion":/);
    expect(watched).toEqual([path]);
  });

  it("fails the build on an Ink error", () => {
    const path = join(root, "main.ink");
    writeFileSync(path, "-> missing_knot\n");
    expect(() => load(path)).toThrow(/missing_knot/);
  });

  it("leaves other files alone", () => {
    expect(load(join(root, "main.ts")).code).toBeUndefined();
  });
});

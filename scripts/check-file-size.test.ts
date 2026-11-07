import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFileSizes } from "./check-file-size.ts";

let root: string;

function writeLines(path: string, count: number) {
  const full = join(root, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, `${Array.from({ length: count }, (_, i) => `// ${i}`).join("\n")}\n`);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "size-check-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("checkFileSizes", () => {
  it("passes short files", () => {
    writeLines("src/rules/short.ts", 200);
    expect(checkFileSizes(root)).toEqual({ warnings: [], errors: [] });
  });

  it("warns above 200 lines", () => {
    writeLines("src/rules/long.ts", 201);
    expect(checkFileSizes(root)).toEqual({
      warnings: ["src/rules/long.ts has 201 lines (warn above 200)"],
      errors: [],
    });
  });

  it("fails a 301-line .ts or .ink file", () => {
    writeLines("src/rules/huge.ts", 301);
    writeLines("src/story/huge.ink", 301);
    expect(checkFileSizes(root).errors).toEqual([
      "src/rules/huge.ts has 301 lines (limit 300)",
      "src/story/huge.ink has 301 lines (limit 300)",
    ]);
  });

  it("allows content files up to 500 lines", () => {
    writeLines("src/content/tasks.ts", 500);
    writeLines("src/content/big.ts", 501);
    expect(checkFileSizes(root).errors).toEqual(["src/content/big.ts has 501 lines (limit 500)"]);
  });

  it("ignores other file types and node_modules", () => {
    writeLines("src/notes.md", 900);
    writeLines("node_modules/pkg/index.ts", 900);
    expect(checkFileSizes(root)).toEqual({ warnings: [], errors: [] });
  });
});

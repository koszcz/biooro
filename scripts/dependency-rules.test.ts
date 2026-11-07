// Runs dependency-cruiser with the real config on a fixture that breaks each folder rule once.
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

type Violation = { rule: { name: string }; from: string; to: string };

function cruise(target: string): Violation[] {
  const result = spawnSync(
    "npx",
    ["depcruise", "--config", ".dependency-cruiser.cjs", "--output-type", "json", target],
    { encoding: "utf8" },
  );
  return JSON.parse(result.stdout).summary.violations;
}

const FIXTURE = "scripts/fixtures/folder-rules/src";

describe("folder rules", () => {
  const violations = cruise(FIXTURE).map((v) => `${v.rule.name}: ${v.from} -> ${v.to}`);

  it("stops src/rules/ from importing src/scene/", () => {
    expect(violations).toContain(
      `rules-imports-only-content: ${FIXTURE}/rules/imports-scene.ts -> ${FIXTURE}/scene/index.ts`,
    );
  });

  it("stops src/rules/ from importing Three.js", () => {
    expect(violations).toContainEqual(
      expect.stringMatching(/^rules-no-three: .*\/rules\/uses-three\.ts -> node_modules\/three\//),
    );
  });

  it("stops src/store/ from importing the UI", () => {
    expect(violations).toContain(
      `store-imports-only-rules-and-content: ${FIXTURE}/store/imports-ui.ts -> ${FIXTURE}/ui/index.ts`,
    );
  });

  it("stops an import that skips another folder's index.ts", () => {
    expect(violations).toContain(`import-through-index: ${FIXTURE}/ui/skips-index.ts -> ${FIXTURE}/scene/camera.ts`);
  });

  it("stops import cycles", () => {
    expect(violations).toContainEqual(expect.stringMatching(/^no-circular: .*\/content\/a\.ts -> .*\/content\/b\.ts$/));
  });

  it("allows src/rules/ to import src/content/ through its index.ts", () => {
    expect(violations.filter((v) => v.includes("/rules/allowed.ts"))).toEqual([]);
  });
});

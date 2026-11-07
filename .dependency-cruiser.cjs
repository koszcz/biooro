// Folder rules from the spec's "Code layout" section. `npm run check:deps` runs them on src/.
// The paths match any folder named src/, so the test fixture in scripts/fixtures/ can prove each rule.
const SRC = "(^|/)src/";

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "rules-imports-only-content",
      comment: "src/rules/ holds pure rule functions. It imports only src/content/.",
      severity: "error",
      from: { path: `${SRC}rules/` },
      to: { path: SRC, pathNot: `${SRC}(rules|content)/` },
    },
    {
      name: "rules-no-three",
      comment: "src/rules/ uses no Three.js.",
      severity: "error",
      from: { path: `${SRC}rules/` },
      to: { path: "node_modules/three/" },
    },
    {
      name: "store-imports-only-rules-and-content",
      comment: "src/store/ imports only src/rules/ and src/content/.",
      severity: "error",
      from: { path: `${SRC}store/` },
      to: { path: SRC, pathNot: `${SRC}(store|rules|content)/` },
    },
    {
      name: "import-through-index",
      comment: "Folders import each other only through their index.ts.",
      severity: "error",
      from: { path: `${SRC}([^/]+)/` },
      to: { path: `${SRC}[^/]+/`, pathNot: [`${SRC}$2/`, `${SRC}[^/]+/index\\.ts$`] },
    },
    {
      name: "entry-imports-through-index",
      comment: "Files at the top of src/ import folders only through their index.ts.",
      severity: "error",
      from: { path: `${SRC}[^/]+\\.ts$` },
      to: { path: `${SRC}[^/]+/`, pathNot: `${SRC}[^/]+/index\\.ts$` },
    },
    {
      name: "no-circular",
      comment: "Imports must not form a cycle.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-unresolvable",
      comment: "Every import must resolve to a file.",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".js"],
    },
  },
};

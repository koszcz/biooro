// File size check: warns above 200 lines and fails above 300 for .ts and .ink files.
// Files in src/content/ may run to 500 lines. Run it with `npm run check:size`.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const WARN_AT = 200;
const LIMIT = 300;
const CONTENT_LIMIT = 500;
const CHECKED = /\.(ts|ink)$/;
// prototype/ holds throwaway prototypes that the game checks do not cover.
const SKIPPED = new Set(["node_modules", ".git", "dist", "_site", "prototype", ".scratch", ".claude"]);

export type SizeReport = { warnings: string[]; errors: string[] };

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIPPED.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(path);
    return CHECKED.test(entry.name) ? [path] : [];
  });
}

function countLines(path: string): number {
  const text = readFileSync(path, "utf8");
  if (text === "") return 0;
  return text.replace(/\n$/, "").split("\n").length;
}

export function checkFileSizes(root: string): SizeReport {
  const report: SizeReport = { warnings: [], errors: [] };
  for (const path of listFiles(root).sort()) {
    const name = relative(root, path).split(sep).join("/");
    const lines = countLines(path);
    const limit = name.startsWith("src/content/") ? CONTENT_LIMIT : LIMIT;
    if (lines > limit) {
      report.errors.push(`${name} has ${lines} lines (limit ${limit})`);
    } else if (lines > WARN_AT) {
      report.warnings.push(`${name} has ${lines} lines (warn above ${WARN_AT})`);
    }
  }
  return report;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(sep).join("/"))) {
  const { warnings, errors } = checkFileSizes(process.cwd());
  for (const line of warnings) console.warn(`warning: ${line}`);
  for (const line of errors) console.error(`error: ${line}`);
  if (errors.length > 0) process.exit(1);
}

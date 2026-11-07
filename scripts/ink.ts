// Compiles an Ink story with inkjs/compiler. The Vite plugin and `npm run check:ink` both use it.
import { readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { Compiler, CompilerOptions } from "inkjs/full";

/** Matches ErrorType.Warning and ErrorType.Author in inkjs. Other types are errors. */
const WARNING_TYPES = new Set([0, 1]);

export interface InkCompileResult {
  /** The compiled story JSON, or null when the story has an error. */
  json: string | null;
  errors: string[];
  warnings: string[];
  /** Every Ink file the story read, for the Vite plugin to watch. */
  files: string[];
}

/**
 * Compiles `mainPath`, or `source` in its place when given.
 * Paths in INCLUDE lines are relative to the folder that holds `mainPath`.
 */
export function compileInk(mainPath: string, source = readFileSync(mainPath, "utf8")): InkCompileResult {
  const root = dirname(mainPath);
  const files = [mainPath];
  const errors: string[] = [];
  const warnings: string[] = [];
  const fileHandler = {
    ResolveInkFilename: (filename: string) => resolve(root, filename),
    LoadInkFileContents: (filename: string) => {
      files.push(filename);
      return readFileSync(filename, "utf8");
    },
  };
  const errorHandler = (message: string, type: number) => {
    (WARNING_TYPES.has(type) ? warnings : errors).push(message);
  };
  const options = new CompilerOptions(mainPath, [], false, errorHandler, fileHandler);
  let json: string | null = null;
  try {
    const story = new Compiler(source, options).Compile();
    if (errors.length === 0) json = story.ToJson() ?? null;
  } catch (error) {
    if (errors.length === 0) errors.push(String(error));
  }
  return { json: errors.length === 0 ? json : null, errors, warnings, files };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(sep).join("/"))) {
  const result = compileInk(resolve(process.cwd(), "src/story/main.ink"));
  for (const line of result.warnings) console.warn(`warning: ${line}`);
  for (const line of result.errors) console.error(`error: ${line}`);
  if (result.json === null) process.exit(1);
}

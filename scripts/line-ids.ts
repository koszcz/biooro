// The line ID check: every Ink line of text needs one `#id:` tag, and no id may repeat.
// `npm run check:line-ids` runs the check. `npm run ink:ids` adds the missing tags.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export interface InkFile {
  /** The path from the story folder, such as `halina.ink`. */
  name: string;
  text: string;
}

interface SourceLine {
  number: number;
  raw: string;
  /** The raw line with comments blanked out. Positions match `raw`. */
  code: string;
  knot: string;
  hasText: boolean;
  id: string | null;
}

const NO_TEXT = /^(INCLUDE|VAR|CONST|LIST|EXTERNAL|TODO:|~)/;
const KNOT = /^={2,}\s*(?:function\s+)?(\w+)/;
const STITCH = /^=\s*\w+/;
const ID = /#\s*id:\s*([^\s#\]]+)/;

/** Replaces comments with spaces, so positions in the line stay the same. */
function blankComments(raw: string, inBlock: boolean): { code: string; inBlock: boolean } {
  let code = "";
  let i = 0;
  while (i < raw.length) {
    const two = raw.slice(i, i + 2);
    if (inBlock) {
      if (two === "*/") inBlock = false;
      const width = two === "*/" ? 2 : 1;
      code += " ".repeat(width);
      i += width;
    } else if (two === "/*") {
      inBlock = true;
      code += "  ";
      i += 2;
    } else if (two === "//") {
      return { code: code + " ".repeat(raw.length - i), inBlock };
    } else {
      code += raw[i];
      i += 1;
    }
  }
  return { code, inBlock };
}

function count(text: string, char: string): number {
  return text.split(char).length - 1;
}

/** True when what is left after markers, conditions, tags and diverts holds any text. */
function holdsText(trimmed: string): boolean {
  const isChoice = /^[*+]/.test(trimmed);
  let rest = trimmed.replace(/^(([*+]|-(?!>))\s*)+/, "").replace(/^\(\w+\)\s*/, "");
  if (isChoice) rest = rest.replace(/^(\{[^}]*\}\s*)+/, "");
  rest = rest
    .replace(/#[^#\]]*?(?=->|\]|#|$)/g, "")
    .replace(/(->|<-)\s*[\w.]*/g, "")
    .replace(/<>|\[|\]/g, "");
  return /\S/.test(rest);
}

/** Classifies one line. Returns the new depth of multi-line `{ }` blocks. */
function classify(trimmed: string, depth: number): { hasText: boolean; depth: number } {
  const change = count(trimmed, "{") - count(trimmed, "}");
  if (trimmed === "" || NO_TEXT.test(trimmed) || STITCH.test(trimmed)) return { hasText: false, depth };
  if ((trimmed.startsWith("{") && change > 0) || trimmed.startsWith("}")) {
    return { hasText: false, depth: depth + change };
  }
  if (depth > 0 && /^-.*:$/.test(trimmed)) return { hasText: false, depth };
  return { hasText: holdsText(trimmed), depth: depth + change };
}

function scan(text: string): SourceLine[] {
  let inBlock = false;
  let depth = 0;
  let knot = "top";
  return text.split("\n").map((raw, index) => {
    const blanked = blankComments(raw, inBlock);
    inBlock = blanked.inBlock;
    const trimmed = blanked.code.trim();
    const knotMatch = KNOT.exec(trimmed);
    if (knotMatch?.[1]) knot = knotMatch[1];
    const result = knotMatch ? { hasText: false, depth } : classify(trimmed, depth);
    depth = result.depth;
    const id = ID.exec(blanked.code)?.[1] ?? null;
    return { number: index + 1, raw, code: blanked.code, knot, hasText: result.hasText, id };
  });
}

/** Lists each line of text with no id, and each id that an earlier line already used. */
export function checkLineIds(files: InkFile[]): string[] {
  const errors: string[] = [];
  const seen = new Map<string, string>();
  for (const file of files) {
    for (const line of scan(file.text)) {
      const where = `${file.name}:${line.number}`;
      if (line.hasText && line.id === null) errors.push(`${where} has no #id: tag: ${line.raw.trim()}`);
      if (line.id === null) continue;
      const first = seen.get(line.id);
      if (first) errors.push(`${where} repeats #id:${line.id} from ${first}`);
      else seen.set(line.id, where);
    }
  }
  return errors;
}

/** Where the tag goes: inside a choice's brackets, before a divert, or at the end of the code. */
function tagPosition(code: string): number {
  const trimmed = code.trim();
  const bracket = code.indexOf("]");
  if (/^[*+]/.test(trimmed) && bracket >= 0) return bracket;
  const divert = code.indexOf("->");
  if (divert >= 0) return divert;
  return code.trimEnd().length;
}

function insertTag(line: SourceLine, id: string): string {
  const at = tagPosition(line.code);
  const before = line.raw.slice(0, at).trimEnd();
  const after = line.raw.slice(at);
  const gap = after === "" || after.startsWith("]") ? "" : " ";
  return `${before} #id:${id}${gap}${after.trimStart()}`;
}

/** Adds a new `#id:` tag, named `<file>.<knot>.<n>`, to each line of text that has none. */
export function addLineIds(file: InkFile, taken: Set<string>): string {
  const lines = scan(file.text);
  for (const line of lines) if (line.id) taken.add(line.id);
  const base = file.name
    .replace(/\.ink$/, "")
    .split("/")
    .join(".");
  return lines
    .map((line) => {
      if (!line.hasText || line.id) return line.raw;
      let n = 1;
      while (taken.has(`${base}.${line.knot}.${n}`)) n += 1;
      const id = `${base}.${line.knot}.${n}`;
      taken.add(id);
      return insertTag(line, id);
    })
    .join("\n");
}

function listInkFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listInkFiles(path);
    return entry.name.endsWith(".ink") ? [path] : [];
  });
}

export function readStory(storyDir: string): InkFile[] {
  return listInkFiles(storyDir)
    .sort()
    .map((path) => ({ name: relative(storyDir, path).split(sep).join("/"), text: readFileSync(path, "utf8") }));
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(sep).join("/"))) {
  const storyDir = join(process.cwd(), "src/story");
  const files = readStory(storyDir);
  if (process.argv.includes("--fix")) {
    const taken = new Set<string>();
    for (const file of files) for (const line of scan(file.text)) if (line.id) taken.add(line.id);
    for (const file of files) writeFileSync(join(storyDir, file.name), addLineIds(file, taken));
  }
  const errors = checkLineIds(readStory(storyDir));
  for (const line of errors) console.error(`error: ${line}`);
  if (errors.length > 0) process.exit(1);
}

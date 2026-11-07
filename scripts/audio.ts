// The audio check: every file the manifest lists must exist in public/audio/. `npm run check:audio` runs it.
import { existsSync } from "node:fs";
import { join, sep } from "node:path";
import { AUDIO_MANIFEST } from "../src/audio/manifest.ts";

const AUDIO_DIR = join(import.meta.dirname, "..", "public", "audio");

/** One error per manifest entry whose file is missing. */
export function checkAudio(
  manifest: Readonly<Record<string, string>> = AUDIO_MANIFEST,
  exists: (file: string) => boolean = (file) => existsSync(join(AUDIO_DIR, file)),
): string[] {
  return Object.entries(manifest)
    .filter(([, file]) => !exists(file))
    .map(([id, file]) => `"${id}" needs public/audio/${file}, but the file is missing`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(sep).join("/"))) {
  const errors = checkAudio();
  for (const line of errors) console.error(`error: ${line}`);
  if (errors.length > 0) process.exit(1);
}

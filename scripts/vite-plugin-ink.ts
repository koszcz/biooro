// A Vite plugin that compiles an imported .ink file into its story JSON. An Ink error fails the build.
import type { Plugin } from "vite";
import { compileInk } from "./ink.ts";

export function inkPlugin(): Plugin {
  return {
    name: "biooro-ink",
    load(id) {
      if (!id.endsWith(".ink")) return undefined;
      const result = compileInk(id);
      for (const file of result.files) this.addWatchFile(file);
      if (result.json === null) this.error(`Ink compile failed:\n${result.errors.join("\n")}`);
      return `export default ${result.json};`;
    },
  };
}

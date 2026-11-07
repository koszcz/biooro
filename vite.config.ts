// Vite config. GitHub Pages serves the game from /biooro/, so production builds use that base.
import { defineConfig } from "vitest/config";
import { inkPlugin } from "./scripts/vite-plugin-ink.ts";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/biooro/" : "/",
  plugins: [inkPlugin()],
  build: { outDir: "_site", emptyOutDir: true },
  test: { include: ["src/**/*.test.ts", "scripts/**/*.test.ts"] },
}));

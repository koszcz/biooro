// Vite config. GitHub Pages serves the game from /biooro/, so production builds use that base.
import { defineConfig } from "vitest/config";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/biooro/" : "/",
  build: { outDir: "_site", emptyOutDir: true },
  test: { include: ["src/**/*.test.ts", "scripts/**/*.test.ts"] },
}));

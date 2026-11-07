# Prototypes

Throwaway prototypes that answer wayfinder `prototype` tickets. Each one is a Vite app. Start it with the preview tool, using the name in `.claude/launch.json`.

## File map

Each source file starts with a comment that says which ticket it answers and what it shows. To learn what a file does, read its first 10 lines. Search for a symbol with `grep -n`, then read only the lines you need. Most files run to 200–500 lines, so reading one whole costs a lot of context.

| Prototype | Preview name | Port | Files |
| --- | --- | --- | --- |
| `office-look/` | `office-look-prototype` | 5174 | `src/main.ts`: "Isometric office look", variants A–C (`?variant=`). `src/art.ts` with `art.html`: "Character and art direction", rooms and cast lineup. Models live in `public/kenney/`; run `pnpm unpack` to fill it. |
| `pressures-ui/` | `pressures-ui-prototype` | 5175 | `src/main.ts`: variant switcher and prototype controls. `src/game.ts`: in-memory rules and typed events. `src/scene.ts`: the office scene, locked to the chosen look. `src/shared.ts`: helpers. `src/variants/a.ts`, `b.ts`, `c.ts`: "Pressures and Task inbox UI". `src/variants/crowd.ts`: "Crowded Task bubbles" (variants D–F). |

## Check a prototype in the browser

Each screenshot costs over 1,000 tokens. Check state as text first:

1. Read state with `javascript_tool` or `read_page`. `art.ts` exposes the scene as `window.__scene`.
2. Check errors with `read_console_messages` (`onlyErrors: true`).
3. Take a screenshot only to judge how something looks. Use `scale: 0.5`, and use `zoom` on a region for detail.

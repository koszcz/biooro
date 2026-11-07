# AGENTS.md

## Game code map

The game is a Vite and TypeScript project at the repository root. Run `npm run dev` to play it. Run `npm run check` before you call work done. Folders import each other only through their `index.ts`, and `.dependency-cruiser.cjs` enforces the folder rules.

- `src/main.ts`: the entry point. It starts the office scene.
- `src/rules/`: pure state and rule functions. No Three.js and no DOM. Imports only `src/content/`.
- `src/content/`: typed data for Tasks, Task slots, Task places, Colleagues and the office grid.
- `src/store/`: the state store, its commands and events, autosave and the day-start snapshot. Imports only `src/rules/` and `src/content/`.
- `src/dialogue/`: the inkjs bridge.
- `src/story/`: Ink files, with `main.ink` as the root.
- `src/scene/`: Three.js, the isometric camera, the floor, pathfinding and Task actions.
- `src/ui/`: DOM overlays.
- `src/audio/`: Web Audio and the audio manifest.
- `src/locales/`: string tables.
- `scripts/`: the file size check, the backlog page builder and their tests.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

This repo uses the five default triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo, with one `CONTEXT.md` and `docs/adr/` at the root. See `docs/agents/domain.md`.

### Prototypes

Before you read prototype code or check a prototype in the browser, read `prototype/README.md`.

### 3D assets

Before you build or restyle any 3D asset, read `docs/art/making-assets.md`.

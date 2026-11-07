# Walking skeleton

Status: resolved
Blocked by:

## What to build

Set up the game project at the repository root, so every later ticket has a place to land. When this ticket is done, the browser shows an empty floor through the isometric camera, and CI checks and publishes it.

- A Vite and TypeScript project that uses npm, with `three` and `easystarjs` installed.
- Every folder from the spec's "Code layout", each with an `index.ts` that opens with a one-line comment on what the folder does.
- `npm run check`, which runs Biome, the TypeScript type check, Vitest, the file size check and `dependency-cruiser` with the folder rules. Leave hooks in the script for the Ink compile, the line ID check and the audio check. Later tickets fill them in.
- A Three.js scene in `src/scene/` with the orthographic camera at the true isometric angle and one flat 21 by 11 floor. It has no walls, furniture or people yet.
- A GitHub Actions workflow that runs `npm run check`, builds the game and publishes it to GitHub Pages.
- A root `AGENTS.md` section that maps each folder in one line. Keep the sections that are already there.

## Hosting with the backlog page

GitHub Pages hosts one site per repository, and `.github/workflows/backlog.yml` already publishes the backlog page there. Replace it with one workflow that builds both: the game at the site root, and the backlog page at `/backlog/`. Run `python3 scripts/backlog.py _site/backlog` for the backlog. Set the Vite `base` so the game works under the Pages path.

## Acceptance criteria

- [ ] `npm run dev` shows the empty floor at the isometric angle, and the wheel zooms between half and three times the default framing.
- [ ] `npm run check` passes, and it fails when you add a 301-line `.ts` file or an import that skips an `index.ts`.
- [ ] A test proves that `src/rules/` cannot import `src/scene/`, by running `dependency-cruiser` on a fixture or by a rule in its config.
- [ ] The workflow publishes the game at the site root and the backlog page at `/backlog/`.

## Spec

- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Stack", "Code layout" and "Checks".
- [7. Look and art](../../intern-game/spec.md#7-look-and-art): "Camera and movement".

## Comments

Built on branch ticket-01, merged into intern-game-build at fb5d789.

# Debug panel

Status: resolved
Blocked by: 08

## What to build

A panel for development only. It edits Pressures, jumps to any day and sets flags. It changes state only through store commands or a dev-only store hook. Production builds leave it out.

## Acceptance criteria

- [ ] The panel opens in `npm run dev` and is absent from the production bundle.
- [ ] Jumping to Thursday gives the same state as playing Monday to Wednesday with a fixed default policy.
- [ ] `npm run check` passes.

## Spec

- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Debug panel".

## Comments

Built on branch ticket-15, merged into intern-game-build at 858204a. The spec names no "fixed default policy" for jumps; the scripted-weeks mixed policy is used because it survives the week. A jump starts over and replays, so it clears flags and edits. Panel text is English-only dev text, not in locales. The panel mounts only behind `import.meta.env.DEV`.

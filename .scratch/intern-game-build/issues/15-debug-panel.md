# Debug panel

Status: ready-for-agent
Blocked by: 08

## What to build

A panel for development only. It edits Pressures, jumps to any day and sets flags. It changes state only through store commands or a dev-only store hook. Production builds leave it out.

## Acceptance criteria

- [ ] The panel opens in `npm run dev` and is absent from the production bundle.
- [ ] Jumping to Thursday gives the same state as playing Monday to Wednesday with a fixed default policy.
- [ ] `npm run check` passes.

## Spec

- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Debug panel".

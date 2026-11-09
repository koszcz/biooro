# Brush-offs and hand-off lines

Status: ready-for-agent
Blocked by: 09, 12, 16

## What to build

Draft the short lines every character says outside a full Conversation.

- 15 brush-offs: one per cast member per tier.
- 3 hand-off lines: one per Colleague.
- Move the placeholder hand-off lines from the "Task actions in the office" ticket into Ink, and remove them from the locale files.

Check each draft against `docs/writing/voice.md` and fix any mismatch first.

## Acceptance criteria

- [x] Each brush-off shows for its person and tier, and each hand-off line shows when that Colleague takes a Task.
- [ ] You open a pull request, and the user reads every line before it merges.

## Spec

- [11. Writing](../../intern-game/spec.md#11-writing): "Content to write" and "Files".

## Comments

- 2026-11-09, agent: I drafted the 15 brush-offs and the 3 hand-off lines. Each brush-off lives in its knot `<person>_brush_off` in `src/story/zbigniew.ink`, `halina.ink`, `ryszard.ink`, `wiola.ink` and `kamil.ink`. Each hand-off line lives in a new knot `<colleague>_hand_off` in `ryszard.ink`, `wiola.ink` and `kamil.ink`. The HUD now reads hand-off lines from Ink through `handOffLine()` in `src/dialogue/conversations.ts`. I removed the placeholder `HAND_OFF_LINES` from `src/locales/en/actions.ts`. `src/dialogue/shortLines.test.ts` checks every brush-off for each person and tier, and every hand-off line. The lines still need your review before they merge.

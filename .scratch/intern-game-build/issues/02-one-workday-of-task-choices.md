# One Workday of Task choices

Status: resolved
Blocked by: 01

## What to build

The pure rules for a single Workday, in `src/rules/`, with typed content in `src/content/`. There is no screen in this ticket. Tests drive everything.

- The `GameState` type with every field the spec lists. Fields for later tickets, such as pending Fallout and the day-start snapshot data, can exist now with simple values.
- The four Pressures, clamped from 0 to 10, each starting at 6.
- `applyTaskChoice(state, task, choice)` for "Do it", "Fake it" and "Sabotage it", including Tasks with no side and the Paper Trail Performance rule. Each call returns `{ state, events }`.
- `applyBreak(state)` and `goHome(state)`.
- Locked Task choices with their exact reasons, such as "Not enough hours left today."
- The "helped today" record, using the "Helping a Faction" table for the three Task choices in this ticket.
- The Escalation counter and the tier function, including the rule that one Task choice adds at most 1 Escalation and `tierChanged` when the tier changes.
- The mid-day Firing check with the Firing priority order.
- Content types for Tasks, Task places and Task slots, plus the 16 slot Tasks from the spec's "Task slots" table. Give each Task an ID, its assigner, its Task side and the default Task place, the Intern's desk. The "Task wording" ticket sets the real places later.
- `src/locales/en/tasks.ts`, typed by Task ID, with placeholder wording. The type checker must fail if a Task has no wording.

Leave delegation out. The "Delegation" ticket adds it.

## Acceptance criteria

- [ ] Tests cover every row of the "Task choices" table, for a Launch Team Task, a Paper Trail Task and a Task with no side.
- [ ] Tests cover each locked reason and the Firing priority when two Pressures reach 0 at once.
- [ ] No rule uses randomness, `Date` or any DOM or Three.js import.
- [ ] `npm run check` passes.

## Spec

- [4. Game rules](../../intern-game/spec.md#4-game-rules): "Pressures", "The Workday", "Task choices", "Helping a Faction" and "Escalation".
- [5. The week](../../intern-game/spec.md#5-the-week): "Firings" and "Task slots".
- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Game state".

## Comments

Built on branch ticket-02, merged into intern-game-build at 67fbc2999ba7d97161e6784545d8a10a71ca2787. Left for ticket 04: Fake it does not queue pending Fallout yet, and Fallout limits are not in. newGame() starts at day 0 before Monday's morning steps.

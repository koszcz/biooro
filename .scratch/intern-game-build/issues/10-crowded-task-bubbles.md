# Crowded Task bubbles

Status: resolved
Blocked by: 08

## What to build

Keep the screen readable when one person has many Tasks.

- A person with 3 or more open Tasks shows their two most urgent Tasks, plus a "+N more from <name>" pill. The pill adds "⚠ N" when a hidden Task is Fallout.
- Clicking the pill opens a list of that person's Tasks. After a Task choice finishes, the popover returns to the list, and it closes when the list is empty.
- Bubble groups slide inward near a screen edge.
- Other people's bubbles fade to 35% while a popover is open.

Use one "most urgent" sort everywhere: Fallout first, then oldest first.

## Acceptance criteria

- [ ] A debug state with five Tasks on one person shows two bubbles and the pill, with the right count.
- [ ] Bubbles near each screen edge stay fully on screen.
- [ ] `npm run check` passes.

## Spec

- [6. Screen and interface](../../intern-game/spec.md#6-screen-and-interface): "Task bubbles" and "The Task choice popover".
- Prototype: `prototype/pressures-ui`, `?variant=E`.

## Comments

Built on branch ticket-10, merged into intern-game-build at 30d9399. Choices where the spec is silent: 'oldest first' means open-list order; the pill sits above the two bubbles; a Task opened from the list has a Back button (text in src/locales/en/hud.ts needs the user's review); the pill for Anyone Tasks reads 'from Anyone'. Edge sliding keeps a 10px screen margin but does not avoid the gauges or hour blocks.

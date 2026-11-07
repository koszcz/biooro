# Task bubbles, popover and HUD

Status: ready-for-agent
Blocked by: 03, 05, 07

## What to build

Make a day playable. The player sees Tasks, picks Task choices and watches the Pressures move. Task choices resolve at once in this ticket: the UI calls `finishTaskAction()` straight after `chooseTask()`. The "Task actions in the office" ticket replaces that with the real walk and clip.

- Task bubbles over each assigner, and "anyone" Tasks over the Intern. Show the Task side border from Tuesday and the Fallout style.
- The Task choice popover with all four Task choices, hours, effect chips, locked reasons and the collapsed "Delegate it" rows. On Monday, the chips leave out goodwill.
- Hover previews on the gauges and hour blocks.
- The four Pressure gauges, with the pulse at 2 or lower and the goodwill gauges popping in on Tuesday.
- The 8 hour blocks, the Break button and the "Go home" button with its confirmation.
- The "Nobody wants anything" prompt.
- A plain day card between days, so the player can play the whole week. The scripted scenes come later.

Use plain DOM overlays in `src/ui/`. Read text from the locale files. Never build sentences from fragments.

## Acceptance criteria

- [ ] The player can play Monday to Friday with Task choices, Breaks and "Go home", and the gauges match the store.
- [ ] The popover never covers the gauges or hour blocks, and it flips left at the right edge.
- [ ] `npm run check` passes.

## Spec

- [6. Screen and interface](../../intern-game/spec.md#6-screen-and-interface): "Task bubbles", "The Task choice popover" and "Pressures and hours".
- Prototype: `prototype/pressures-ui`, `?variant=C`.

# Task actions in the office

Status: resolved
Blocked by: 08

## What to build

Replace the instant Task choice with the action the spec describes. The scene now calls `finishTaskAction()` when the action ends.

- On `taskActionStarted`, the Intern walks to the Task place and plays its clip. Use the Task place table for "Do it" and sabotage clips.
- The "✨ looks done" sparkle for "Fake it", and the purple "🤫" tag for sabotage.
- For "Delegate it", the Intern walks to the Colleague, who nods and says a hand-off line. Use placeholder hand-off lines from the locale files for now. The "Brush-offs and hand-off lines" ticket moves them into Ink.
- Each Colleague's own behaviour after a hand-off, at no cost to the Intern.
- One hour block drains per hour, at 1 second per hour to start.
- Input lock while the action plays, as the spec lists it. The "⏳" title prefix and the tag over the Intern.
- Pressure floats rising from the Intern's head when the action finishes.
- A Break plays no walk. Its hour empties at once, and "+2 Sanity" floats up.

## Acceptance criteria

- [ ] Each of the four Task choices plays as the spec describes, at each of the seven Task places.
- [ ] A Firing or the end of the day waits until the action finishes.
- [ ] Reloading during an action loads the finished result.
- [ ] `npm run check` passes.

## Spec

- [6. Screen and interface](../../intern-game/spec.md#6-screen-and-interface): "How Task choices play out".
- Prototype: `prototype/pressures-ui`, `?variant=J`.

## Comments

Built on branch ticket-09, merged into intern-game-build at c52ec5a. Task actions also lock the office input that Conversations added. The hand-off bubble is covered by tests but was not seen in the browser. The HUD wiring fixes in src/ui/game.ts have no unit tests; they were checked in the browser only.

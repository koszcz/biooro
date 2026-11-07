# Pressures and Task inbox UI

Type: prototype
Status: resolved
Blocked by:

## Question

How do the four Pressures, the remaining Workday hours, and the Task inbox look and behave on screen? Decide where each one sits over the isometric office, how a Task choice is picked, how locked Task choices show their reason, and how the goodwill Pressures appear on Day 2.

## Answer

Use variant C, "In the world", with two changes from the user: bubbles show the full request text, and "Delegate it" stays collapsed until the player clicks it.

### Task bubbles

- Each open Task shows as a speech bubble over the head of whoever assigned it.
- Tasks with no assigner ("anyone") float over the Intern.
- A bubble shows the full request text. It never truncates. Text wraps at 200 pixels wide.
- When one person has several Tasks, their bubbles stack upward, each one above the last.
- The bubble border shows the Task side colour once the goodwill Pressures are visible. It is grey on Day 1 and for Tasks with no side.
- A Fallout bubble has a pink fill and a warning sign.
- Bubbles follow their character on screen every frame.

### Picking a Task choice

- Clicking a bubble opens a small popover beside the assigner.
- The popover shows the Task text, the assigner, the Task side, and all four Task choices.
- Each Task choice shows its hours and its effects as coloured chips, such as "+1 Perf".
- A locked Task choice replaces its chips with the reason in red, such as "Needs 3h, you have 2h left".
- "Delegate it" is collapsed by default. Clicking it opens one row for each Colleague: Ryszard, Wiola, and Kamil.
- Each Colleague row shows its effects and one line on what that Colleague will do, such as "He fakes it. Fallout in 2 days." A locked row shows its reason instead.
- If all three Colleagues are locked, the collapsed row says "Nobody will take it".
- Hovering a Task choice previews it. The Pressure gauges show the change as a striped section, and the hour blocks it would spend turn orange.
- Clicking an available Task choice applies it at once. There is no confirmation step.

### Pressures and hours

- The Pressures are slim vertical gauges on the left edge. Each one shows its number above and a short label below: Perf, Launch, Paper, Sanity.
- A gauge pulses when its Pressure is 2 or lower.
- The Workday is a row of 8 blocks at the bottom centre, with the hours left as a number. Spent hours are dark.
- The Break button sits at the end of the hour blocks.

### Goodwill on Day 1 and Day 2

- On Day 1 only the Performance and Sanity gauges show.
- On Day 1 the chips leave out goodwill changes, because the player cannot see goodwill yet.
- On Day 1 a locked delegation says "<Colleague> doesn't trust you yet" instead of a number.
- On Day 2 morning the two goodwill gauges appear with a short pop-in animation.

### Empty inbox

- When no Tasks are open, a small prompt at the top says "Nobody wants anything" with an "End the day" button.

### Notes for the build

- The prototype confirms plain DOM is enough. No UI library is needed.
- The UI reacts to these events: `pressureChanged`, `hoursChanged`, `taskAssigned`, `taskResolved`, `goodwillRevealed`, `dayStarted`, `dayEnded`, and `fired`.
- The scene must expose each character's screen position, so the UI can place bubbles and the popover.

Rejected options: variant A (Pressure bars across the top and an inbox drawer on the right) and variant B (a clipboard with pips, a wall clock, and a memo window per Task).

Still open: how bubbles behave when one person has many Tasks. See [Crowded Task bubbles](12-crowded-task-bubbles.md).

The prototype is captured on branch `prototype/pressures-ui` (commit `9744439`), in `prototype/pressures-ui`. Run `pnpm --dir prototype/pressures-ui dev`, then open `?variant=C`. It reuses the assets and `node_modules` from `prototype/office-look`.

## Comments

- From [Lock the tech plan](09-lock-the-tech-plan.md): the UI is plain DOM in TypeScript, with no UI library. It reacts to typed state events such as `pressureChanged` and `taskAssigned`. Build the prototype that way, and flag it if a library proves necessary.

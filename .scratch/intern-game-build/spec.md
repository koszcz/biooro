# Build: Intern game vertical slice

This effort builds the vertical slice described in the [intern game spec](../intern-game/spec.md). That spec is the single source of truth. These tickets only split the build into pieces, so each ticket links to spec sections and does not repeat their rules.

## How the tickets fit together

Each ticket is a thin slice you can run or test when it is done. They follow this order:

1. Foundation: the project skeleton, then the rules, then the store.
2. The office: the floor, walking, the cast and the tier look.
3. Playing a day: Task bubbles and the HUD, then Task actions, then crowded bubbles.
4. Talking: the Ink bridge, then Conversations, then scripted scenes.
5. Polish: audio and the debug panel.
6. Writing: the voice guide, Task wording, Conversations and scenes.

A ticket marked `ready-for-human` needs you to do the work. A ticket marked `ready-for-agent` can go to an agent. Every agent ticket that adds lines of text still goes through your review, as the spec's "Review" section requires.

## Rules for every ticket

- Run `npm run check` before you call a ticket done.
- When this effort and the spec differ, the spec wins. If you find a real gap in the spec, stop and ask. Do not invent a rule.

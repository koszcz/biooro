# Ink pipeline and bridge

Status: resolved
Blocked by: 05

## What to build

Let Ink stories run in the game and talk to the store.

- A small Vite plugin that compiles `src/story/main.ink` with `inkjs/compiler`. A compile error fails the build and `npm run check`.
- The bridge in `src/dialogue/`. It binds the seven game functions as inkjs external functions. Each write runs through the rule functions and emits events at once.
- The Conversation caps: `adjust()` never takes a Pressure below 1 in a Colleague Conversation. In development and tests, the bridge throws when a Conversation breaks a cap.
- A Firing check after each Ink choice.
- Starting and ending a Conversation through `startConversation` and `endConversation(inkStateJson)`.
- The line ID check in `npm run check`, and a script that adds missing `#id:` tags.
- A placeholder `main.ink` with one test knot per kind of story the spec lists.

## Acceptance criteria

- [ ] Tests run a test knot through the bridge and assert the Pressure changes and events.
- [ ] Tests prove the bridge throws on each broken cap.
- [ ] `npm run check` fails on an Ink error and on a missing or repeated `#id:` tag.
- [ ] `npm run check` passes.

## Spec

- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "The Ink bridge".
- [4. Game rules](../../intern-game/spec.md#4-game-rules): "Conversations".
- [11. Writing](../../intern-game/spec.md#11-writing): "Files" and "Translation-safe rules".

## Comments

Built on branch ticket-11, merged into intern-game-build at a937a29. Also built ticket 05's leftover: a Firing ends the Conversation, saves Ink state, then emits `fired`. Choices where the spec is silent: added Ink write commands `adjust`, `setFlag`, `escalate`, `checkFiring(inkStateJson)`; the Firing check runs after every Ink line because Ink applies writes on the next line; empty Ink lines are skipped; `readLines(knot)` serves brush-offs and throws on writes; a choice's `#id:` goes inside its brackets; Ink names Pressures by code name such as "launchTeam". store.ts is near the 300-line limit.

# Ink pipeline and bridge

Status: ready-for-agent
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

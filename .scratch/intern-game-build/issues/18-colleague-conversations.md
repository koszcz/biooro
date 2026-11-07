# Colleague Conversations

Status: ready-for-agent
Blocked by: 12, 16

## What to build

Draft the 14 Colleague Conversations in Ink: Ryszard from Tuesday to Friday, and Wiola and Kamil from Monday to Friday.

- One knot per Conversation, in each character's file.
- Tier variants branch on `tier()` beside the line they replace.
- Follow the caps in the spec's "Conversations" rules. Across one Colleague's week, the raising and lowering choices roughly balance.
- Use `set_flag()` for anything another character or the rules must know. Never use a global `VAR` as memory.

Check each draft against `docs/writing/voice.md` and fix any mismatch first.

## Acceptance criteria

- [ ] All 14 Conversations play in the game without the bridge throwing.
- [ ] A test plays each Conversation's every choice path through the bridge.
- [ ] You open a pull request, and the user reads every line before it merges.

## Spec

- [11. Writing](../../intern-game/spec.md#11-writing): all of it.
- [4. Game rules](../../intern-game/spec.md#4-game-rules): "Conversations".

# Conversations

Status: ready-for-agent
Blocked by: 07, 11

## What to build

Let the player talk to Colleagues, using placeholder Ink knots.

- Hover labels under each person's head.
- Click a Colleague to walk the Intern beside them. They face each other, and the Conversation starts on arrival. The partner turns back at the end.
- Speech bubbles in the speaker's Faction colour, with the text revealed at 45 characters a second. Click, Space or Enter completes a line, then moves on.
- Head office lines in one bubble at the top centre.
- Numbered choice bubbles over the Intern, picked by click or number key. The Intern says the chosen text, then the gauge moves and a label floats up. No label floats for a hidden gauge.
- The "…" badges, and the brush-off bubbles that fade out after about 2.6 seconds.
- Input lock and bubble fading during a Conversation, as the spec lists them.

## Acceptance criteria

- [ ] Each Colleague offers one Conversation a day. After it, clicking them shows a brush-off.
- [ ] Clicking a Boss shows a brush-off, and the Intern does not walk.
- [ ] Reloading in the middle of a Conversation replays it from its start, and its effects apply once.
- [ ] `npm run check` passes.

## Spec

- [6. Screen and interface](../../intern-game/spec.md#6-screen-and-interface): "Conversations".
- Prototype: `prototype/pressures-ui`, `?variant=G`.

# Cast and tier look

Status: ready-for-agent
Blocked by: 05, 06

## What to build

Put the five cast members in the office, and make the office change with the tier.

- The five cast members at their spots, each with their own base model, Faction vest and prop. Bosses are 12% taller. Seated characters lift 0.13 units.
- Each person's extras: Pogodny's tie, Teczka's glasses and recording light, and Przeciek's sunglasses.
- The three palettes and the Smart toilet LED states, switched by the `tierChanged` event. Lighting stays steady.
- Each person faces a set direction and can turn to face a point. Later tickets use this for Conversations.

## Acceptance criteria

- [ ] The cast lineup matches `prototype/office-look/art.html`.
- [ ] Emitting `tierChanged` from the store switches the palette and LED with no reload.
- [ ] `npm run check` passes.

## Spec

- [7. Look and art](../../intern-game/spec.md#7-look-and-art): "People" and "Palette by tier".
- [3. Cast and Factions](../../intern-game/spec.md#3-cast-and-factions).

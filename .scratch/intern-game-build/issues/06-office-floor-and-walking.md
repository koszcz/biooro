# Office floor and walking

Status: resolved
Blocked by: 01

## What to build

The office floor, and an Intern the player can walk around it.

- The hand-authored office grid in `src/content/`: walkable cells, furniture, Colleague spots and the seven Task places.
- The three rooms, the corridor, the doorways, the walls and wall stubs, the two Faction rugs and the Smart range toilet, built from the Kenney Furniture Kit.
- The printer, built in code from the prototype's `makePrinter()`.
- A loading screen that loads every GLB at boot. Copy only the GLB files you need from `prototype/office-look/public/kenney/` into `public/`.
- The Intern, with the orange vest, ring and bobbing arrow.
- Click-to-walk with `easystarjs`: 8 directions, no corner cutting, 2.4 tiles per second, and a ring at the target.
- Clicking a chair walks the Intern there to sit.

Read `docs/art/making-assets.md` before you build or restyle any 3D asset. Match the chosen look in `prototype/office-look` and `prototype/pressures-ui/src/scene.ts`.

## Acceptance criteria

- [ ] The floor matches the spec's layout, and every Kenney piece is centred on its cell.
- [ ] The Intern walks to any clicked floor cell and never cuts a corner or walks through a wall.
- [ ] A test checks that every Task place and Colleague spot is reachable from the Intern's desk.
- [ ] `npm run check` passes.

## Spec

- [7. Look and art](../../intern-game/spec.md#7-look-and-art): "Camera and movement" and "The floor".
- [12. Assets](../../intern-game/spec.md#12-assets): all of it.
- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Boot" and "Content data".

## Comments

Built on branch ticket-06, merged into intern-game-build at cb279a1. Choices where the spec is silent: Task place cells are printer (0,2), plant (7,0), shredder as trash can (0,7), evidence shelf as low bookcase (11,6); the Intern starts at (6,4); every chair is sittable. Only the Intern's model is in public/models/; ticket 07 must copy the cast models.

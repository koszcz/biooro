# Isometric office look

Type: prototype
Status: resolved
Blocked by:

## Question

How should one office room look and feel? Build a rough Three.js prototype to react to. It should cover the orthographic camera angle and zoom, how the cutaway walls work, the low-poly style, and the feel of point-and-click movement.

Build the prototype with the assets the research chose: the Kenney Furniture Kit and Kenney Mini Characters. Use it to check two things the research could not confirm. Do the two kits match in scale and style? Do the Mini Characters have a sitting animation?

## Answer

Use a fixed isometric camera with low wall stubs on the near side. The Kenney kits match each other, so use them at their native scale.

- **Camera:** orthographic, true isometric angle (35.264° down, 45° around). The player cannot rotate it.
- **Zoom:** the mouse wheel zooms between set limits. The prototype clamps zoom between half and three times the default framing.
- **Walls:** the two walls farthest from the camera stand at full height (1.3 units, the height of the Kenney wall tile). The two near walls drop to low stubs (0.2 units), like a dollhouse cutaway.
- **Movement:** click the floor to walk. The Intern walks 2.4 tiles per second on a grid with 8 directions and no corner cutting. A ring marks the target. Click a chair to walk to it and sit.
- **Scale:** one grid tile is one unit. Use both kits at native scale. A Mini Character is 0.78 units tall, a desk 0.38, a desk chair 0.61, a doorway 1.01 and a wall tile 1 × 1.29. The characters are chibi, about twice the height of a desk, and they fit through doorways.
- **Style:** the flat-colour furniture looks consistent beside the textured Mini Characters.
- **Sitting:** Mini Characters has a `sit` clip, so seated characters need no position offset. It has 12 characters (6 female, 6 male), each with the same 32 clips. Clips that suit Task choices include `interact-left`, `interact-right`, `pick-up`, `emote-yes`, `emote-no` and the `holding-*` set.
- **Asset paths:** the Furniture Kit ships its GLB files in `Models/GLTF format`. Mini Characters ships them in `Models/GLB format`, and they need the `Textures/colormap.png` file beside them.

Rejected options: removing the near walls entirely (variant A's walls), fading full walls (variant C), a lower 30° or steeper 50° angle, and camera rotation.

The prototype is captured on branch `prototype/office-look` (commit `5cadec0`), in `prototype/office-look` (run `pnpm --dir prototype/office-look dev`, then open `?variant=A|B|C`). The chosen look is variant A's angle with variant B's walls.

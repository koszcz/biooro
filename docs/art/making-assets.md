# Making 3D assets that match the Kenney kits

Use this guide when you build or restyle any 3D asset that the Kenney kits lack. The goal is an asset that blends in, so nobody can tell it was not part of the kit. The worked example is `makePrinter()` in `prototype/pressures-ui/src/scene.ts`.

## Steps

1. **Find a kit twin.** Pick the kit model closest in role and bulk, such as the washer for a floor-standing copier. Run `python3 scripts/kenney-info.py <names>` to print its real size and materials. Run it with `--all` to list every model.
2. **Set the size from the twin.** Match its footprint and height, then check the size against the desk (0.73 wide, 0.38 tall). Real-world ratios to a desk work well. A copier stands just above desk height.
3. **Build from chamfered boxes.** Use `RoundedBoxGeometry(w, h, d, 1, radius)` with a radius of about 0.012, so every edge has one small bevel. Aim for about ten parts.
4. **Add detail with shape, not texture.** Show drawers, slots and handles as thin strips in a darker kit material, set slightly in or out from the body.
5. **Use only kit materials** (see the table). Keep roughness 1 and metalness 0, use flat shading, and give colours as linear RGB with `THREE.LinearSRGBColorSpace`.
6. **Place the origin at the centre of the footprint, with the base at y = 0.** Face the front toward +z, toward the camera.
7. **Check it in the scene.** Open the preview and zoom a screenshot on the asset next to kit pieces, such as the trash can. You are done when it reads as the same family: same tone, same scale, same edge softness.

## Kit materials

All kit materials have roughness 1, metalness 0, no glow, and no texture. Values are linear RGB.

| Material | Linear RGB | Use for |
| --- | --- | --- |
| `metal` | 0.741, 0.823, 0.84 | Main body of machines and appliances |
| `metalLight` | 0.937, 0.98, 0.957 | Light panels |
| `metalMedium` | 0.369, 0.467, 0.467 | Lids and secondary parts |
| `metalDark` | 0.306, 0.388, 0.388 | Gaps, slots, handles, bases |
| `wood` | 0.896, 0.602, 0.393 | Wooden bodies |
| `woodDark` | 0.678, 0.456, 0.299 | Wooden trim and gaps |
| `carpetWhite` | 0.973, 1, 1 | Paper and white parts |
| `carpet` | 0.943, 0.367, 0.343 | Red fabric |
| `carpetDarker` | 0.608, 0.298, 0.285 | Dark red fabric |
| `carpetBlue` | 0.356, 0.517, 0.868 | Blue fabric |
| `fur` | 0.647, 0.459, 0.298 | Brown soft parts |
| `plant` | 0.182, 0.821, 0.576 | Leaves |
| `lamp` | 1, 0.914, 0.588 | Lamp shades |
| `glass` | 0.698, 0.827, 0.769 | Glass, blended (`transparent`) |

## Why the first printer stood out

The first printer broke three of these rules:

- It was about twice the kit's scale, because it was sized in real-world metres and not against a kit twin.
- It had glowing green and orange lights, which no kit model has.
- It had sharp edges and invented greys.

Faction colours and cast cues from the art direction ticket apply to people only. Furniture and machines use kit materials.

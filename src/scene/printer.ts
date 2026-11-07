// The printer. The Kenney kits have none, so it is built from chamfered boxes, copied from
// makePrinter() in prototype/pressures-ui/src/scene.ts. See docs/art/making-assets.md.
// It is a floor-standing copier the size of the kit's washer, in the kit's own materials.
import { BoxGeometry, Color, Group, LinearSRGBColorSpace, type Material, Mesh, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const kit = (r: number, g: number, b: number) =>
  new MeshStandardMaterial({
    color: new Color().setRGB(r, g, b, LinearSRGBColorSpace),
    roughness: 1,
    metalness: 0,
    flatShading: true,
  });

/** The origin is the centre of the footprint, with the base at y = 0. The front faces +z, toward the camera. */
export function makePrinter(): Group {
  const printer = new Group();
  printer.name = "printer";
  const metal = kit(0.741, 0.823, 0.84);
  const metalMedium = kit(0.369, 0.467, 0.467);
  const metalDark = kit(0.306, 0.388, 0.388);
  const white = kit(0.973, 1, 1);
  const part = (
    w: number,
    h: number,
    d: number,
    m: Material,
    at: [number, number, number],
    bevel = 0.012,
    tilt = 0,
  ) => {
    const geometry = bevel
      ? new RoundedBoxGeometry(w, h, d, 1, Math.min(bevel, h / 2 - 0.001))
      : new BoxGeometry(w, h, d);
    const mesh = new Mesh(geometry, m);
    mesh.position.set(...at);
    mesh.rotation.x = tilt;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    printer.add(mesh);
  };
  part(0.34, 0.03, 0.28, metalDark, [0, 0.015, 0], 0); // plinth, set in
  part(0.38, 0.27, 0.32, metal, [0, 0.165, 0]); // paper cabinet
  part(0.34, 0.006, 0.006, metalDark, [0, 0.165, 0.161], 0); // gap between the two drawers
  for (const y of [0.1, 0.235]) part(0.1, 0.016, 0.014, metalDark, [0, y, 0.163], 0.004); // drawer handles
  part(0.38, 0.12, 0.32, metal, [0, 0.36, 0]); // print engine
  part(0.28, 0.022, 0.01, metalDark, [0, 0.345, 0.158], 0); // output slot
  part(0.2, 0.006, 0.1, white, [0, 0.338, 0.195], 0, -0.08); // a sheet half out of the slot
  part(0.38, 0.03, 0.32, metalMedium, [0, 0.435, 0]); // scanner lid
  part(0.12, 0.02, 0.07, metalDark, [0.11, 0.455, 0.1], 0.006); // control panel
  return printer;
}

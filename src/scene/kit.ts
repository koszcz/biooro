// The Kenney kit's materials and chamfered boxes, for parts the kits lack. See docs/art/making-assets.md.
import { BoxGeometry, type BufferGeometry, Color, LinearSRGBColorSpace, MeshStandardMaterial } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** The kit materials table from docs/art/making-assets.md, in linear RGB. */
export const KIT_COLOURS = {
  metal: [0.741, 0.823, 0.84],
  metalLight: [0.937, 0.98, 0.957],
  metalMedium: [0.369, 0.467, 0.467],
  metalDark: [0.306, 0.388, 0.388],
  wood: [0.896, 0.602, 0.393],
  woodDark: [0.678, 0.456, 0.299],
  carpetWhite: [0.973, 1, 1],
  carpet: [0.943, 0.367, 0.343],
  carpetDarker: [0.608, 0.298, 0.285],
  carpetBlue: [0.356, 0.517, 0.868],
  fur: [0.647, 0.459, 0.298],
  plant: [0.182, 0.821, 0.576],
  lamp: [1, 0.914, 0.588],
  glass: [0.698, 0.827, 0.769],
} as const satisfies Record<string, readonly [number, number, number]>;

export type KitMaterial = keyof typeof KIT_COLOURS;

/** The bevel on every chamfered box edge. */
export const KIT_BEVEL = 0.012;

const cache = new Map<KitMaterial, MeshStandardMaterial>();

/** A kit material: roughness 1, metalness 0, flat shading, no glow and no texture. Each name is shared. */
export function kitMaterial(name: KitMaterial): MeshStandardMaterial {
  let material = cache.get(name);
  if (!material) {
    const [r, g, b] = KIT_COLOURS[name];
    material = new MeshStandardMaterial({
      color: new Color().setRGB(r, g, b, LinearSRGBColorSpace),
      roughness: 1,
      metalness: 0,
      flatShading: true,
    });
    cache.set(name, material);
  }
  return material;
}

/**
 * A box with one small bevel on every edge. The bevel shrinks to fit a thin box.
 * A box too thin for any bevel stays a plain box.
 */
export function chamferedBox(width: number, height: number, depth: number, bevel = KIT_BEVEL): BufferGeometry {
  const radius = Math.min(bevel, Math.min(width, height, depth) / 2 - 0.001);
  return radius > 0.001
    ? new RoundedBoxGeometry(width, height, depth, 1, radius)
    : new BoxGeometry(width, height, depth);
}

/** A kit material's colour as a CSS colour, for canvas textures such as door labels. */
export const kitCss = (name: KitMaterial): string => `#${kitMaterial(name).color.getHexString()}`;

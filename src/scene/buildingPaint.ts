// Repaints the City Kit buildings in warm, muted colours, so the city around the office feels friendly, not grey.
// The kit's colour map is a grid of swatches. Its main wall swatch is blue-grey and its roof swatch is near black.
// Each paint is a copy of the map with the wall swatch tinted one colour and the roof swatch lifted to a warm grey.
import { CanvasTexture, Mesh, type MeshStandardMaterial, type Object3D } from "three";

/** Wall colours: terracotta, sage, ochre, slate blue, brick and stone. Muted, not pastel. */
const WALL_TINTS = ["#d98a62", "#8fb59c", "#d9b25e", "#7f9cc0", "#b9665a", "#d6c7aa"] as const;
export const PAINT_COUNT = WALL_TINTS.length;

/** A roof of warm grey, lighter than the kit's, so rooftops do not darken the view. */
const ROOF_TINT = "#a99f96";

/** The swatches to repaint, in pixels on the 512 by 512 map: [x, y, width, height]. */
const WALL_SWATCH = [0, 256, 64, 128] as const;
const ROOF_SWATCH = [64, 256, 64, 128] as const;

export type BuildingPaints = {
  /** A copy of `model` wearing paint number `paint`, from 0 to PAINT_COUNT - 1. */
  paint(model: Object3D, paint: number): Object3D;
};

export function createBuildingPaints(sample: Object3D): BuildingPaints {
  let base: MeshStandardMaterial | undefined;
  sample.traverse((o) => {
    if (o instanceof Mesh) base ??= o.material as MeshStandardMaterial;
  });
  const materials = WALL_TINTS.map((tint) => (base?.map ? repaint(base, tint) : base));
  return {
    paint(model, paint) {
      const material = materials[paint % materials.length];
      if (material)
        model.traverse((o) => {
          if (o instanceof Mesh) o.material = material;
        });
      return model;
    },
  };
}

function repaint(base: MeshStandardMaterial, wallTint: string): MeshStandardMaterial {
  const image = base.map?.image as CanvasImageSource & { width: number; height: number };
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const g = canvas.getContext("2d");
  if (!g || !base.map) return base;
  g.drawImage(image, 0, 0);
  const scale = image.width / 512;
  tintSwatch(g, WALL_SWATCH, wallTint, scale);
  tintSwatch(g, ROOF_SWATCH, ROOF_TINT, scale);

  const texture = new CanvasTexture(canvas);
  texture.flipY = base.map.flipY;
  texture.colorSpace = base.map.colorSpace;
  texture.magFilter = base.map.magFilter;
  texture.minFilter = base.map.minFilter;
  texture.wrapS = base.map.wrapS;
  texture.wrapT = base.map.wrapT;
  const material = base.clone();
  material.map = texture;
  return material;
}

/** Recolours a swatch to `tint`, keeping the kit's soft top-to-bottom shading. */
function tintSwatch(
  g: CanvasRenderingContext2D,
  [x, y, width, height]: readonly number[],
  tint: string,
  scale: number,
): void {
  const box = [x, y, width, height].map((n) => Math.round(n * scale)) as [number, number, number, number];
  const pixels = g.getImageData(...box);
  const [tr, tg, tb] = [1, 3, 5].map((i) => Number.parseInt(tint.slice(i, i + 2), 16));
  const light = (i: number) => pixels.data[i] * 0.3 + pixels.data[i + 1] * 0.59 + pixels.data[i + 2] * 0.11;
  let brightest = 1;
  for (let i = 0; i < pixels.data.length; i += 4) brightest = Math.max(brightest, light(i));
  for (let i = 0; i < pixels.data.length; i += 4) {
    const shade = 0.8 + 0.2 * (light(i) / brightest);
    pixels.data[i] = tr * shade;
    pixels.data[i + 1] = tg * shade;
    pixels.data[i + 2] = tb * shade;
  }
  g.putImageData(pixels, box[0], box[1]);
}

// The ground of each city block: a raised pavement with a kerb, sand-coloured paving inside it, and street trees.
// Colours come from the kits' own colour maps, so they match the roads and buildings.
import { type BufferGeometry, type Material, Mesh, PlaneGeometry } from "three";
import type { Instancer } from "./instancing";
import { chamferedBox } from "./kit";
import { BLOCK, type Block, ROAD_SCALE } from "./outsideLayout";
import { addTree } from "./trees";

/** The pavement stands this high above the road, like a kerb. Buildings sink into it a little. */
export const KERB = 0.06;
/** The pavement's width between the kerb and the paving. Buildings start at its inner edge. */
const PAVEMENT = 2;
/** Street trees stand this far apart along each pavement. */
const TREE_GAP = 6;
/** No street trees this close to a corner, so they stay clear of the zebra crossings and their lights. */
const CORNER_CLEARANCE = 5;

/** Swatch UVs: light grey pavement in the roads map, and sandy cream in the buildings map. */
const PAVEMENT_UV = [0.469, 0.525] as const;
const PAVING_UV = [0.94, 0.53] as const;

/** The top of the paving inside a block. Lawns and other ground cover sit just above it. */
export const PAVING_TOP = KERB + 0.005;

const SIZE = BLOCK - ROAD_SCALE;

function flatUv(geometry: BufferGeometry, [u, v]: readonly [number, number]): BufferGeometry {
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) uvs.setXY(i, u, v);
  return geometry;
}

export type BlockMaterials = { road: Material; building: Material };

/** Lays one block's pavement, paving and street trees. */
export function addBlockGround(city: Instancer, block: Block, materials: BlockMaterials): void {
  const x = (block.west + block.east) / 2;
  const z = (block.north + block.south) / 2;
  city.add("pavement", () => pavementSlab(materials.road), { x, z });
  city.add("paving", () => paving(materials.building), { x, z });
  streetTrees(city, block);
}

function pavementSlab(road: Material): Mesh {
  const slab = new Mesh(flatUv(chamferedBox(SIZE, KERB, SIZE, 0.02), PAVEMENT_UV), road);
  slab.position.y = KERB / 2;
  return slab;
}

function paving(building: Material): Mesh {
  const geometry = flatUv(new PlaneGeometry(SIZE - PAVEMENT * 2, SIZE - PAVEMENT * 2), PAVING_UV);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new Mesh(geometry, building);
  mesh.position.y = PAVING_TOP;
  return mesh;
}

/** A row of trees along the middle of each pavement, clear of the corners. */
function streetTrees(city: Instancer, block: Block): void {
  const inset = ROAD_SCALE / 2 + PAVEMENT / 2;
  const sides = [
    [block.north + inset, "x"],
    [block.south - inset, "x"],
    [block.west + inset, "z"],
    [block.east - inset, "z"],
  ] as const;
  for (const [line, along] of sides) {
    const [from, to] = along === "x" ? [block.west, block.east] : [block.north, block.south];
    for (let at = from + CORNER_CLEARANCE + 1; at <= to - CORNER_CLEARANCE; at += TREE_GAP) {
      const [x, z] = along === "x" ? [at, line] : [line, at];
      addTree(city, x, z, 0.75);
    }
  }
}

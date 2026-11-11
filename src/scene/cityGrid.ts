// The city around the office: a grid of roads, blocks packed with Kenney buildings, street lamps, traffic lights and a park.
// Everything here is instanced and still. Blocks in front of the office keep their buildings low, so the office stays in view.
import { Box3, type Group, Mesh, PlaneGeometry, Vector3 } from "three";
import { addBlockGround, PAVING_TOP } from "./blockGround";
import { createBuildingPaints, PAINT_COUNT } from "./buildingPaint";
import { createInstancer, firstMaterial, type Instancer } from "./instancing";
import { kitMaterial } from "./kit";
import type { ModelLibrary, OutsideKit, OutsideModel } from "./models";
import {
  BLOCK,
  type Block,
  cityBlocks,
  FRONT_ROAD_Z,
  GRID_X_RANGE,
  GRID_XS,
  GRID_Z_RANGE,
  GRID_ZS,
  isInFront,
  isOfficeBlock,
  isParkBlock,
  ROAD_SCALE,
  SIDE_ROAD_X,
} from "./outsideLayout";
import { addTree } from "./trees";

/** Kenney City Kit buildings are sized for a 1-unit road tile. Ours are 3, so buildings scale to match. */
const BUILDING_SCALE = 3;
/** The pavement between a road's edge and the first buildings. */
const PAVEMENT = 2;
/** Buildings stand on a grid this many units apart inside each block. */
const LOT_PITCH = 4.6;
/** The tallest a building in front of the office may be. The office walls stand 1.3. */
const LOW_HEIGHT = 4;

const BUILDINGS: OutsideModel<"city">[] = [
  "building-a",
  "building-b",
  "building-c",
  "building-d",
  "building-e",
  "building-f",
  "building-g",
  "building-h",
  "building-i",
  "building-j",
  "building-k",
  "building-l",
  "building-m",
  "building-n",
];
const SKYSCRAPERS: OutsideModel<"city">[] = ["building-skyscraper-a", "building-skyscraper-b", "building-skyscraper-c"];

/** A steady pseudo-random number from 0 to 1 for a spot, so the city looks the same every time. */
const noise = (x: number, z: number, salt = 0): number => {
  const n = Math.sin(x * 12.9898 + z * 78.233 + salt * 37.719) * 43758.5453;
  return n - Math.floor(n);
};

export function buildCity(models: ModelLibrary): Group {
  const city = createInstancer();
  const add = <K extends OutsideKit>(kit: K, name: OutsideModel<K>, x: number, z: number, turn = 0, scale = 1) =>
    city.add(`${kit}/${name}`, () => models.outside(kit, name), { x, z, turn, scale });

  const paints = createBuildingPaints(models.outside("city", "building-a"));
  const addBuilding: AddBuilding = (name, x, z, turn, scale) => {
    const paint = Math.floor(noise(x, z, 7) * PAINT_COUNT);
    city.add(`city/${name}#${paint}`, () => paints.paint(models.outside("city", name), paint), { x, z, turn, scale });
  };

  roads(add);
  streetLights(add);
  const sizes = new Map<OutsideModel<"city">, Vector3>();
  const sizeOf = (name: OutsideModel<"city">) => {
    let size = sizes.get(name);
    if (!size) {
      size = new Box3().setFromObject(models.outside("city", name)).getSize(new Vector3());
      sizes.set(name, size);
    }
    return size;
  };
  const materials = {
    road: firstMaterial(models.outside("roads", "road-straight")),
    building: firstMaterial(models.outside("city", "building-a")),
  };
  const courtyard = (x: number, z: number, size: number) => {
    city.add("lawn", lawn, { x, z, y: PAVING_TOP + 0.005, scale: size });
    addTree(city, x, z, 0.7 + noise(x, z, 8) * 0.4);
  };
  for (const block of cityBlocks()) {
    if (isOfficeBlock(block)) continue;
    addBlockGround(city, block, materials);
    if (isParkBlock(block)) park(city, block);
    else buildings(block, sizeOf, addBuilding, courtyard);
  }
  return city.build();
}

type AddBuilding = (name: OutsideModel<"city">, x: number, z: number, turn: number, scale: number) => void;

type Add = <K extends OutsideKit>(
  kit: K,
  name: OutsideModel<K>,
  x: number,
  z: number,
  turn?: number,
  scale?: number,
) => void;

/** The tile centres along one road, between `from` and `to`, lined up with the tiles at `anchor`. */
function tileSpots(anchor: number, from: number, to: number): number[] {
  const first = anchor + Math.ceil((from - anchor) / ROAD_SCALE) * ROAD_SCALE;
  return Array.from({ length: Math.floor((to - first) / ROAD_SCALE) + 1 }, (_, i) => first + i * ROAD_SCALE);
}

/** True when `spot` is the tile next to a crossroad, where a zebra crossing goes. */
const besideCrossroad = (spot: number, roads: number[]) => roads.some((road) => Math.abs(road - spot) === ROAD_SCALE);

/** A mid-block zebra crossing on the front road, from the car park to the park. */
const PARK_CROSSING_X = SIDE_ROAD_X - BLOCK / 2;

/** The straight or zebra tiles along one road, skipping the crossroads, which `roads` lays separately. */
function roadTiles(
  add: Add,
  spots: number[],
  crossings: number[],
  place: (spot: number) => [number, number],
  turn: number,
) {
  for (const spot of spots) {
    if (crossings.includes(spot)) continue;
    const [x, z] = place(spot);
    const zebra = besideCrossroad(spot, crossings) || (z === FRONT_ROAD_Z && x === PARK_CROSSING_X);
    add("roads", zebra ? "road-crossing" : "road-straight", x, z, turn, ROAD_SCALE);
    if (zebra) crossingLights(add, x, z, turn);
  }
}

/** Crossing lights stand a little shorter than the traffic lights at the office's crossroad. */
const CROSSING_LIGHT_SCALE = 2.2;

/** A crossing light on each kerb of a zebra crossing, both facing across the road. */
function crossingLights(add: Add, x: number, z: number, turn: number): void {
  const kerb = ROAD_SCALE / 2 + 0.25;
  // A road along x has its kerbs north and south. A road along z has them east and west.
  const [dx, dz] = turn === 0 ? [0, kerb] : [kerb, 0];
  const across = turn === 0 ? 0 : Math.PI / 2;
  add("roads", "traffic-light", x + dx, z + dz, across + Math.PI, CROSSING_LIGHT_SCALE);
  add("roads", "traffic-light", x - dx, z - dz, across, CROSSING_LIGHT_SCALE);
}

/**
 * Road tiles along every grid line, with a crossroad tile wherever two roads meet.
 * Every road gets a zebra crossing just before each crossroad.
 */
function roads(add: Add): void {
  const alongX = tileSpots(SIDE_ROAD_X, ...GRID_X_RANGE);
  const alongZ = tileSpots(FRONT_ROAD_Z, ...GRID_Z_RANGE);
  for (const z of GRID_ZS) roadTiles(add, alongX, GRID_XS, (x) => [x, z], 0);
  for (const x of GRID_XS) roadTiles(add, alongZ, GRID_ZS, (z) => [x, z], Math.PI / 2);
  for (const x of GRID_XS) for (const z of GRID_ZS) add("roads", "road-crossroad", x, z, 0, ROAD_SCALE);
}

/** Street lamps along the south side of every east-west road, and traffic lights at the office's crossing. */
function streetLights(add: Add): void {
  const edge = ROAD_SCALE / 2 + 0.3;
  for (const z of GRID_ZS)
    for (let x = GRID_X_RANGE[0] + 6; x < GRID_X_RANGE[1]; x += 9)
      if (!GRID_XS.some((road) => Math.abs(road - x) < 3))
        add("roads", "light-curved", x, z + edge, Math.PI, ROAD_SCALE);
  const corners = [
    [1, 1, 0],
    [-1, 1, -Math.PI / 2],
    [-1, -1, Math.PI],
    [1, -1, Math.PI / 2],
  ] as const;
  for (const [sx, sz, turn] of corners)
    add("roads", "traffic-light", SIDE_ROAD_X + sx * edge, FRONT_ROAD_Z + sz * edge, turn, ROAD_SCALE);
}

/** Fills a block with buildings on a grid. Outer buildings face the road. Now and then an inner lot is a lawn with a tree. */
function buildings(
  block: Block,
  sizeOf: (name: OutsideModel<"city">) => Vector3,
  addBuilding: AddBuilding,
  courtyard: (x: number, z: number, size: number) => void,
): void {
  const low = isInFront(block);
  const inset = ROAD_SCALE / 2 + PAVEMENT;
  const west = block.west + inset;
  const north = block.north + inset;
  const span = block.east - block.west - inset * 2;
  const count = Math.floor(span / LOT_PITCH);
  const pitch = span / count;
  for (let i = 0; i < count; i++)
    for (let j = 0; j < count; j++) {
      const x = west + pitch * (i + 0.5);
      const z = north + pitch * (j + 0.5);
      const roll = noise(x, z);
      const outer = i === 0 || j === 0 || i === count - 1 || j === count - 1;
      if (!outer && roll < 0.12) {
        courtyard(x, z, pitch - 0.8);
        continue;
      }
      const tall = !low && roll > 0.93;
      const pool = (tall ? SKYSCRAPERS : BUILDINGS).filter((n) => !low || sizeOf(n).y * BUILDING_SCALE <= LOW_HEIGHT);
      const name = pool[Math.floor(noise(x, z, 1) * pool.length)];
      const size = sizeOf(name);
      const scale = Math.min(BUILDING_SCALE, (pitch - 0.4) / Math.max(size.x, size.z));
      addBuilding(name, x, z, faceRoad(i, j, count), scale);
    }
}

/** The turn that points a building's front, its +z side, at the nearest road. */
function faceRoad(i: number, j: number, count: number): number {
  const last = count - 1;
  if (j === last) return 0;
  if (j === 0) return Math.PI;
  if (i === last) return Math.PI / 2;
  if (i === 0) return -Math.PI / 2;
  return 0;
}

/** Lawns in the park: this many a side, this wide, with paved paths between them. */
const LAWNS = 4;
const LAWN = 5;
const PATH = 1;

/** A flat square of grass, 1 by 1, for the instancer to scale. */
function lawn(): Mesh {
  const geometry = new PlaneGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);
  return new Mesh(geometry, kitMaterial("plant"));
}

/** A paved square of lawns with paths between them. Each lawn holds a few trees. */
function park(city: Instancer, block: Block): void {
  const span = LAWNS * LAWN + (LAWNS - 1) * PATH;
  const west = (block.west + block.east - span) / 2;
  const north = (block.north + block.south - span) / 2;
  for (let i = 0; i < LAWNS; i++)
    for (let j = 0; j < LAWNS; j++) {
      const x = west + i * (LAWN + PATH) + LAWN / 2;
      const z = north + j * (LAWN + PATH) + LAWN / 2;
      city.add("lawn", lawn, { x, z, y: PAVING_TOP + 0.005, scale: LAWN });
      const trees = Math.floor(noise(x, z, 3) * 4);
      for (let t = 0; t < trees; t++) {
        const dx = (noise(x, z, 4 + t) - 0.5) * (LAWN - 1.4);
        const dz = (noise(z, x, 5 + t) - 0.5) * (LAWN - 1.4);
        addTree(city, x + dx, z + dz, 0.8 + noise(x, z, 6 + t) * 0.5);
      }
    }
}

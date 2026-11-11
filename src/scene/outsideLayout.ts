// Where the outside pieces go, in office units. The office floor runs from (-0.5, -0.5) to its far corner.
// Road tiles are scaled to 3 units. The car park sits south of the office, after one strip of pavement.
import { FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";

/** Road, pavement and lamp models are scaled to this. One road tile is 3 by 3. */
export const ROAD_SCALE = 3;
/** The office's east and south edges. */
export const EAST = FLOOR_WIDTH - 0.5;
export const SOUTH = FLOOR_DEPTH - 0.5;
/** The car park's north and south edges. It is three road tiles deep. */
export const LOT_NORTH = SOUTH + ROAD_SCALE;
export const LOT_SOUTH = LOT_NORTH + 3 * ROAD_SCALE;
/** The centre lines of the two roads. They cross at the car park's south-east corner. */
export const FRONT_ROAD_Z = LOT_SOUTH + ROAD_SCALE / 2;
export const SIDE_ROAD_X = EAST + ROAD_SCALE + ROAD_SCALE / 2;

export type ParkingRow = {
  /** The row's centre line. */
  z: number;
  /** The x of the first and last painted line. */
  firstLine: number;
  lastLine: number;
  bayWidth: number;
  bayDepth: number;
  /** The way a parked car's nose points: 1 is south, -1 is north. Cars nose toward the aisle. */
  facing: 1 | -1;
};

const BAY_WIDTH = 1.6;
const BAY_DEPTH = 2.4;
const BAYS = 14;

/** The car park's two rows of bays, with an aisle between them. */
export const PARKING_ROWS: readonly ParkingRow[] = [
  { z: LOT_NORTH + 1.5, facing: 1 },
  { z: LOT_SOUTH - 1.7, facing: -1 },
].map(({ z, facing }) => ({
  z,
  facing: facing as 1 | -1,
  firstLine: 0,
  lastLine: BAYS * BAY_WIDTH,
  bayWidth: BAY_WIDTH,
  bayDepth: BAY_DEPTH,
}));

/** The centre of bay `bay` in row `row`. */
export function bayCentre(row: number, bay: number): { x: number; z: number } {
  const r = PARKING_ROWS[row];
  return { x: r.firstLine + r.bayWidth * (bay + 0.5), z: r.z };
}

/** The city's roads form a grid of square blocks, this many units from road to road. The office's block is one of them. */
export const BLOCK = 30;
/** The x of each north-south road, and the z of each east-west road. The office's roads are among them. */
export const GRID_XS = [-2, -1, 0, 1, 2].map((k) => SIDE_ROAD_X + k * BLOCK);
export const GRID_ZS = [-2, -1, 0, 1].map((k) => FRONT_ROAD_Z + k * BLOCK);
/** The roads run one block past the outermost crossings, into the fog. */
export const GRID_X_RANGE = [GRID_XS[0] - BLOCK, GRID_XS[GRID_XS.length - 1] + BLOCK] as const;
export const GRID_Z_RANGE = [GRID_ZS[0] - BLOCK, GRID_ZS[GRID_ZS.length - 1] + BLOCK] as const;

/** A city block: the square between four roads, by its road centre lines. */
export type Block = { west: number; east: number; north: number; south: number };

/** Every block in the grid, including the outer ring that fades into the fog. */
export function cityBlocks(): Block[] {
  const xs = [GRID_X_RANGE[0], ...GRID_XS, GRID_X_RANGE[1]];
  const zs = [GRID_Z_RANGE[0], ...GRID_ZS, GRID_Z_RANGE[1]];
  return xs.slice(1).flatMap((east, i) => zs.slice(1).map((south, j) => ({ west: xs[i], east, north: zs[j], south })));
}

/** The office's own block. It holds the office, its car park and pavement, and no other buildings. */
export const isOfficeBlock = (b: Block): boolean => b.east === SIDE_ROAD_X && b.south === FRONT_ROAD_Z;

/** The park sits south of the office, across the front road. */
export const isParkBlock = (b: Block): boolean => b.east === SIDE_ROAD_X && b.north === FRONT_ROAD_Z;

/**
 * Blocks in front of the office, as the camera sees it. Their buildings stay low, so they never hide the office.
 * The camera looks from the south-east, so these are the blocks south or east of the office's roads.
 */
export const isInFront = (b: Block): boolean =>
  (b.west >= SIDE_ROAD_X && b.south > FRONT_ROAD_Z - BLOCK) ||
  (b.north >= FRONT_ROAD_Z && b.east > SIDE_ROAD_X - BLOCK * 2);

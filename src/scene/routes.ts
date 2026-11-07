// Turns a click on a floor cell or a chair into the floor points the Intern walks through.
import type { Cell, Piece } from "../content/index";
import { findPath } from "./pathfinding";
import type { FloorPoint } from "./walker";

/** The tile under a floor point. Tiles are centred on whole numbers. */
// Adding 0 turns the -0 that Math.round gives for small negative numbers into 0.
export const cellAt = (point: FloorPoint): Cell => ({ col: Math.round(point.x) + 0, row: Math.round(point.z) + 0 });

const centreOf = (cell: Cell): FloorPoint => ({ x: cell.col, z: cell.row });

/** The tile centres from `from` to `to`, leaving out `from`. Null when `to` cannot be reached. */
export function routeToCell(from: Cell, to: Cell): FloorPoint[] | null {
  const path = findPath(from, to);
  return path ? path.slice(1).map(centreOf) : null;
}

/** Where a chair puts a seated person. */
export const seatPoint = (chair: Piece): FloorPoint => ({
  x: chair.cell.col + (chair.offset?.x ?? 0),
  z: chair.cell.row + (chair.offset?.z ?? 0),
});

/** The eight cells around a person, front (toward the camera) and sides first. */
const AROUND = [
  [0, 1],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, -1],
] as const;

/**
 * The walk to the nearest free cell beside a person at `target`. Empty when the Intern already stands
 * beside them. Null when no cell beside them can be reached.
 */
export function routeBeside(from: Cell, target: Cell): FloorPoint[] | null {
  if (Math.max(Math.abs(from.col - target.col), Math.abs(from.row - target.row)) === 1) return [];
  let best: FloorPoint[] | null = null;
  for (const [dc, dr] of AROUND) {
    const route = routeToCell(from, { col: target.col + dc, row: target.row + dr });
    if (route && (!best || route.length < best.length)) best = route;
  }
  return best;
}

export type WalkGoal = { cell: Cell } | { chair: Piece } | { beside: Cell };
/** The points to walk through, and where the target ring goes. */
export type Walk = { route: FloorPoint[]; target: FloorPoint };

/**
 * Plans a walk from where the Intern is. A seated Intern first steps back to the cell behind the chair,
 * because the chair shares its cell with the desk.
 */
export function planWalk(position: FloorPoint, seatedOn: Piece | undefined, goal: WalkGoal): Walk | null {
  const standUp = seatedOn?.seat ? [centreOf(seatedOn.seat.approach)] : [];
  const from = seatedOn?.seat ? seatedOn.seat.approach : cellAt(position);
  if ("chair" in goal) {
    const route = routeToSeat(from, goal.chair);
    if (!route || !goal.chair.seat) return null;
    return { route: [...standUp, ...route], target: centreOf(goal.chair.seat.approach) };
  }
  const route = "beside" in goal ? routeBeside(from, goal.beside) : routeToCell(from, goal.cell);
  if (!route) return null;
  return { route: [...standUp, ...route], target: route.at(-1) ?? centreOf(from) };
}

/** The walk to the free cell behind a chair, then onto the chair itself. */
export function routeToSeat(from: Cell, chair: Piece): FloorPoint[] | null {
  if (!chair.seat) return null;
  const approach = routeToCell(from, chair.seat.approach);
  return approach ? [...approach, seatPoint(chair)] : null;
}

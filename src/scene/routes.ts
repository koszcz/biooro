// Turns a click on a floor cell or a chair into the floor points the Intern walks through.
import type { Cell, Piece } from "../content";
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

export type WalkGoal = { cell: Cell } | { chair: Piece };
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
  const route = routeToCell(from, goal.cell);
  return route ? { route: [...standUp, ...route], target: centreOf(goal.cell) } : null;
}

/** The walk to the free cell behind a chair, then onto the chair itself. */
export function routeToSeat(from: Cell, chair: Piece): FloorPoint[] | null {
  if (!chair.seat) return null;
  const approach = routeToCell(from, chair.seat.approach);
  return approach ? [...approach, seatPoint(chair)] : null;
}

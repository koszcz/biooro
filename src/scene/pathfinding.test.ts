import { describe, expect, it } from "vitest";
import { type Cell, COLLEAGUE_SPOTS, isWalkable, PLACE_SPOTS } from "../content";
import { findPath } from "./pathfinding";

const cell = (col: number, row: number): Cell => ({ col, row });

describe("findPath", () => {
  it("walks the Intern through the doorway, never through a wall", () => {
    const path = findPath(cell(6, 6), cell(6, 10));
    expect(path).not.toBeNull();
    for (const step of path ?? []) expect(isWalkable(step)).toBe(true);
    expect(path).toContainEqual(cell(4, 8));
  });

  it("moves one tile at a time in 8 directions", () => {
    const path = findPath(cell(1, 1), cell(7, 3)) ?? [];
    expect(path[0]).toEqual(cell(1, 1));
    expect(path.at(-1)).toEqual(cell(7, 3));
    for (let i = 1; i < path.length; i++) {
      const dc = Math.abs(path[i].col - path[i - 1].col);
      const dr = Math.abs(path[i].row - path[i - 1].row);
      expect(Math.max(dc, dr)).toBe(1);
    }
  });

  it("never cuts the corner of a wall or a piece of furniture", () => {
    const path = findPath(cell(9, 1), cell(17, 10)) ?? [];
    expect(path.length).toBeGreaterThan(0);
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      if (a.col !== b.col && a.row !== b.row) {
        expect(isWalkable(cell(b.col, a.row))).toBe(true);
        expect(isWalkable(cell(a.col, b.row))).toBe(true);
      }
    }
  });

  it("steps diagonally across open floor", () => {
    expect(findPath(cell(5, 9), cell(6, 10))).toEqual([cell(5, 9), cell(6, 10)]);
  });

  it("refuses a diagonal step past a wall corner", () => {
    // (3, 9) to (4, 8) would cut the wall corner at (3, 8).
    expect(findPath(cell(3, 9), cell(4, 8))).toEqual([cell(3, 9), cell(4, 9), cell(4, 8)]);
  });

  it("finds no path to a wall or a blocked cell", () => {
    expect(findPath(cell(1, 1), cell(5, 8))).toBeNull();
    expect(findPath(cell(1, 1), cell(2, 2))).toBeNull();
  });

  it("reaches every Task place and Colleague spot from the Intern's desk", () => {
    const desk = PLACE_SPOTS.desk.stand;
    for (const spot of [...Object.values(PLACE_SPOTS), ...Object.values(COLLEAGUE_SPOTS)]) {
      expect(findPath(desk, spot.stand), `${spot.stand.col},${spot.stand.row}`).not.toBeNull();
    }
  });
});

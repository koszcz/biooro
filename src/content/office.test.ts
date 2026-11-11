import { describe, expect, it } from "vitest";
import {
  CAST,
  COLLEAGUE_SPOTS,
  CORRIDOR_WALL_ROW,
  DOORWAYS,
  isWalkable,
  OFFICE_COLUMNS,
  OFFICE_ROWS,
  PLACE_SPOTS,
} from "./office";

const cell = (col: number, row: number) => ({ col, row });

describe("the office grid", () => {
  it("is 21 by 11 tiles", () => {
    expect(OFFICE_COLUMNS).toBe(21);
    expect(OFFICE_ROWS).toBe(11);
  });

  it("walls the three rooms off from the two-tile corridor, with one doorway each", () => {
    const openInWallRow = [];
    for (let col = 0; col < 21; col++) if (isWalkable(cell(col, 8))) openInWallRow.push(col);
    expect(openInWallRow).toEqual([4, 11, 17]);
    for (let col = 0; col < 21; col++) {
      expect(isWalkable(cell(col, 9)) || isWalkable(cell(col, 10))).toBe(true);
    }
  });

  it("joins neighbouring rooms through one-tile doorways", () => {
    for (const wallCol of [8, 14]) {
      const open = [];
      for (let row = 0; row < 8; row++) if (isWalkable(cell(wallCol, row))) open.push(row);
      expect(open).toEqual([4]);
    }
  });

  it("keeps the floor on both sides of every doorway clear of furniture", () => {
    for (const door of DOORWAYS) {
      const sides =
        door.row === CORRIDOR_WALL_ROW
          ? [cell(door.col, door.row - 1), cell(door.col, door.row + 1)]
          : [cell(door.col - 1, door.row), cell(door.col + 1, door.row)];
      for (const side of sides) expect(isWalkable(side), `beside doorway ${door.col},${door.row}`).toBe(true);
    }
  });

  it("treats every cell off the floor as not walkable", () => {
    for (const c of [cell(-1, 3), cell(21, 3), cell(3, -1), cell(3, 11)]) expect(isWalkable(c)).toBe(false);
  });
});

describe("Task places and Colleague spots", () => {
  it("marks the seven Task places", () => {
    expect(Object.keys(PLACE_SPOTS).sort()).toEqual(
      ["desk", "evidenceShelf", "plant", "printer", "room4", "shredder", "sink"].sort(),
    );
  });

  it("gives every place and spot a walkable stand cell next to it", () => {
    for (const spot of [...Object.values(PLACE_SPOTS), ...Object.values(COLLEAGUE_SPOTS)]) {
      expect(isWalkable(spot.stand)).toBe(true);
      const reach = Math.max(Math.abs(spot.stand.col - spot.cell.col), Math.abs(spot.stand.row - spot.cell.row));
      expect(reach).toBe(1);
    }
  });

  it("has a spot for each of the five cast members", () => {
    expect(Object.keys(COLLEAGUE_SPOTS).sort()).toEqual(["halina", "kamil", "ryszard", "wiola", "zbigniew"].sort());
  });

  it("lists the five cast members, each once", () => {
    expect([...CAST].sort()).toEqual(["halina", "kamil", "ryszard", "wiola", "zbigniew"].sort());
  });
});

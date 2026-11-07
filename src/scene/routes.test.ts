import { describe, expect, it } from "vitest";
import { FURNITURE, type Piece } from "../content";
import { cellAt, planWalk, routeBeside, routeToCell, routeToSeat } from "./routes";

const internChair = FURNITURE.find((p) => p.seat && p.cell.col === 2 && p.cell.row === 2) as Piece;

describe("cellAt", () => {
  it("finds the tile under a floor point, since tiles are centred on whole numbers", () => {
    expect(cellAt({ x: 3.4, z: 6.6 })).toEqual({ col: 3, row: 7 });
    expect(cellAt({ x: -0.4, z: 0.49 })).toEqual({ col: 0, row: 0 });
  });
});

describe("routeToCell", () => {
  it("returns the tile centres to walk through, without the tile the Intern stands on", () => {
    expect(routeToCell({ col: 5, row: 9 }, { col: 7, row: 9 })).toEqual([
      { x: 6, z: 9 },
      { x: 7, z: 9 },
    ]);
  });

  it("returns nothing for a wall or furniture", () => {
    expect(routeToCell({ col: 5, row: 9 }, { col: 5, row: 8 })).toBeNull();
    expect(routeToCell({ col: 5, row: 9 }, { col: 2, row: 10 })).toBeNull();
  });
});

describe("planWalk", () => {
  it("stands a seated Intern up behind the chair before walking on", () => {
    const seat = { x: 2, z: 1.58 };
    const walk = planWalk(seat, internChair, { cell: { col: 2, row: 4 } });
    expect(walk?.route[0]).toEqual({ x: 2, z: 1 });
    expect(walk?.route.at(-1)).toEqual({ x: 2, z: 4 });
    expect(walk?.target).toEqual({ x: 2, z: 4 });
  });

  it("walks a standing Intern to a chair and marks the cell behind it", () => {
    const walk = planWalk({ x: 2, z: 4 }, undefined, { chair: internChair });
    expect(walk?.target).toEqual({ x: 2, z: 1 });
    expect(walk?.route.at(-1)?.z).toBeCloseTo(1.58);
  });

  it("plans nothing for a click on a wall", () => {
    expect(planWalk({ x: 2, z: 4 }, undefined, { cell: { col: 2, row: 8 } })).toBeNull();
  });
});

describe("routeToSeat", () => {
  it("walks to the cell behind the chair, then onto the chair", () => {
    const route = routeToSeat({ col: 2, row: 4 }, internChair) ?? [];
    expect(route.at(-2)).toEqual({ x: 2, z: 1 });
    expect(route.at(-1)?.x).toBeCloseTo(2);
    expect(route.at(-1)?.z).toBeCloseTo(1.58);
  });

  it("sits down at once when the Intern already stands behind the chair", () => {
    const route = routeToSeat({ col: 2, row: 1 }, internChair) ?? [];
    expect(route).toHaveLength(1);
  });
});

describe("routeBeside", () => {
  const wiola = { col: 17, row: 3 };

  const beside = (point: { x: number; z: number } | undefined, cell: { col: number; row: number }) =>
    point !== undefined && Math.max(Math.abs(point.x - cell.col), Math.abs(point.z - cell.row)) === 1;

  it("stops at the first free cell beside the person", () => {
    const fromLeft = routeBeside({ col: 14, row: 4 }, wiola) ?? [];
    expect(fromLeft).toHaveLength(2);
    expect(beside(fromLeft.at(-1), wiola)).toBe(true);
    expect(routeBeside({ col: 20, row: 3 }, wiola)).toEqual([
      { x: 19, z: 3 },
      { x: 18, z: 3 },
    ]);
  });

  it("does not walk when the Intern already stands beside the person", () => {
    expect(routeBeside({ col: 16, row: 2 }, wiola)).toEqual([]);
  });

  it("reaches a seated person whose own cell is blocked", () => {
    const route = routeBeside({ col: 6, row: 10 }, { col: 2, row: 10 }) ?? [];
    expect(route.at(-1)).toEqual({ x: 3, z: 10 });
  });
});

describe("planWalk beside a person", () => {
  it("stands a seated Intern up, then walks beside the person", () => {
    const walk = planWalk({ x: 2, z: 1.58 }, internChair, { beside: { col: 4, row: 2 } });
    expect(walk?.route[0]).toEqual({ x: 2, z: 1 });
    expect(walk?.target).toEqual({ x: 3, z: 1 });
  });
});

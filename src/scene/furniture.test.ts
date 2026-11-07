import { Box3, BoxGeometry, Group, Mesh, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { placePiece } from "./furniture";
import { makePrinter } from "./printer";

// A stand-in Kenney model: its origin sits at a corner, like the real kit.
function cornerModel(width: number, height: number, depth: number): Group {
  const geometry = new BoxGeometry(width, height, depth);
  geometry.translate(width / 2, height / 2, -depth / 2);
  const model = new Group();
  model.add(new Mesh(geometry));
  return model;
}

const footprintCentre = (box: Box3) => box.getCenter(new Vector3()).setY(box.min.y);

describe("placePiece", () => {
  it("centres a Kenney piece on its cell and stands it on the floor", () => {
    const piece = placePiece(cornerModel(0.7, 0.4, 0.4), { model: "desk", cell: { col: 5, row: 3 } });
    const box = new Box3().setFromObject(piece);
    expect(footprintCentre(box).distanceTo(new Vector3(5, 0, 3))).toBeLessThan(1e-9);
  });

  it("keeps a turned piece centred on its cell", () => {
    const piece = placePiece(cornerModel(0.7, 0.4, 0.4), {
      model: "desk",
      cell: { col: 2, row: 2 },
      turn: Math.PI / 2,
    });
    const box = new Box3().setFromObject(piece);
    expect(footprintCentre(box).distanceTo(new Vector3(2, 0, 2))).toBeLessThan(1e-9);
  });

  it("applies the lift and the nudge off the cell centre", () => {
    const piece = placePiece(cornerModel(0.2, 0.1, 0.2), {
      model: "books",
      cell: { col: 1, row: 1 },
      lift: 0.38,
      offset: { x: 0.2, z: -0.1 },
    });
    const box = new Box3().setFromObject(piece);
    expect(footprintCentre(box).distanceTo(new Vector3(1.2, 0.38, 0.9))).toBeLessThan(1e-9);
  });

  it("pushes a piece flat against the back wall", () => {
    const piece = placePiece(cornerModel(0.9, 1.5, 0.4), {
      model: "bookcaseClosed",
      cell: { col: 4, row: 0 },
      againstBackWall: true,
    });
    const box = new Box3().setFromObject(piece);
    expect(box.min.z).toBeCloseTo(-0.47);
    expect(box.getCenter(new Vector3()).x).toBeCloseTo(4);
  });
});

describe("makePrinter", () => {
  it("is a copier about 0.38 wide, 0.45 tall and 0.32 deep, standing on the floor", () => {
    const box = new Box3().setFromObject(makePrinter());
    const size = box.getSize(new Vector3());
    expect(size.x).toBeCloseTo(0.38, 2);
    expect(size.y).toBeCloseTo(0.45, 1);
    expect(size.z).toBeLessThan(0.45);
    expect(box.min.y).toBeCloseTo(0);
  });
});

// Places furniture from the office layout. Kenney origins sit at a corner, so each piece is centred on its cell.
import { Box3, Group, type Object3D, Vector3 } from "three";
import { FURNITURE, type Piece } from "../content/index";
import type { ModelLibrary } from "./models";
import { makePrinter } from "./printer";

/** Gap between a piece pushed against the back wall and the wall itself. */
const WALL_GAP = 0.03;

/** Wraps a model so its footprint centre sits on the piece's cell, then turns, lifts and nudges it. */
export function placePiece(model: Object3D, piece: Piece): Group {
  const box = new Box3().setFromObject(model);
  const centre = box.getCenter(new Vector3());
  model.position.sub(new Vector3(centre.x, box.min.y, centre.z));
  const pivot = new Group();
  pivot.add(model);
  pivot.position.set(piece.cell.col + (piece.offset?.x ?? 0), piece.lift ?? 0, piece.cell.row + (piece.offset?.z ?? 0));
  pivot.rotation.y = piece.turn ?? 0;
  pivot.userData.piece = piece;
  if (piece.againstBackWall) {
    pivot.updateMatrixWorld(true);
    const placed = new Box3().setFromObject(pivot);
    pivot.position.z += piece.cell.row - 0.5 + WALL_GAP - placed.min.z;
  }
  return pivot;
}

export type FurnitureSet = { group: Group; chairs: Group[] };

/** Builds every piece in the office layout. Chairs come back separately, so clicks can find them. */
export function buildFurniture(models: ModelLibrary): FurnitureSet {
  const group = new Group();
  group.name = "furniture";
  const chairs: Group[] = [];
  for (const piece of FURNITURE) {
    const model = piece.model === "printer" ? makePrinter() : models.furniture(piece.model);
    const placed = placePiece(model, piece);
    group.add(placed);
    if (piece.seat) chairs.push(placed);
  }
  return { group, chairs };
}

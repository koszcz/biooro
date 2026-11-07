// The office floor: 21 by 11 tiles, one unit each. Tile (column, row) is centred on (column, 0, row).
import { Mesh, PlaneGeometry } from "three";
import { kitMaterial } from "./kit";

export const FLOOR_WIDTH = 21;
export const FLOOR_DEPTH = 11;

export function createFloor(): Mesh {
  const geometry = new PlaneGeometry(FLOOR_WIDTH, FLOOR_DEPTH);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate((FLOOR_WIDTH - 1) / 2, 0, (FLOOR_DEPTH - 1) / 2);
  const floor = new Mesh(geometry, kitMaterial("metalLight"));
  floor.name = "floor";
  floor.receiveShadow = true;
  return floor;
}

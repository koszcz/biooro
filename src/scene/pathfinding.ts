// Grid A* over the office floor with easystarjs: 8 directions and no corner cutting.
import EasyStar from "easystarjs";
import { type Cell, isWalkable, OFFICE_COLUMNS, OFFICE_ROWS } from "../content";

const WALKABLE = 0;
const BLOCKED = 1;

function createFinder(): EasyStar.js {
  const finder = new EasyStar.js();
  const grid: number[][] = [];
  for (let row = 0; row < OFFICE_ROWS; row++) {
    const line: number[] = [];
    for (let col = 0; col < OFFICE_COLUMNS; col++) line.push(isWalkable({ col, row }) ? WALKABLE : BLOCKED);
    grid.push(line);
  }
  finder.setGrid(grid);
  finder.setAcceptableTiles([WALKABLE]);
  finder.enableDiagonals();
  finder.disableCornerCutting();
  finder.enableSync();
  return finder;
}

let finder: EasyStar.js | undefined;

/** The shortest walk from one cell to another, both ends included. Null when the goal cannot be reached. */
export function findPath(from: Cell, to: Cell): Cell[] | null {
  if (!isWalkable(from) || !isWalkable(to)) return null;
  finder ??= createFinder();
  let result: Cell[] | null = null;
  finder.findPath(from.col, from.row, to.col, to.row, (path) => {
    result = path ? path.map((p) => ({ col: p.x, row: p.y })) : null;
  });
  finder.calculate();
  return result;
}

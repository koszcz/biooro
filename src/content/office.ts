// The office layout: a hand-authored tile grid with walls, doorways, furniture, rugs,
// Colleague spots and the seven Task places. Tile (col, row) is centred on world (col, 0, row).
// Rows grow toward the camera. Row 0 is against the back wall. The corridor is rows 9 and 10.
import type { Assigner, Faction, TaskPlaceId } from "./tasks";

export type Cell = { readonly col: number; readonly row: number };

const cell = (col: number, row: number): Cell => ({ col, row });

// "#" is a wall, "+" is a doorway and "." is floor.
const GRID = [
  "........#.....#......",
  "........#.....#......",
  "........#.....#......",
  "........#.....#......",
  "........+.....+......",
  "........#.....#......",
  "........#.....#......",
  "........#.....#......",
  "####+######+#####+###",
  ".....................",
  ".....................",
] as const;

export const OFFICE_COLUMNS = GRID[0].length;
export const OFFICE_ROWS = GRID.length;
/** The wall row between the rooms and the corridor. */
export const CORRIDOR_WALL_ROW = 8;

const tileAt = (c: Cell): string | undefined => GRID[c.row]?.[c.col];
export const isWall = (c: Cell): boolean => tileAt(c) === "#";

export const DOORWAYS: readonly Cell[] = GRID.flatMap((line, row) =>
  [...line].flatMap((tile, col) => (tile === "+" ? [cell(col, row)] : [])),
);

export type RoomId = "complaints" | "safety" | "showroom";
export type Room = { readonly id: RoomId; readonly name: string; readonly firstCol: number; readonly lastCol: number };
export const ROOMS: readonly Room[] = [
  { id: "complaints", name: "Customer Complaints", firstCol: 0, lastCol: 7 },
  { id: "safety", name: "Product Safety", firstCol: 9, lastCol: 13 },
  { id: "showroom", name: "Showroom", firstCol: 15, lastCol: 20 },
];

/** Kenney Furniture Kit models the office uses. Each is `public/models/furniture/<name>.glb`. */
export type KitModel =
  | "desk"
  | "deskCorner"
  | "computerScreen"
  | "computerKeyboard"
  | "chairDesk"
  | "lampSquareTable"
  | "bookcaseClosed"
  | "bookcaseClosedWide"
  | "bookcaseOpenLow"
  | "books"
  | "pottedPlant"
  | "trashcan"
  | "coatRack"
  | "coatRackStanding"
  | "cardboardBoxClosed"
  | "toilet"
  | "toiletSquare"
  | "bathroomSink"
  | "shower"
  | "bathroomCabinet"
  | "stairsOpen"
  | "bench"
  | "rugDoormat";

/** A piece of furniture. The printer is built in code, so it has no Kenney model. */
export type Piece = {
  readonly model: KitModel | "printer";
  readonly cell: Cell;
  /** Turn around the vertical axis, in radians. 0 faces the camera side (+z). */
  readonly turn?: number;
  /** Nudge off the cell centre, in tiles. */
  readonly offset?: { readonly x?: number; readonly z?: number };
  /** Height of the base above the floor, such as a desk top. */
  readonly lift?: number;
  /** The piece stops walking on its cell. */
  readonly blocks?: boolean;
  /** Push the piece flat against the back wall. */
  readonly againstBackWall?: boolean;
  /** The piece stands on a white Showroom podium. */
  readonly podium?: boolean;
  /** The piece is a chair the Intern can sit on. The Intern walks to `approach` first. */
  readonly seat?: { readonly approach: Cell };
};

export const DESK_TOP = 0.38;
export const PODIUM_HEIGHT = 0.1;
/** How far a desk chair sits from its desk centre, toward the back wall. */
const CHAIR_OFFSET = -0.42;

// A desk with its user on the back-wall side, so the user faces the camera.
function workstation(col: number, row: number, extras: { lamp?: boolean; chairTurn?: number } = {}): Piece[] {
  const at = cell(col, row);
  const pieces: Piece[] = [
    { model: "desk", cell: at, turn: Math.PI, blocks: true },
    { model: "computerScreen", cell: at, turn: Math.PI, lift: DESK_TOP, offset: { z: 0.08 } },
    { model: "computerKeyboard", cell: at, turn: Math.PI, lift: DESK_TOP, offset: { z: -0.1 } },
    {
      model: "chairDesk",
      cell: at,
      turn: extras.chairTurn ?? 0,
      offset: { z: CHAIR_OFFSET },
      seat: { approach: cell(col, row - 1) },
    },
  ];
  if (extras.lamp) pieces.push({ model: "lampSquareTable", cell: at, lift: DESK_TOP, offset: { x: -0.25, z: 0.1 } });
  return pieces;
}

const blocker = (model: KitModel | "printer", col: number, row: number, more: Partial<Piece> = {}): Piece => ({
  model,
  cell: cell(col, row),
  blocks: true,
  ...more,
});

const COMPLAINTS: Piece[] = [
  ...[2, 3, 4, 5, 6].flatMap((col) => workstation(col, 2)),
  ...[3, 4, 5].flatMap((col) => workstation(col, 5)),
  blocker("deskCorner", 1, 5, { turn: Math.PI }),
  { model: "computerScreen", cell: cell(1, 5), turn: Math.PI, lift: DESK_TOP, offset: { x: 0.1, z: 0.15 } },
  { model: "chairDesk", cell: cell(1, 5), offset: { z: -0.5 }, seat: { approach: cell(1, 4) } },
  blocker("bookcaseClosed", 2, 0, { againstBackWall: true }),
  blocker("bookcaseClosedWide", 4, 0, { againstBackWall: true }),
  blocker("bookcaseClosed", 6, 0, { againstBackWall: true }),
  blocker("pottedPlant", 7, 0),
  blocker("printer", 0, 2),
  blocker("trashcan", 0, 7),
  blocker("coatRackStanding", 7, 4),
  blocker("cardboardBoxClosed", 6, 7),
  { model: "cardboardBoxClosed", cell: cell(6, 7), lift: 0.28, turn: 0.4 },
  blocker("cardboardBoxClosed", 7, 7, { turn: 0.2 }),
];

const SAFETY: Piece[] = [
  ...[9, 10, 11, 12, 13].map((col) => blocker("bookcaseClosed", col, 0, { againstBackWall: true })),
  ...workstation(10, 2, { lamp: true }),
  ...workstation(12, 2, { lamp: true, chairTurn: 0.6 }),
  { model: "books", cell: cell(12, 2), lift: DESK_TOP, offset: { x: 0.2 }, turn: 0.3 },
  { model: "books", cell: cell(12, 2), lift: DESK_TOP + 0.1, offset: { x: 0.2, z: 0.05 }, turn: 0.9 },
  blocker("cardboardBoxClosed", 13, 6),
  { model: "cardboardBoxClosed", cell: cell(13, 6), lift: 0.28, turn: 0.2 },
  blocker("cardboardBoxClosed", 13, 7),
  blocker("cardboardBoxClosed", 9, 7),
  blocker("bookcaseOpenLow", 11, 6, { turn: Math.PI }),
];

const onPodium = (model: KitModel, col: number, row: number) =>
  blocker(model, col, row, { lift: PODIUM_HEIGHT, podium: true });

const SHOWROOM: Piece[] = [
  onPodium("toilet", 16, 1),
  onPodium("toiletSquare", 18, 1),
  onPodium("toilet", 20, 1),
  onPodium("bathroomSink", 16, 5),
  onPodium("shower", 18, 5),
  onPodium("bathroomCabinet", 20, 5),
  blocker("pottedPlant", 15, 0),
  blocker("pottedPlant", 20, 7),
];

const CORRIDOR: Piece[] = [
  blocker("stairsOpen", 0, 9, { turn: Math.PI / 2 }),
  blocker("bench", 2, 10),
  blocker("pottedPlant", 20, 9),
  blocker("coatRack", 13, 9),
  { model: "rugDoormat", cell: cell(4, 9) },
  { model: "rugDoormat", cell: cell(11, 9) },
  { model: "rugDoormat", cell: cell(17, 9) },
];

export const FURNITURE: readonly Piece[] = [...COMPLAINTS, ...SAFETY, ...SHOWROOM, ...CORRIDOR];

/** The middle Showroom toilet, from the Smart range. */
export const SMART_TOILET: Cell = cell(18, 1);

/** A Faction rug. Edges are in world units. */
export type Rug = {
  readonly faction: Faction;
  readonly minX: number;
  readonly minZ: number;
  readonly width: number;
  readonly depth: number;
};
export const FACTION_RUGS: readonly Rug[] = [
  { faction: "launchTeam", minX: 0.7, minZ: 0.6, width: 6.6, depth: 4.9 },
  { faction: "paperTrail", minX: 8.7, minZ: 0.6, width: 4.6, depth: 4.9 },
];

const blockedByFurniture = new Set(FURNITURE.filter((p) => p.blocks).map((p) => `${p.cell.col},${p.cell.row}`));

/** True when the Intern can stand on the cell. */
export function isWalkable(c: Cell): boolean {
  const tile = tileAt(c);
  if (tile === undefined || tile === "#") return false;
  return !blockedByFurniture.has(`${c.col},${c.row}`);
}

/** A spot the Intern walks to: the thing itself, and the free cell the Intern stands on beside it. */
export type Spot = { readonly cell: Cell; readonly stand: Cell };

/** Where each Task place is on the office grid. */
export const PLACE_SPOTS: Readonly<Record<TaskPlaceId, Spot>> = {
  desk: { cell: cell(2, 2), stand: cell(2, 1) },
  printer: { cell: cell(0, 2), stand: cell(0, 3) },
  sink: { cell: cell(16, 5), stand: cell(16, 4) },
  plant: { cell: cell(7, 0), stand: cell(7, 1) },
  shredder: { cell: cell(0, 7), stand: cell(0, 6) },
  room4: { cell: SMART_TOILET, stand: cell(18, 2) },
  evidenceShelf: { cell: cell(11, 6), stand: cell(11, 5) },
};

/** The five cast members, by the IDs Tasks use for their assigner. */
export type CastId = Exclude<Assigner, "anyone">;
/** The five cast members: the two Bosses, then the three Colleagues. */
export const CAST: readonly CastId[] = ["zbigniew", "halina", "ryszard", "wiola", "kamil"];
/** Where a cast member sits or stands, and the cell the Intern stands on for a Conversation with them. */
export type ColleagueSpot = Spot & { readonly seated: boolean; readonly offset?: { readonly z: number } };
export const COLLEAGUE_SPOTS: Readonly<Record<CastId, ColleagueSpot>> = {
  zbigniew: { cell: cell(1, 5), offset: { z: -0.5 }, seated: true, stand: cell(1, 4) },
  ryszard: { cell: cell(4, 2), offset: { z: CHAIR_OFFSET }, seated: true, stand: cell(4, 1) },
  halina: { cell: cell(10, 2), offset: { z: CHAIR_OFFSET }, seated: true, stand: cell(10, 1) },
  wiola: { cell: cell(17, 3), seated: false, stand: cell(17, 4) },
  kamil: { cell: cell(2, 10), seated: true, stand: cell(3, 10) },
};

/** Where the Intern stands when the office loads. */
export const INTERN_START: Cell = cell(6, 4);

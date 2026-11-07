// The room floors, walls, doorways, Faction rugs, Showroom podiums, signs and the Smart toilet's LED.
// Colours and sizes follow prototype/office-look/src/art.ts.
import {
  BoxGeometry,
  CanvasTexture,
  Group,
  Mesh,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  PlaneGeometry,
  SphereGeometry,
  SRGBColorSpace,
} from "three";
import {
  CORRIDOR_WALL_ROW,
  DOORWAYS,
  FACTION_RUGS,
  FURNITURE,
  isWall,
  OFFICE_COLUMNS,
  OFFICE_ROWS,
  PODIUM_HEIGHT,
  ROOMS,
  type RoomId,
  SMART_TOILET,
} from "../content";
import { officeSigns } from "../locales";

const FULL_HEIGHT = 1.3;
const INNER_STUB = 0.5;
const NEAR_STUB = 0.2;
const THICKNESS = 0.15;

const LOOK: Record<RoomId, { floor: string; floor2: string; wall: string; gloss?: boolean }> = {
  complaints: { floor: "#d9c9a3", floor2: "#cebd96", wall: "#bcd4c1" },
  safety: { floor: "#aeb8c0", floor2: "#a3aeb7", wall: "#d9d6cc" },
  showroom: { floor: "#efeeea", floor2: "#e3e1db", wall: "#f4efe6", gloss: true },
};
const CORRIDOR_TILES = ["#97988f", "#8e8f8b"];
const INNER_WALL = "#cfc9bb";
const NEAR_WALL = "#8e8f8b";
const THRESHOLD = "#5a554c";
const RUG_COLOURS = { launchTeam: "#a7c8c6", paperTrail: "#c9ab6b" } as const;
const BRAND_TEAL = "#18b6c8";

const material = (color: string, extra: MeshStandardMaterialParameters = {}) =>
  new MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, ...extra });

/** A box by its west, north and bottom edges, in world units. Clicks pass through it. */
function slab(x: number, z: number, y: number, size: [number, number, number], color: string, extra = {}): Mesh {
  const [w, h, d] = size;
  const mesh = new Mesh(new BoxGeometry(w, h, d), material(color, extra));
  mesh.position.set(x + w / 2, y + h / 2, z + d / 2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.raycast = () => {};
  return mesh;
}

function tile(col: number, row: number, color: string, gloss = false): Mesh {
  const mesh = new Mesh(new PlaneGeometry(1, 1), material(color, { roughness: gloss ? 0.35 : 0.95 }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(col, 0.003, row);
  mesh.receiveShadow = true;
  mesh.raycast = () => {};
  return mesh;
}

function floorTiles(group: Group): void {
  for (const room of ROOMS) {
    const look = LOOK[room.id];
    for (let col = room.firstCol; col <= room.lastCol; col++) {
      for (let row = 0; row < CORRIDOR_WALL_ROW; row++) {
        group.add(tile(col, row, (col + row) % 2 ? look.floor : look.floor2, look.gloss));
      }
    }
  }
  for (let col = 0; col < OFFICE_COLUMNS; col++) {
    for (let row = CORRIDOR_WALL_ROW + 1; row < OFFICE_ROWS; row++)
      group.add(tile(col, row, CORRIDOR_TILES[(col + row) % 2]));
  }
}

function walls(group: Group): void {
  const west = -0.5;
  const north = -0.5;
  const east = OFFICE_COLUMNS - 0.5;
  const south = OFFICE_ROWS - 0.5;
  // Back wall, full height, in each room's colour. Each room's share runs to the middle of the next inner wall.
  const edges = [west - THICKNESS, 8, 14, east + THICKNESS];
  ROOMS.forEach((room, i) => {
    const size: [number, number, number] = [edges[i + 1] - edges[i], FULL_HEIGHT, THICKNESS];
    group.add(slab(edges[i], north - THICKNESS, 0, size, LOOK[room.id].wall));
  });
  group.add(slab(west - THICKNESS, north, 0, [THICKNESS, FULL_HEIGHT, south - north], LOOK.complaints.wall));
  // Inner walls: low stubs, so the rooms stay readable from the camera.
  for (let row = 0; row < OFFICE_ROWS; row++) {
    for (let col = 0; col < OFFICE_COLUMNS; col++) {
      if (!isWall({ col, row })) continue;
      const alongX = row === CORRIDOR_WALL_ROW;
      const size: [number, number, number] = alongX ? [1, INNER_STUB, THICKNESS] : [THICKNESS, INNER_STUB, 1];
      group.add(slab(col - size[0] / 2, row - size[2] / 2, 0, size, INNER_WALL));
    }
  }
  // Near outer walls: lower stubs.
  group.add(slab(west, south, 0, [east - west, NEAR_STUB, THICKNESS], NEAR_WALL));
  group.add(slab(east, north, 0, [THICKNESS, NEAR_STUB, south - north + THICKNESS], NEAR_WALL));
  for (const door of DOORWAYS) {
    const [w, d] = door.row === CORRIDOR_WALL_ROW ? [0.8, 0.6] : [0.6, 0.8];
    group.add(slab(door.col - w / 2, door.row - d / 2, 0, [w, 0.02, d], THRESHOLD));
  }
}

function rugsAndPodiums(group: Group): void {
  for (const rug of FACTION_RUGS) {
    group.add(slab(rug.minX, rug.minZ, 0.003, [rug.width, 0.015, rug.depth], RUG_COLOURS[rug.faction]));
  }
  group.add(slab(14.9, 5.5, 0.003, [5.2, 0.015, 1.2], BRAND_TEAL)); // Showroom runner
  for (const piece of FURNITURE.filter((p) => p.podium)) {
    group.add(slab(piece.cell.col - 0.45, piece.cell.row - 0.45, 0, [0.9, 0.1, 0.9], "#ffffff", { roughness: 0.3 }));
  }
}

type SignStyle = { width: number; height: number; background: string; ink: string; px: number; glow?: boolean };

function sign(lines: readonly string[], style: SignStyle): Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = Math.round((512 * style.height) / style.width);
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = style.background;
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.strokeStyle = style.ink;
    g.lineWidth = 8;
    g.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    g.fillStyle = style.ink;
    g.font = `bold ${style.px}px system-ui`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    lines.forEach((line, i) => {
      g.fillText(line, canvas.width / 2, canvas.height / 2 + (i - (lines.length - 1) / 2) * style.px * 1.15);
    });
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const glow = style.glow ? { emissive: "#ffffff", emissiveMap: texture, emissiveIntensity: 0.9 } : {};
  const mesh = new Mesh(
    new PlaneGeometry(style.width, style.height),
    new MeshStandardMaterial({ map: texture, roughness: 1, ...glow }),
  );
  mesh.raycast = () => {};
  return mesh;
}

function signs(group: Group): void {
  const onBackWall = (mesh: Mesh, x: number, y: number, scale = 1) => {
    mesh.position.set(x, y, -0.49);
    mesh.scale.setScalar(scale);
    group.add(mesh);
  };
  const s = officeSigns;
  onBackWall(
    sign(s.launchTeam, { width: 1.5, height: 0.9, background: BRAND_TEAL, ink: "#ffffff", px: 90 }),
    4.5,
    0.95,
  );
  onBackWall(
    sign(s.weLoveFeedback, { width: 1.3, height: 0.8, background: "#f3e6a5", ink: "#7a5b00", px: 70 }),
    1.2,
    0.95,
  );
  const notice = { width: 1.6, height: 1.0, background: "#fff7d6", ink: "#7a1f1f", px: 60 };
  onBackWall(sign(s.inWriting, notice), 11, 1.05, 0.8);
  const smart = { width: 1.8, height: 0.9, background: "#10202a", ink: "#7ef0ff", px: 100, glow: true };
  const smartSign = sign(s.smartRange, smart);
  smartSign.name = "smartRangeSign";
  onBackWall(smartSign, 17.5, 0.95);
  const listens = { width: 1.5, height: 0.7, background: "#f4efe6", ink: "#10202a", px: 40 };
  onBackWall(sign(s.itListens, listens), 15.5, 0.95, 0.9);
  const labels = [s.complaints, s.safety, s.showroom];
  ROOMS.forEach((room, i) => {
    const door = DOORWAYS.find((d) => d.row === CORRIDOR_WALL_ROW && d.col >= room.firstCol && d.col <= room.lastCol);
    if (!door) return;
    const label = sign(labels[i], { width: 1.4, height: 0.3, background: LOOK[room.id].wall, ink: "#222", px: 46 });
    label.scale.setScalar(0.8);
    label.position.set(door.col, 0.58, CORRIDOR_WALL_ROW + 0.12);
    group.add(label);
  });
}

/** The Smart toilet's red LED. It is off in the Mundane tier. */
function smartToiletLed(): Mesh {
  const led = new Mesh(
    new SphereGeometry(0.035, 8, 6),
    new MeshStandardMaterial({ color: "#ff2020", emissive: "#ff1010", emissiveIntensity: 0 }),
  );
  led.name = "smartToiletLed";
  // On the front of the cistern, which stands at the back of the 0.39-deep toilet.
  led.position.set(SMART_TOILET.col, PODIUM_HEIGHT + 0.4, SMART_TOILET.row - 0.06);
  return led;
}

export function buildRooms(): Group {
  const group = new Group();
  group.name = "rooms";
  floorTiles(group);
  walls(group);
  rugsAndPodiums(group);
  signs(group);
  group.add(smartToiletLed());
  return group;
}

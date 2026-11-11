// The world outside the office: a city grid, a car park, street lamps, a park, a Biooro billboard and traffic.
// Nothing out here is interactive. The tier look fades the far edges into fog, and the cars thin out as the tier worsens.
// Kit sizes: the office floor tile is 1 unit, and its walls stand 1.3 tall. See outsideLayout.ts for where things go.
import { Group, type Material, Mesh, type Object3D, PlaneGeometry } from "three";
import type { Tier } from "../rules/index";
import { createBillboard } from "./billboard";
import { buildCity } from "./cityGrid";
import { firstMaterial } from "./instancing";
import { kitMaterial } from "./kit";
import type { ModelLibrary } from "./models";
import { createTraffic } from "./outsideCars";
import { EAST, LOT_NORTH, LOT_SOUTH, PARKING_ROWS, ROAD_SCALE, SOUTH } from "./outsideLayout";
import type { TierSource } from "./tierLook";

const GROUND_HALF_SIZE = 110;
/** The ground sits just under the office floor and the road tiles, so they never flicker. */
const GROUND_Y = -0.03;

export type Surroundings = {
  group: Group;
  update(seconds: number): void;
  dispose(): void;
};

export function createSurroundings(models: ModelLibrary, store: TierSource, startTier: Tier): Surroundings {
  const group = new Group();
  group.name = "surroundings";
  const road = firstMaterial(models.outside("roads", "road-straight"));
  group.add(ground(firstMaterial(models.outside("city", "building-a"))), buildCity(models));
  carPark(road, group);
  for (let x = 2; x < EAST; x += 6) {
    const lamp = models.outside("roads", "light-curved");
    lamp.position.set(x, 0, LOT_SOUTH - 0.15);
    lamp.scale.setScalar(ROAD_SCALE);
    group.add(lamp);
  }
  const dumpster = models.outside("roads", "dumpster");
  dumpster.position.set(EAST + 1.2, 0, 2.5);
  dumpster.rotation.y = -Math.PI / 2;
  dumpster.scale.setScalar(ROAD_SCALE);
  group.add(dumpster);
  noClicks(group);

  const billboard = createBillboard(startTier);
  billboard.root.position.set(EAST + 1.6, 0, LOT_SOUTH - 1.4);
  billboard.root.rotation.y = Math.PI / 4;
  group.add(billboard.root);

  const traffic = createTraffic(models, startTier);
  group.add(traffic.root);
  // The sun's shadow map covers only the office. Outside it, nothing could show a shadow, so a shadowed
  // patch around the office would end in a hard square edge. Outside things cast shadows but never receive them.
  group.traverse((o) => {
    o.receiveShadow = false;
  });

  const unsubscribe = store.on("tierChanged", (event) => {
    billboard.setTier(event.tier);
    traffic.setTier(event.tier);
  });
  return { group, update: traffic.update, dispose: unsubscribe };
}

/** A flat rectangle on the ground, painted with one swatch of the road palette. */
function swatch(material: Material, uv: readonly [number, number], width: number, depth: number): Mesh {
  const geometry = new PlaneGeometry(width, depth);
  const uvs = geometry.attributes.uv;
  for (let i = 0; i < uvs.count; i++) uvs.setXY(i, uv[0], uv[1]);
  geometry.rotateX(-Math.PI / 2);
  const mesh = new Mesh(geometry, material);
  return mesh;
}

/** Swatch UVs: sandy paving in the City Kit buildings map, and asphalt in the roads map. */
const PAVING_UV = [0.94, 0.53] as const;
const ASPHALT_UV = [0.344, 0.875] as const;

/** Sandy paving everywhere. Roads, blocks and the office floor sit on top of it. */
function ground(building: Material): Mesh {
  const mesh = swatch(building, PAVING_UV, GROUND_HALF_SIZE * 2, GROUND_HALF_SIZE * 2);
  mesh.position.set(EAST / 2, GROUND_Y, SOUTH / 2);
  mesh.name = "ground";
  return mesh;
}

/** Plain asphalt in front of the office, with painted bays. */
function carPark(road: Material, group: Group): void {
  const width = EAST + ROAD_SCALE + 0.5;
  const lot = swatch(road, ASPHALT_UV, width, LOT_SOUTH - LOT_NORTH);
  lot.position.set(-0.5 + width / 2, 0.015, (LOT_NORTH + LOT_SOUTH) / 2);
  group.add(lot);

  const paint = kitMaterial("carpetWhite");
  for (const row of PARKING_ROWS)
    for (let x = row.firstLine; x <= row.lastLine; x += row.bayWidth) {
      const line = new Mesh(new PlaneGeometry(0.06, row.bayDepth), paint);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.025, row.z);
      group.add(line);
    }
}

/** Clicks pass through everything outside. Only the office floor and its people take them. */
function noClicks(root: Object3D): void {
  root.traverse((o) => {
    o.raycast = () => {};
  });
}

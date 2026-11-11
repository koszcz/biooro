// The cars outside: parked cars in the car park and traffic on the roads around the office.
// As the tier worsens, fewer cars stay parked and fewer drive by. In Wrong, one car is left and the road is empty.
// Parked cars appear and vanish when the tier changes. Moving cars only leave or join at the far ends of the road.
import { Group, type Object3D } from "three";
import type { Tier } from "../rules/index";
import type { ModelLibrary, OutsideModel } from "./models";
import { BLOCK, bayCentre, FRONT_ROAD_Z, GRID_X_RANGE, GRID_Z_RANGE, SIDE_ROAD_X } from "./outsideLayout";

/** Kit cars are about 2.5 long and 1.3 tall. This makes them about half a wall high, beside 1.3-tall office walls. */
export const CAR_SCALE = 0.5;
/** Cars drive this many units a second. */
const SPEED = 4;
/** Half the gap between the two lanes' centre lines. */
const LANE_OFFSET = 0.75;

const TIER_RANK: Record<Tier, number> = { mundane: 0, odd: 1, wrong: 2 };

/** A parked car stays until the tier passes `lastTier`. */
type ParkedCar = { model: OutsideModel<"cars">; row: number; bay: number; lastTier: Tier };

const PARKED: readonly ParkedCar[] = [
  { model: "sedan", row: 0, bay: 2, lastTier: "wrong" },
  { model: "suv", row: 0, bay: 4, lastTier: "odd" },
  { model: "hatchback-sports", row: 0, bay: 5, lastTier: "mundane" },
  { model: "van", row: 0, bay: 9, lastTier: "odd" },
  { model: "taxi", row: 0, bay: 12, lastTier: "mundane" },
  { model: "sedan", row: 1, bay: 1, lastTier: "mundane" },
  { model: "delivery", row: 1, bay: 3, lastTier: "odd" },
  { model: "suv", row: 1, bay: 7, lastTier: "mundane" },
  { model: "sedan", row: 1, bay: 8, lastTier: "odd" },
  { model: "van", row: 1, bay: 11, lastTier: "mundane" },
];

/** A road a car drives along: east-west at z = `line`, or north-south at x = `line`. */
type Road = { axis: "x" | "z"; line: number };
const FRONT: Road = { axis: "x", line: FRONT_ROAD_Z };
const SIDE: Road = { axis: "z", line: SIDE_ROAD_X };
const BACK: Road = { axis: "x", line: FRONT_ROAD_Z - BLOCK };
const WEST: Road = { axis: "z", line: SIDE_ROAD_X - BLOCK };

/**
 * The moving cars. `way` 1 drives toward +x or +z, and -1 the other way. Cars keep to the right.
 * `start` is how far along the road the car begins, as a share. `lastTier` works as for parked cars.
 */
const MOVING: readonly { model: OutsideModel<"cars">; road: Road; way: 1 | -1; start: number; lastTier: Tier }[] = [
  { model: "sedan", road: FRONT, way: 1, start: 0, lastTier: "odd" },
  { model: "van", road: FRONT, way: -1, start: 0.3, lastTier: "mundane" },
  { model: "taxi", road: FRONT, way: 1, start: 0.55, lastTier: "mundane" },
  { model: "suv", road: FRONT, way: -1, start: 0.8, lastTier: "odd" },
  { model: "delivery", road: SIDE, way: 1, start: 0.2, lastTier: "mundane" },
  { model: "hatchback-sports", road: SIDE, way: -1, start: 0.65, lastTier: "mundane" },
  { model: "taxi", road: BACK, way: -1, start: 0.4, lastTier: "mundane" },
  { model: "sedan", road: BACK, way: 1, start: 0.9, lastTier: "mundane" },
  { model: "van", road: WEST, way: 1, start: 0.5, lastTier: "mundane" },
];

const RANGE = { x: GRID_X_RANGE, z: GRID_Z_RANGE } as const;

export type Traffic = {
  root: Group;
  setTier(tier: Tier): void;
  update(seconds: number): void;
};

export function createTraffic(models: ModelLibrary, startTier: Tier): Traffic {
  const root = new Group();
  root.name = "cars";
  let rank = TIER_RANK[startTier];
  const stays = (lastTier: Tier) => rank <= TIER_RANK[lastTier];
  const car = (name: OutsideModel<"cars">) => {
    const model = models.outside("cars", name);
    model.scale.setScalar(CAR_SCALE);
    model.traverse((o: Object3D) => {
      o.raycast = () => {};
    });
    root.add(model);
    return model;
  };

  const parked = PARKED.map((spec) => {
    const model = car(spec.model);
    const { x, z } = bayCentre(spec.row, spec.bay);
    model.position.set(x, 0, z);
    // Kit cars face +z. Row 0 noses south toward the aisle, row 1 noses north.
    model.rotation.y = spec.row === 0 ? 0 : Math.PI;
    return { spec, model };
  });

  const moving = MOVING.map((spec) => {
    const model = car(spec.model);
    const [from, to] = RANGE[spec.road.axis];
    // Facing +z is a turn of 0. Facing +x is a quarter turn.
    const ahead = spec.road.axis === "x" ? Math.PI / 2 : 0;
    model.rotation.y = ahead + (spec.way === 1 ? 0 : Math.PI);
    // Keeping right: driving +x puts a car on the +z side, and driving +z puts it on the -x side.
    const side = spec.road.axis === "x" ? spec.way : -spec.way;
    model.position[spec.road.axis === "x" ? "z" : "x"] = spec.road.line + side * LANE_OFFSET;
    return { spec, model, from, length: to - from, along: spec.start * (to - from) };
  });

  const showParked = () => {
    for (const { spec, model } of parked) model.visible = stays(spec.lastTier);
  };
  showParked();
  for (const m of moving) m.model.visible = stays(m.spec.lastTier);

  return {
    root,
    setTier(tier) {
      rank = TIER_RANK[tier];
      showParked();
    },
    update(seconds) {
      for (const m of moving) {
        m.along += SPEED * seconds;
        if (m.along >= m.length) {
          m.along -= m.length;
          // Only here, far off in the fog, may a car leave the road or join it.
          m.model.visible = stays(m.spec.lastTier);
        }
        const { axis } = m.spec.road;
        m.model.position[axis] = m.spec.way === 1 ? m.from + m.along : m.from + m.length - m.along;
      }
    },
  };
}

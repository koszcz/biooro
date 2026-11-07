// The Intern: Kenney Mini Characters at native size, in an orange vest with a white stripe,
// with an orange ring underfoot and a bobbing arrow overhead. Cues follow prototype/office-look/src/art.ts.
import {
  type AnimationAction,
  AnimationMixer,
  BoxGeometry,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  RingGeometry,
} from "three";
import { type Cell, INTERN_START } from "../content";
import { type Character, INTERN_MODEL, type ModelLibrary } from "./models";
import { Walker } from "./walker";

export const INTERN_ORANGE = "#ff7a1a";
const STRIPE = "#ffffff";
/** Seated characters lift this much, so they sit tall at the desk. */
export const SEAT_LIFT = 0.13;
const ARROW_HEIGHT = 1.1;

export type Pose = "idle" | "walk" | "sit";

export type Intern = {
  root: Group;
  walker: Walker;
  setPose(pose: Pose, heading?: number): void;
  update(seconds: number, elapsed: number): void;
};

const ignoreClicks = (o: Object3D) => {
  o.raycast = () => {};
};

function addVest(character: Character): void {
  let torso: Object3D | undefined;
  character.model.traverse((o) => {
    if (o.name === "torso") torso = o;
  });
  if (!torso) return;
  // The torso bone sits at the hip, so offsets are in torso space.
  const vest = new Mesh(
    new BoxGeometry(0.3, 0.19, 0.32),
    new MeshStandardMaterial({ color: INTERN_ORANGE, flatShading: true, roughness: 0.8 }),
  );
  vest.position.set(0, 0.09, -0.02);
  const stripe = new Mesh(
    new BoxGeometry(0.31, 0.03, 0.33),
    new MeshStandardMaterial({ color: STRIPE, flatShading: true, roughness: 0.8 }),
  );
  stripe.position.set(0, 0.07, -0.02);
  for (const part of [vest, stripe]) {
    part.castShadow = true;
    torso.add(part);
  }
}

export function createIntern(models: ModelLibrary, start: Cell = INTERN_START): Intern {
  const character = models.character(INTERN_MODEL);
  addVest(character);
  const root = new Group();
  root.name = "intern";
  root.add(character.model);

  const ring = new Mesh(
    new RingGeometry(0.28, 0.38, 28),
    new MeshBasicMaterial({ color: INTERN_ORANGE, side: DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.025; // above the Faction rugs
  const arrow = new Mesh(new ConeGeometry(0.1, 0.2, 4), new MeshBasicMaterial({ color: INTERN_ORANGE }));
  arrow.rotation.x = Math.PI;
  arrow.position.y = ARROW_HEIGHT;
  root.add(ring, arrow);
  root.traverse(ignoreClicks);

  const mixer = new AnimationMixer(character.model);
  let current: AnimationAction | undefined;
  const play = (name: Pose) => {
    const clip = character.clips.find((c) => c.name === name);
    if (!clip) return;
    const next = mixer.clipAction(clip);
    if (next === current) return;
    next.reset().fadeIn(0.2).play();
    current?.fadeOut(0.2);
    current = next;
  };

  const walker = new Walker({ x: start.col, z: start.row });
  let pose: Pose = "idle";
  play(pose);

  return {
    root,
    walker,
    setPose(next, heading) {
      pose = next;
      if (heading !== undefined) walker.heading = heading;
      play(next);
    },
    update(seconds, elapsed) {
      walker.update(seconds);
      if (walker.walking && pose !== "walk") this.setPose("walk");
      root.position.set(walker.position.x, pose === "sit" ? SEAT_LIFT : 0, walker.position.z);
      root.rotation.y = walker.heading;
      arrow.position.y = ARROW_HEIGHT + Math.sin(elapsed * 4) * 0.05;
      mixer.update(seconds);
    },
  };
}

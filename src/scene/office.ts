// Builds the office scene, renders it into the page and wires click-to-walk, clicks on people and the mouse wheel zoom.
import {
  Clock,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  PCFSoftShadowMap,
  PointLight,
  RingGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { type CastId, COLLEAGUE_SPOTS, type Piece, SMART_TOILET } from "../content";
import type { Tier } from "../rules";
import { createIsoCamera, resizeCamera, zoomCamera } from "./camera";
import { createCast } from "./cast";
import { createFloor, FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";
import { buildFurniture } from "./furniture";
import { createHeadLocator, type HeadLocator } from "./heads";
import { createIntern, type Intern } from "./intern";
import type { ModelLibrary } from "./models";
import { addHitTargets, faceEachOther } from "./people";
import { createPointer, type LockEvents } from "./pointer";
import { buildRooms } from "./rooms";
import { cellAt, planWalk, type WalkGoal } from "./routes";
import { createTierLook, type TierSource } from "./tierLook";

function mapValues<K extends string, V, W>(record: Readonly<Record<K, V>>, map: (value: V) => W): Record<K, W> {
  return Object.fromEntries(Object.entries<V>(record).map(([key, value]) => [key, map(value)])) as Record<K, W>;
}

const TARGET_RING = "#ff2bd6";

// The tier look sets the colours and strengths of these lights.
function addLights(scene: Scene) {
  const hemisphere = new HemisphereLight();
  const sun = new DirectionalLight();
  sun.position.set(FLOOR_WIDTH * 0.9 - 0.5, 14, FLOOR_DEPTH * 1.3 - 0.5);
  sun.target.position.set((FLOOR_WIDTH - 1) / 2, 0, (FLOOR_DEPTH - 1) / 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 14, bottom: -14, far: 80 });
  // The Smart toilet LED's red glow, in front of the toilet.
  const ledGlow = new PointLight("#ff2a1a", 0, 3, 2);
  ledGlow.position.set(SMART_TOILET.col, 0.7, SMART_TOILET.row + 0.7);
  scene.add(hemisphere, sun, sun.target, ledGlow);
  return { hemisphere, sun, ledGlow };
}

function createTargetRing(): Mesh {
  const ring = new Mesh(new RingGeometry(0.25, 0.35, 24), new MeshBasicMaterial({ color: TARGET_RING }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.026; // above the Faction rugs
  ring.visible = false;
  ring.raycast = () => {};
  return ring;
}

const pieceOf = (hit: Object3D): Piece | undefined => {
  for (let o: Object3D | null = hit; o; o = o.parent) if (o.userData.piece) return o.userData.piece as Piece;
  return undefined;
};

/** Click-to-walk for the Intern. It remembers the chair the Intern sits on, so the Intern can stand up again. */
function createWalking(intern: Intern, ring: Mesh) {
  let seatedOn: Piece | undefined;
  return (goal: WalkGoal, onArrive?: () => void) => {
    const walk = planWalk(intern.walker.position, seatedOn, goal);
    if (!walk) {
      onArrive?.();
      return;
    }
    const chair = "chair" in goal ? goal.chair : undefined;
    seatedOn = undefined;
    ring.position.set(walk.target.x, ring.position.y, walk.target.z);
    ring.visible = true;
    intern.setPose("walk");
    intern.walker.walk(walk.route, () => {
      ring.visible = false;
      // A chair faces its desk, so the Intern sits the way it faces.
      if (chair) {
        seatedOn = chair;
        intern.setPose("sit", chair.turn ?? 0);
      } else intern.setPose("idle");
      onArrive?.();
    });
  };
}

/** The store events the office listens to. */
export type OfficeEvents = TierSource & LockEvents;

/** What the Conversation layer and the DOM overlays use from the office. */
export type Office = {
  /** Calls `listener` when the player clicks a person while input is unlocked. */
  onPersonClick(listener: (person: CastId) => void): void;
  /** Calls `listener` when the pointer moves onto a person, or off everyone with `undefined`. */
  onPersonHover(listener: (person: CastId | undefined) => void): void;
  /** Calls `listener` once a frame, after the office moves. */
  onFrame(listener: () => void): void;
  /** Where a person's head is on screen, in pixels from the top left of the office. */
  headAt: HeadLocator;
  walkBeside(person: CastId): Promise<void>;
  faceEachOther(person: CastId): () => void;
};

/** Starts the office. `store` sends `tierChanged`, and `startTier` is the tier when the office loads. */
export function startOfficeScene(
  container: HTMLElement,
  models: ModelLibrary,
  store: OfficeEvents,
  startTier: Tier,
): Office {
  const scene = new Scene();
  const floor = createFloor();
  const furniture = buildFurniture(models);
  const intern = createIntern(models);
  const cast = createCast(models);
  const people = Object.values(cast);
  const hitTargets = addHitTargets(cast);
  const ring = createTargetRing();
  const rooms = buildRooms();
  scene.add(floor, rooms, furniture.group, intern.root, ring, ...people.map((p) => p.root));
  const lights = addLights(scene);
  const led = rooms.getObjectByName("smartToiletLed") as Mesh;
  const tierLook = createTierLook({ scene, led, ...lights }, store, startTier);

  const centre = new Vector3((FLOOR_WIDTH - 1) / 2, 0, (FLOOR_DEPTH - 1) / 2);
  const camera = createIsoCamera(centre, container.clientWidth / container.clientHeight);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  container.append(renderer.domElement);

  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    resizeCamera(camera, container.clientWidth / container.clientHeight);
  });
  renderer.domElement.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomCamera(camera, event.deltaY);
    },
    { passive: false },
  );

  const walkTo = createWalking(intern, ring);
  const pointer = createPointer(renderer.domElement, camera, hitTargets, store);
  pointer.onFloorClick((ray) => {
    const hit = ray.intersectObjects([...furniture.chairs, floor], true)[0];
    if (!hit) return;
    const chair = pieceOf(hit.object);
    walkTo(chair?.seat ? { chair } : { cell: cellAt({ x: hit.point.x, z: hit.point.z }) });
  });

  const frameListeners: (() => void)[] = [];
  const clock = new Clock();
  renderer.setAnimationLoop(() => {
    const seconds = Math.min(clock.getDelta(), 0.05);
    intern.update(seconds, clock.elapsedTime);
    for (const person of people) person.update(seconds, clock.elapsedTime);
    tierLook.update(seconds, clock.elapsedTime);
    renderer.render(scene, camera);
    for (const listener of frameListeners) listener();
  });
  Object.assign(window, { __office: { scene, camera, intern, cast, walkTo } });
  const roots = { intern: intern.root, ...mapValues(cast, (person) => person.root) };
  return {
    headAt: createHeadLocator(roots, camera, renderer.domElement),
    onPersonClick: pointer.onPersonClick,
    onPersonHover: pointer.onPersonHover,
    onFrame: (listener) => frameListeners.push(listener),
    walkBeside: (person) => new Promise((resolve) => walkTo({ beside: COLLEAGUE_SPOTS[person].cell }, resolve)),
    faceEachOther: (person) => faceEachOther(person, cast, intern),
  };
}

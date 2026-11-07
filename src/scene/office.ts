// Builds the office scene, renders it into the page and wires click-to-walk and the mouse wheel zoom.
import {
  Clock,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  type Object3D,
  PCFSoftShadowMap,
  Raycaster,
  RingGeometry,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Piece } from "../content";
import { createIsoCamera, resizeCamera, zoomCamera } from "./camera";
import { createFloor, FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";
import { buildFurniture } from "./furniture";
import { createIntern, type Intern } from "./intern";
import type { ModelLibrary } from "./models";
import { buildRooms } from "./rooms";
import { cellAt, planWalk, type WalkGoal } from "./routes";

// The Mundane look from the art direction prototype. The tier ticket changes it.
const BACKGROUND = "#2b3038";
const TARGET_RING = "#ff2bd6";

function addLights(scene: Scene): void {
  scene.add(new HemisphereLight("#fff4e0", "#8a8478", 1.5));
  const sun = new DirectionalLight("#fff6e6", 2);
  sun.position.set(FLOOR_WIDTH * 0.9 - 0.5, 14, FLOOR_DEPTH * 1.3 - 0.5);
  sun.target.position.set((FLOOR_WIDTH - 1) / 2, 0, (FLOOR_DEPTH - 1) / 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 14, bottom: -14, far: 80 });
  scene.add(sun, sun.target);
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
  return (goal: WalkGoal) => {
    const walk = planWalk(intern.walker.position, seatedOn, goal);
    if (!walk) return;
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
    });
  };
}

export function startOfficeScene(container: HTMLElement, models: ModelLibrary): void {
  const scene = new Scene();
  scene.background = new Color(BACKGROUND);
  const floor = createFloor();
  const furniture = buildFurniture(models);
  const intern = createIntern(models);
  const ring = createTargetRing();
  scene.add(floor, buildRooms(), furniture.group, intern.root, ring);
  addLights(scene);

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
  const ray = new Raycaster();
  const pointer = new Vector2();
  renderer.domElement.addEventListener("pointerdown", (event) => {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects([...furniture.chairs, floor], true)[0];
    if (!hit) return;
    const chair = pieceOf(hit.object);
    walkTo(chair?.seat ? { chair } : { cell: cellAt({ x: hit.point.x, z: hit.point.z }) });
  });

  const clock = new Clock();
  renderer.setAnimationLoop(() => {
    const seconds = Math.min(clock.getDelta(), 0.05);
    intern.update(seconds, clock.elapsedTime);
    renderer.render(scene, camera);
  });
  Object.assign(window, { __office: { scene, camera, intern, walkTo } });
}

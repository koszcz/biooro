// What the Conversation layer needs from the office: clicks and hovers on people, where heads sit
// on screen, the walk beside a person, and the two turning to face each other.
import { type Camera, CylinderGeometry, Mesh, MeshBasicMaterial, type Object3D, type Raycaster, Vector3 } from "three";
import type { CastId } from "../content";
import type { Cast } from "./cast";
import type { Intern } from "./intern";

/** Anyone a bubble can sit over. */
export type Who = CastId | "intern";

/** Head height above the floor, before a Boss's extra scale. */
const HEAD_HEIGHT = 0.95;

/** Adds an invisible, clickable column to each cast member. Their models ignore clicks. */
export function addHitTargets(cast: Cast): Object3D[] {
  const material = new MeshBasicMaterial({ visible: false });
  return Object.values(cast).map((member) => {
    const target = new Mesh(new CylinderGeometry(0.3, 0.3, 1.1, 8), material);
    target.position.y = 0.55;
    target.userData.person = member.id;
    member.root.add(target);
    return target;
  });
}

/** The cast member under the ray, if any. */
export function personUnder(ray: Raycaster, targets: Object3D[]): CastId | undefined {
  const hit = ray.intersectObjects(targets, false)[0];
  return hit?.object.userData.person as CastId | undefined;
}

/** Where a person's head is on screen, in CSS pixels from the top left of `size`. */
export function headOnScreen(
  who: Who,
  cast: Cast,
  intern: Intern,
  camera: Camera,
  size: { width: number; height: number },
): { x: number; y: number } {
  const root = who === "intern" ? intern.root : cast[who].root;
  const point = new Vector3();
  root.getWorldPosition(point);
  point.y += HEAD_HEIGHT * root.scale.y;
  point.project(camera);
  return { x: ((point.x + 1) / 2) * size.width, y: ((1 - point.y) / 2) * size.height };
}

/** Turns the Intern and the person to face each other. Returns a function that turns the person back. */
export function faceEachOther(person: CastId, cast: Cast, intern: Intern): () => void {
  const member = cast[person];
  const me = intern.walker.position;
  const them = member.root.position;
  intern.walker.heading = Math.atan2(them.x - me.x, them.z - me.z);
  member.faceToward(me);
  return () => member.faceHome();
}

// What the Conversation layer needs from the office: clickable people, and the two turning to face each other.
import { CylinderGeometry, Mesh, MeshBasicMaterial, type Object3D, type Raycaster } from "three";
import type { CastId } from "../content";
import type { Cast } from "./cast";
import type { Intern } from "./intern";

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

/** Turns the Intern and the person to face each other. Returns a function that turns the person back. */
export function faceEachOther(person: CastId, cast: Cast, intern: Intern): () => void {
  const member = cast[person];
  const me = intern.walker.position;
  const them = member.root.position;
  intern.walker.heading = Math.atan2(them.x - me.x, them.z - me.z);
  member.faceToward(me);
  return () => member.faceHome();
}

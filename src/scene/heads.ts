// Screen positions above each person's head, so DOM overlays such as Task bubbles can follow them.
import { type Camera, type Object3D, Vector3 } from "three";
import type { CastId } from "../content/index";

/** Anyone a Task bubble can float over. */
export type HeadOwner = CastId | "intern";

export type ScreenPoint = { x: number; y: number };

/** Returns a point just above the person's head, in pixels from the top left of `canvas`. */
export type HeadLocator = (owner: HeadOwner) => ScreenPoint;

/** The height above the floor of a Kenney mini character's head top, before any scale. */
const HEAD_TOP = 0.95;

export function createHeadLocator(
  roots: Record<HeadOwner, Object3D>,
  camera: Camera,
  canvas: HTMLCanvasElement,
): HeadLocator {
  const point = new Vector3();
  return (owner) => {
    const root = roots[owner];
    point.copy(root.position);
    point.y += HEAD_TOP * root.scale.y;
    point.project(camera);
    return {
      x: ((point.x + 1) / 2) * canvas.clientWidth,
      y: ((1 - point.y) / 2) * canvas.clientHeight,
    };
  };
}

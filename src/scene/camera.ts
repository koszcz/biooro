// The fixed isometric camera. The player can zoom it but never rotate it.
import { MathUtils, OrthographicCamera, Vector3 } from "three";
import { FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";

export const ISO_ELEVATION_DEG = 35.264;
export const ISO_AZIMUTH_DEG = 45;
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;

const DISTANCE = 50;
const MARGIN = 1.1;
const WHEEL_SPEED = 0.001;

// How far the floor reaches from its centre on screen, in world units, at zoom 1.
const FLOOR_HALF_SPAN = (FLOOR_WIDTH + FLOOR_DEPTH) / (2 * Math.SQRT2);
const VIEW_HALF_WIDTH = FLOOR_HALF_SPAN * MARGIN;
const VIEW_HALF_HEIGHT = FLOOR_HALF_SPAN * Math.sin(MathUtils.degToRad(ISO_ELEVATION_DEG)) * MARGIN;

export function createIsoCamera(target: Vector3, aspect: number): OrthographicCamera {
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, DISTANCE * 2);
  const elevation = MathUtils.degToRad(ISO_ELEVATION_DEG);
  const azimuth = MathUtils.degToRad(ISO_AZIMUTH_DEG);
  const offset = new Vector3(
    Math.cos(elevation) * Math.sin(azimuth),
    Math.sin(elevation),
    Math.cos(elevation) * Math.cos(azimuth),
  ).multiplyScalar(DISTANCE);
  camera.position.copy(target).add(offset);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  resizeCamera(camera, aspect);
  return camera;
}

// Fits the default framing to a new window shape, keeping the whole floor in view.
export function resizeCamera(camera: OrthographicCamera, aspect: number): void {
  const halfHeight = Math.max(VIEW_HALF_HEIGHT, VIEW_HALF_WIDTH / aspect);
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.left = -halfHeight * aspect;
  camera.right = halfHeight * aspect;
  camera.updateProjectionMatrix();
}

// Applies one mouse wheel step. A negative deltaY (wheel up) zooms in.
export function zoomCamera(camera: OrthographicCamera, deltaY: number): void {
  camera.zoom = MathUtils.clamp(camera.zoom * Math.exp(-deltaY * WHEEL_SPEED), MIN_ZOOM, MAX_ZOOM);
  camera.updateProjectionMatrix();
}

// The fixed isometric camera. The player can zoom and pan it but never rotate it.
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

/** A point on the screen in normalised device coordinates: -1 to 1, with +y up. */
export type ScreenSpot = { x: number; y: number };

const SCREEN_CENTRE: ScreenSpot = { x: 0, y: 0 };

/**
 * Applies one mouse wheel step. A negative deltaY (wheel up) zooms in.
 * The floor point under `anchor` stays under it, so the player zooms toward the cursor.
 */
export function zoomCamera(camera: OrthographicCamera, deltaY: number, anchor: ScreenSpot = SCREEN_CENTRE): void {
  const before = screenToPlane(camera, anchor);
  camera.zoom = MathUtils.clamp(camera.zoom * Math.exp(-deltaY * WHEEL_SPEED), MIN_ZOOM, MAX_ZOOM);
  camera.updateProjectionMatrix();
  const after = screenToPlane(camera, anchor);
  moveCamera(camera, before.sub(after));
}

/** Drags the view by `delta`, in normalised device coordinates, so the floor follows the cursor. */
export function panCamera(camera: OrthographicCamera, delta: ScreenSpot): void {
  moveCamera(camera, screenToPlane(camera, delta).negate());
}

// The offset from the view centre to `spot`, in world units, in the plane the camera faces.
function screenToPlane(camera: OrthographicCamera, spot: ScreenSpot): Vector3 {
  const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const halfWidth = (camera.right - camera.left) / 2 / camera.zoom;
  const halfHeight = (camera.top - camera.bottom) / 2 / camera.zoom;
  return right.multiplyScalar(spot.x * halfWidth).addScaledVector(up, spot.y * halfHeight);
}

// Moves the camera, then keeps the floor point at the view centre on the floor.
// The player can never lose the office off screen.
function moveCamera(camera: OrthographicCamera, offset: Vector3): void {
  const direction = camera.getWorldDirection(new Vector3());
  const focus = floorPointAhead(camera.position.clone().add(offset), direction);
  focus.x = MathUtils.clamp(focus.x, -0.5, FLOOR_WIDTH - 0.5);
  focus.z = MathUtils.clamp(focus.z, -0.5, FLOOR_DEPTH - 0.5);
  camera.position.copy(focus).addScaledVector(direction, -DISTANCE);
  camera.updateMatrixWorld();
}

/** The floor point at the centre of the view. */
export function cameraFocus(camera: OrthographicCamera): Vector3 {
  return floorPointAhead(camera.position.clone(), camera.getWorldDirection(new Vector3()));
}

// Where a ray from `position` along `direction` meets the floor (y = 0).
function floorPointAhead(position: Vector3, direction: Vector3): Vector3 {
  return position.addScaledVector(direction, -position.y / direction.y);
}

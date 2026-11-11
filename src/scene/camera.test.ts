import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { cameraFocus, createIsoCamera, MAX_ZOOM, MIN_ZOOM, panCamera, zoomCamera } from "./camera";
import { FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";

const floorCentre = new Vector3((FLOOR_WIDTH - 1) / 2, 0, (FLOOR_DEPTH - 1) / 2);

describe("createIsoCamera", () => {
  it("looks down at the true isometric angle: 35.264° down, 45° around", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    const direction = camera.getWorldDirection(new Vector3());
    // The true isometric view looks along the cube diagonal (-1, -1, -1).
    const diagonal = new Vector3(-1, -1, -1).normalize();
    expect(direction.distanceTo(diagonal)).toBeLessThan(1e-4);
  });

  it("frames the whole floor at the default zoom", () => {
    for (const aspect of [16 / 9, 4 / 3, 1, 9 / 16]) {
      const camera = createIsoCamera(floorCentre, aspect);
      const corners = [
        [-0.5, -0.5],
        [FLOOR_WIDTH - 0.5, -0.5],
        [-0.5, FLOOR_DEPTH - 0.5],
        [FLOOR_WIDTH - 0.5, FLOOR_DEPTH - 0.5],
      ];
      for (const [x, z] of corners) {
        const onScreen = new Vector3(x, 0, z).project(camera);
        expect(Math.abs(onScreen.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(onScreen.y)).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("zoomCamera", () => {
  it("zooms in on wheel up and out on wheel down", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    zoomCamera(camera, -100);
    expect(camera.zoom).toBeGreaterThan(1);
    zoomCamera(camera, 100);
    zoomCamera(camera, 100);
    expect(camera.zoom).toBeLessThan(1);
  });

  it("stays between half and three times the default framing", () => {
    expect(MIN_ZOOM).toBe(0.5);
    expect(MAX_ZOOM).toBe(3);
    const camera = createIsoCamera(floorCentre, 16 / 9);
    for (let i = 0; i < 50; i++) zoomCamera(camera, -100);
    expect(camera.zoom).toBe(3);
    for (let i = 0; i < 50; i++) zoomCamera(camera, 100);
    expect(camera.zoom).toBe(0.5);
  });
});

describe("zoomCamera toward the cursor", () => {
  it("keeps the floor point under the cursor in place", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    const cursor = { x: 0.6, y: -0.3 };
    const underCursor = floorPointAt(camera, cursor);
    zoomCamera(camera, -300, cursor);
    expect(camera.zoom).toBeGreaterThan(1);
    const onScreen = underCursor.clone().project(camera);
    expect(onScreen.x).toBeCloseTo(cursor.x, 5);
    expect(onScreen.y).toBeCloseTo(cursor.y, 5);
  });

  it("zooms on the view centre when no cursor is given", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    zoomCamera(camera, -300);
    expect(cameraFocus(camera).distanceTo(floorCentre)).toBeLessThan(1e-6);
  });
});

describe("panCamera", () => {
  it("moves the floor with the drag", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    zoomCamera(camera, -500);
    const centreBefore = floorPointAt(camera, { x: 0, y: 0 });
    panCamera(camera, { x: 0.2, y: 0.1 });
    const onScreen = centreBefore.project(camera);
    expect(onScreen.x).toBeCloseTo(0.2, 5);
    expect(onScreen.y).toBeCloseTo(0.1, 5);
  });

  it("keeps the view centre on the floor", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    for (const delta of [
      { x: 50, y: 0 },
      { x: -50, y: 0 },
      { x: 0, y: 50 },
      { x: 0, y: -50 },
    ]) {
      panCamera(camera, delta);
      const focus = cameraFocus(camera);
      expect(focus.x).toBeGreaterThanOrEqual(-0.5 - 1e-9);
      expect(focus.x).toBeLessThanOrEqual(FLOOR_WIDTH - 0.5 + 1e-9);
      expect(focus.z).toBeGreaterThanOrEqual(-0.5 - 1e-9);
      expect(focus.z).toBeLessThanOrEqual(FLOOR_DEPTH - 0.5 + 1e-9);
    }
  });

  it("keeps the isometric angle", () => {
    const camera = createIsoCamera(floorCentre, 16 / 9);
    panCamera(camera, { x: 0.4, y: -0.7 });
    const direction = camera.getWorldDirection(new Vector3());
    expect(direction.distanceTo(new Vector3(-1, -1, -1).normalize())).toBeLessThan(1e-4);
  });
});

// The floor point (y = 0) that shows at `spot`, in normalised device coordinates.
function floorPointAt(camera: ReturnType<typeof createIsoCamera>, spot: { x: number; y: number }): Vector3 {
  const near = new Vector3(spot.x, spot.y, -1).unproject(camera);
  const far = new Vector3(spot.x, spot.y, 1).unproject(camera);
  const direction = far.sub(near);
  return near.addScaledVector(direction, -near.y / direction.y);
}

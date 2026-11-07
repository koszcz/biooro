import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { createIsoCamera, MAX_ZOOM, MIN_ZOOM, zoomCamera } from "./camera";
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

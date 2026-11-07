import { Box3, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { createFloor } from "./floor";

describe("createFloor", () => {
  it("is one flat 21 by 11 floor with tile (0, 0) centred on the origin", () => {
    const box = new Box3().setFromObject(createFloor());
    expect(box.min.distanceTo(new Vector3(-0.5, 0, -0.5))).toBeLessThan(1e-9);
    expect(box.max.distanceTo(new Vector3(20.5, 0, 10.5))).toBeLessThan(1e-9);
  });
});

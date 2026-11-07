import { describe, expect, it } from "vitest";
import { WALK_SPEED, Walker } from "./walker";

describe("Walker", () => {
  it("walks 2.4 tiles per second, round the corners of its path", () => {
    expect(WALK_SPEED).toBe(2.4);
    const walker = new Walker({ x: 0, z: 0 });
    walker.walk([
      { x: 1, z: 0 },
      { x: 1, z: 1 },
      { x: 1, z: 2 },
      { x: 1, z: 3 },
    ]);
    for (let i = 0; i < 10; i++) walker.update(0.1);
    expect(walker.position.x).toBeCloseTo(1);
    expect(walker.position.z).toBeCloseTo(1.4);
    expect(walker.walking).toBe(true);
  });

  it("faces the way it walks", () => {
    const walker = new Walker({ x: 0, z: 0 });
    walker.walk([{ x: 0, z: 5 }]);
    walker.update(0.1);
    expect(walker.heading).toBeCloseTo(0);
    walker.walk([{ x: 5, z: walker.position.z }]);
    walker.update(0.1);
    expect(walker.heading).toBeCloseTo(Math.PI / 2);
  });

  it("stops on the last point and reports that it arrived once", () => {
    const walker = new Walker({ x: 0, z: 0 });
    const arrivals: number[] = [];
    walker.walk([{ x: 1, z: 1 }], () => arrivals.push(1));
    walker.update(10);
    walker.update(10);
    expect(walker.position).toEqual({ x: 1, z: 1 });
    expect(walker.walking).toBe(false);
    expect(arrivals).toEqual([1]);
  });

  it("drops the old arrival when a new walk starts", () => {
    const walker = new Walker({ x: 0, z: 0 });
    const arrivals: string[] = [];
    walker.walk([{ x: 3, z: 0 }], () => arrivals.push("old"));
    walker.update(0.1);
    walker.walk([{ x: 0, z: 0 }], () => arrivals.push("new"));
    walker.update(10);
    expect(arrivals).toEqual(["new"]);
  });
});

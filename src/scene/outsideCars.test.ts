import { Group } from "three";
import { describe, expect, it } from "vitest";
import type { ModelLibrary } from "./models";
import { createTraffic } from "./outsideCars";

const fakeModels = (): ModelLibrary => ({
  furniture: () => new Group(),
  character: () => ({ model: new Group(), clips: [] }),
  accessory: () => new Group(),
  outside: () => new Group(),
});

// The first 10 cars are parked. The rest drive on the front road.
const parkedShown = (root: Group) => root.children.slice(0, 10).filter((c) => c.visible).length;
const movingShown = (root: Group) => root.children.slice(10).filter((c) => c.visible).length;

describe("createTraffic", () => {
  it("parks fewer cars as the tier worsens, and leaves one in Wrong", () => {
    const traffic = createTraffic(fakeModels(), "mundane");
    expect(parkedShown(traffic.root)).toBe(10);
    traffic.setTier("odd");
    expect(parkedShown(traffic.root)).toBe(5);
    traffic.setTier("wrong");
    expect(parkedShown(traffic.root)).toBe(1);
  });

  it("takes moving cars off the road only once they reach its far end", () => {
    const traffic = createTraffic(fakeModels(), "mundane");
    traffic.setTier("wrong");
    expect(movingShown(traffic.root)).toBe(9);
    // One full pass of the road sends every car past its far end.
    for (let i = 0; i < 500; i++) traffic.update(0.1);
    expect(movingShown(traffic.root)).toBe(0);
  });

  it("starts with the cars the start tier allows", () => {
    expect(movingShown(createTraffic(fakeModels(), "odd").root)).toBe(2);
  });
});

import { type Color, DirectionalLight, HemisphereLight, Mesh, MeshStandardMaterial, PointLight, Scene } from "three";
import { describe, expect, it } from "vitest";
import type { Tier } from "../rules/index";
import { createTierLook, type TierSource } from "./tierLook";

// A stand-in for the store: it only emits `tierChanged`.
function fakeStore() {
  const listeners: ((event: { type: "tierChanged"; tier: Tier }) => void)[] = [];
  const source: TierSource = {
    on: (_type, listener) => {
      listeners.push(listener);
      return () => {};
    },
  };
  const emitTier = (tier: Tier) => {
    for (const l of listeners) l({ type: "tierChanged", tier });
  };
  return { source, emitTier };
}

function officeParts() {
  const scene = new Scene();
  const led = new Mesh(undefined, new MeshStandardMaterial({ emissive: "#ff1010" }));
  return {
    scene,
    hemisphere: new HemisphereLight(),
    sun: new DirectionalLight(),
    led,
    ledGlow: new PointLight(),
  };
}

const ledGlow = (parts: ReturnType<typeof officeParts>) =>
  (parts.led.material as MeshStandardMaterial).emissiveIntensity;
const background = (parts: ReturnType<typeof officeParts>) => `#${(parts.scene.background as Color).getHexString()}`;

/** Runs the look for a few seconds so any change settles. */
const settle = (look: { update(seconds: number, elapsed: number): void }, from = 0) => {
  for (let i = 1; i <= 200; i++) look.update(0.05, from + i * 0.05);
};

describe("createTierLook", () => {
  it("starts in the given tier's palette with the Smart toilet LED off in Mundane", () => {
    const parts = officeParts();
    const { source } = fakeStore();
    const look = createTierLook(parts, source, "mundane");
    look.update(0.016, 1);
    expect(background(parts)).toBe("#2b3038");
    expect(ledGlow(parts)).toBe(0);
    expect(parts.ledGlow.intensity).toBe(0);
  });

  it("switches to the greyer, sicklier Wrong palette when the store emits tierChanged", () => {
    const parts = officeParts();
    const { source, emitTier } = fakeStore();
    const look = createTierLook(parts, source, "mundane");
    const mundaneSky = parts.hemisphere.color.clone();
    emitTier("wrong");
    settle(look);
    expect(background(parts)).toBe("#1b2620");
    expect(parts.hemisphere.intensity).toBeLessThan(1.5);
    expect(parts.hemisphere.color.equals(mundaneSky)).toBe(false);
  });

  it("gives the LED a steady faint glow in Odd", () => {
    const parts = officeParts();
    const { source, emitTier } = fakeStore();
    const look = createTierLook(parts, source, "mundane");
    emitTier("odd");
    settle(look);
    const glow = ledGlow(parts);
    expect(glow).toBeGreaterThan(0);
    look.update(0.0001, 10.7);
    expect(ledGlow(parts)).toBeCloseTo(glow, 3);
  });

  it("pulses the LED red in Wrong, brighter than the Odd glow", () => {
    const parts = officeParts();
    const { source, emitTier } = fakeStore();
    const look = createTierLook(parts, source, "odd");
    settle(look);
    const oddGlow = ledGlow(parts);
    emitTier("wrong");
    settle(look);
    const glows = [10, 10.3, 10.6, 10.9].map((t) => {
      look.update(0.0001, t);
      return ledGlow(parts);
    });
    expect(Math.max(...glows) - Math.min(...glows)).toBeGreaterThan(0.2);
    expect(Math.min(...glows)).toBeGreaterThan(oddGlow);
  });

  it("keeps the room lights steady within a tier", () => {
    const parts = officeParts();
    const { source } = fakeStore();
    const look = createTierLook(parts, source, "wrong");
    settle(look);
    const levels = [20, 20.3, 20.6].map((t) => {
      look.update(0.0001, t);
      return [parts.hemisphere.intensity, parts.sun.intensity];
    });
    expect(levels[1]).toEqual(levels[0]);
    expect(levels[2]).toEqual(levels[0]);
  });
});

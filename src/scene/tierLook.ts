// The palette by tier, the outside fog and the Smart toilet LED. The store's `tierChanged` event switches them.
// Colours follow prototype/office-look/src/art.ts. Room lighting eases to the new tier and never flickers.
import {
  Color,
  type DirectionalLight,
  Fog,
  type HemisphereLight,
  type Mesh,
  type MeshStandardMaterial,
  type PointLight,
  type Scene,
} from "three";
import type { Tier } from "../rules/index";

type Palette = {
  sky: string;
  ground: string;
  skyIntensity: number;
  sun: string;
  sunIntensity: number;
  background: string;
  /** The LED's glow. 0 is off. */
  led: number;
  /** How far the LED's glow swings when it pulses. */
  pulse: number;
  /** Where the outside fog starts and ends, measured from the camera, which stands 50 away. The office reaches 59, so the fog starts past it. */
  fogNear: number;
  fogFar: number;
};

export const PALETTES: Readonly<Record<Tier, Palette>> = {
  // Bright, warm and boring.
  mundane: {
    sky: "#fff4e0",
    ground: "#8a8478",
    skyIntensity: 1.5,
    sun: "#fff6e6",
    sunIntensity: 2,
    background: "#2b3038",
    led: 0,
    pulse: 0,
    fogNear: 62,
    fogFar: 100,
  },
  // Slightly greyer and greener. The LED glows faintly.
  odd: {
    sky: "#eef3e2",
    ground: "#767c6c",
    skyIntensity: 1.35,
    sun: "#f2f4e2",
    sunIntensity: 1.85,
    background: "#262c28",
    led: 0.6,
    pulse: 0,
    fogNear: 61,
    fogFar: 90,
  },
  // Greyer, dimmer and sickly green. The LED pulses red.
  wrong: {
    sky: "#e0eed6",
    ground: "#5c665a",
    skyIntensity: 1.15,
    sun: "#e8f2d6",
    sunIntensity: 1.6,
    background: "#1b2620",
    led: 1.8,
    pulse: 0.8,
    fogNear: 60,
    fogFar: 78,
  },
};

/** How fast the look eases toward a new tier, as a share per second. */
const EASE = 2.5;
/** The LED's glow light, per unit of LED glow. */
const GLOW_LIGHT = 0.7;

export type TierSource = {
  on(type: "tierChanged", listener: (event: { type: "tierChanged"; tier: Tier }) => void): () => void;
};

export type TierLookParts = {
  scene: Scene;
  hemisphere: HemisphereLight;
  sun: DirectionalLight;
  led: Mesh;
  /** A small red light beside the LED, so its glow reaches the toilet. */
  ledGlow: PointLight;
};

export type TierLook = {
  update(seconds: number, elapsed: number): void;
  dispose(): void;
};

export function createTierLook(parts: TierLookParts, source: TierSource, startTier: Tier): TierLook {
  let target = PALETTES[startTier];
  const now = {
    sky: new Color(target.sky),
    ground: new Color(target.ground),
    sun: new Color(target.sun),
    background: new Color(target.background),
    skyIntensity: target.skyIntensity,
    sunIntensity: target.sunIntensity,
    led: target.led,
    pulse: target.pulse,
    fogNear: target.fogNear,
    fogFar: target.fogFar,
  };
  const unsubscribe = source.on("tierChanged", (event) => {
    target = PALETTES[event.tier];
  });
  const goal = { sky: new Color(), ground: new Color(), sun: new Color(), background: new Color() };
  parts.scene.background = now.background;

  return {
    update(seconds, elapsed) {
      const share = Math.min(1, seconds * EASE);
      for (const key of ["sky", "ground", "sun", "background"] as const)
        now[key].lerp(goal[key].set(target[key]), share);
      for (const key of ["skyIntensity", "sunIntensity", "led", "pulse", "fogNear", "fogFar"] as const)
        now[key] += (target[key] - now[key]) * share;

      const fog = parts.scene.fog;
      if (fog instanceof Fog) {
        fog.color.copy(now.background);
        fog.near = now.fogNear;
        fog.far = now.fogFar;
      }
      parts.hemisphere.color.copy(now.sky);
      parts.hemisphere.groundColor.copy(now.ground);
      parts.hemisphere.intensity = now.skyIntensity;
      parts.sun.color.copy(now.sun);
      parts.sun.intensity = now.sunIntensity;
      const glow = Math.max(0, now.led + now.pulse * Math.sin(elapsed * 2.2));
      (parts.led.material as MeshStandardMaterial).emissiveIntensity = glow;
      parts.ledGlow.intensity = glow * GLOW_LIGHT;
    },
    dispose: unsubscribe,
  };
}

// Which sound each store event plays, and how loud each music variant is.
import type { Tier } from "../rules/index";
import type { StoreEvent } from "../store/index";
import type { SoundId } from "./manifest";

export type MusicLevels = Readonly<Record<"clean" | "odd" | "wrong", number>>;

/** The one-shot sound for a store event, or nothing. */
export function cueFor(event: StoreEvent): SoundId | undefined {
  switch (event.type) {
    case "taskAssigned":
    case "falloutArrived":
      return "bubble";
    case "taskResolved":
      return `choice-${event.choice}`;
    case "pressureChanged":
      return event.to < event.from ? "pressure-drop" : undefined;
    case "fired":
      return "fired";
    case "dayEnded":
      return "day-end";
    default:
      return undefined;
  }
}

const VARIANT = { mundane: "clean", odd: "odd", wrong: "wrong" } as const;

/** Target volume for each music variant. A Firing scene cuts all of them. */
export function musicLevels(tier: Tier, silenced: boolean): MusicLevels {
  const levels = { clean: 0, odd: 0, wrong: 0 };
  if (!silenced) levels[VARIANT[tier]] = 1;
  return levels;
}

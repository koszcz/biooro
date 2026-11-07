// The text a Conversation shows beside its bubbles: hover labels, Pressure change labels and the reveal pace.
import type { CastId } from "../content/index";
import type { Availability } from "../dialogue/index";
import { HOVER_LABELS, PRESSURE_CHANGE_LABELS, SPEAKER_NAMES } from "../locales/index";
import type { Pressure } from "../rules/index";

/** Characters a second in the letter-by-letter reveal. */
export const REVEAL_SPEED = 45;
/** The goodwill gauges appear from Tuesday morning. */
const GOODWILL_DAY = 2;

export const hoverLabel = (person: CastId, availability: Availability): string =>
  HOVER_LABELS[availability](SPEAKER_NAMES[person]);

/** The float for a gauge change. Null when the gauge is hidden or nothing changed. */
export function pressureChangeLabel(pressure: Pressure, from: number, to: number, day: number): string | null {
  const goodwill = pressure === "launchTeam" || pressure === "paperTrail";
  if (to === from || (goodwill && day < GOODWILL_DAY)) return null;
  const amount = `${to > from ? "+" : "−"}${Math.abs(to - from)}`;
  return PRESSURE_CHANGE_LABELS[pressure](amount);
}

/** How many characters of a line show after `elapsedMs` of reveal. */
export const revealedLength = (elapsedMs: number, length: number): number =>
  Math.min(length, Math.floor((elapsedMs * REVEAL_SPEED) / 1000));

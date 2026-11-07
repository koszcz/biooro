// The text beside speech bubbles: hover labels, Pressure change labels, and the letter-by-letter reveal with its pace.
import type { CastId } from "../content/index";
import type { Availability, Speaker } from "../dialogue/index";
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

/** Called as a line is revealed: how many characters of `text` were shown before and now. */
export type RevealListener = (speaker: Speaker, text: string, from: number, to: number) => void;

/** One line's letter-by-letter reveal, as `createLineReveal` returns it. */
export interface LineReveal {
  /** The part of the line on screen now. */
  readonly shown: string;
  readonly done: boolean;
  /** Reveals as far as `elapsedMs` of reveal reaches. */
  at(elapsedMs: number): void;
  /** Shows the whole line at once. The skipped characters are not reported. */
  complete(): void;
}

/**
 * Tracks the reveal of `text`. `onShown` hears each stretch of newly revealed characters, from the old length
 * to the new one, so each speaker's blips can follow the text.
 */
export function createLineReveal(text: string, onShown?: (from: number, to: number) => void): LineReveal {
  let length = 0;
  return {
    get shown() {
      return text.slice(0, length);
    },
    get done() {
      return length >= text.length;
    },
    at(elapsedMs) {
      const next = revealedLength(elapsedMs, text.length);
      if (next <= length) return;
      onShown?.(length, next);
      length = next;
    },
    complete() {
      length = text.length;
    },
  };
}

/** A line being typed into the page, as `typeLine` returns it. */
export interface TypedLine {
  readonly done: boolean;
  /** Shows the whole line at once. */
  complete(): void;
}

/**
 * Reveals `text` into `target` frame by frame. `onShown` hears each newly revealed stretch.
 * `onDone` runs once the whole line shows, whether the reveal ran out or `complete()` cut it short.
 */
export function typeLine(
  target: HTMLElement,
  text: string,
  onShown?: (from: number, to: number) => void,
  onDone?: () => void,
): TypedLine {
  const reveal = createLineReveal(text, onShown);
  const started = performance.now();
  const draw = () => {
    target.textContent = reveal.shown;
    if (reveal.done) onDone?.();
  };
  const tick = () => {
    if (reveal.done) return;
    reveal.at(performance.now() - started);
    draw();
    if (!reveal.done) requestAnimationFrame(tick);
  };
  tick();
  return {
    get done() {
      return reveal.done;
    },
    complete() {
      if (reveal.done) return;
      reveal.complete();
      draw();
    },
  };
}

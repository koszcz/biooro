// Plays a list of steps one after another, driven by the frame clock. It has no Three.js, so tests can drive it.

/** A running step. It gets the seconds since the last frame and returns true when it is done. */
export type Tick = (seconds: number) => boolean;
/** Starts a step. An instant step returns nothing. */
export type Step = () => Tick | undefined;

export class Sequence {
  private index = 0;
  private current: Tick | undefined;

  constructor(private readonly steps: readonly Step[]) {}

  /** Moves the steps on by `seconds`. Returns true when every step is done. */
  update(seconds: number): boolean {
    let budget = seconds;
    for (;;) {
      if (!this.current) {
        if (this.index >= this.steps.length) return true;
        this.current = this.steps[this.index++]();
        if (!this.current) continue;
      }
      if (!this.current(budget)) return false;
      this.current = undefined;
      budget = 0;
    }
  }
}

/** A step that runs `action` at once. */
export const run =
  (action: () => void): Step =>
  () => {
    action();
    return undefined;
  };

/** A step that waits `seconds`. */
export const wait =
  (seconds: number): Step =>
  () => {
    let left = seconds;
    return (elapsed) => {
      left -= elapsed;
      return left <= 1e-9;
    };
  };

/** A step that starts something and waits until it calls `done`, such as a walk. */
export const until =
  (start: (done: () => void) => void): Step =>
  () => {
    let finished = false;
    start(() => {
      finished = true;
    });
    return () => finished;
  };

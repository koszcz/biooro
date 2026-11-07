// Breaks and going home: the Workday actions that are not Task choices.
import type { LockedReason } from "../content/index";
import { adjustPressures } from "./pressures";
import type { GameState, RuleResult } from "./state";

export const BREAK_HOURS = 1;
export const BREAK_SANITY = 2;

function assertWorkday(state: GameState): void {
  if (state.phase.kind !== "workday") throw new Error("This needs a Workday in progress.");
}

export function breakLockedReason(state: GameState): LockedReason | null {
  return BREAK_HOURS > state.hoursLeft ? "notEnoughHours" : null;
}

/** A Break spends 1 hour and raises Sanity by 2. It cannot cause a Firing. */
export function applyBreak(state: GameState): RuleResult {
  assertWorkday(state);
  const reason = breakLockedReason(state);
  if (reason !== null) throw new Error(`A Break is locked: ${reason}.`);
  const hoursLeft = state.hoursLeft - BREAK_HOURS;
  const pressures = adjustPressures({ ...state, hoursLeft }, { sanity: BREAK_SANITY });
  return { state: pressures.state, events: [{ type: "hoursChanged", hoursLeft }, ...pressures.events] };
}

/** Going home loses the leftover hours. The end-of-day steps run after this. */
export function goHome(state: GameState): RuleResult {
  assertWorkday(state);
  return { state: { ...state, hoursLeft: 0 }, events: [{ type: "hoursChanged", hoursLeft: 0 }] };
}

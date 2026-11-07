// Escalation tiers and the tierChanged event.
import type { GameState, RuleResult, Tier } from "./state";

export function tierOf(escalation: number): Tier {
  if (escalation >= 5) return "wrong";
  if (escalation >= 3) return "odd";
  return "mundane";
}

/** Adds Escalation and emits `tierChanged` the moment the tier changes. */
export function addEscalation(state: GameState, amount: number): RuleResult {
  if (amount === 0) return { state, events: [] };
  const escalation = state.escalation + amount;
  const tier = tierOf(escalation);
  const next = { ...state, escalation };
  return { state: next, events: tier === tierOf(state.escalation) ? [] : [{ type: "tierChanged", tier }] };
}

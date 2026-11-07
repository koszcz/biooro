// The rule functions behind Ink's write functions: adjust(), set_flag() and escalate().
import { addEscalation } from "./escalation";
import { adjustPressures } from "./pressures";
import { type GameState, PRESSURE_MIN, type Pressure, type RuleResult } from "./state";

/**
 * Changes one Pressure by `delta`, clamped from 0 to 10.
 * A drop never takes the Pressure below `floor`. A Colleague Conversation passes a floor of 1.
 */
export function adjustPressure(state: GameState, pressure: Pressure, delta: number, floor = PRESSURE_MIN): RuleResult {
  const from = state.pressures[pressure];
  const to = delta < 0 ? Math.max(from + delta, Math.min(from, floor)) : from + delta;
  return adjustPressures(state, { [pressure]: to - from });
}

/** Sets a story flag. Setting it again changes nothing. */
export function setFlag(state: GameState, name: string): RuleResult {
  if (state.flags.includes(name)) return { state, events: [] };
  return { state: { ...state, flags: [...state.flags, name] }, events: [] };
}

/** Adds 1 Escalation. */
export function escalate(state: GameState): RuleResult {
  return addEscalation(state, 1);
}

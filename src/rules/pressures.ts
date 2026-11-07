// Pressure changes, clamped from 0 to 10, and the Firing check.
import {
  type GameState,
  PRESSURE_MAX,
  PRESSURE_MIN,
  PRESSURES,
  type Pressure,
  type RetryKind,
  type RuleResult,
} from "./state";

export type PressureDeltas = Partial<Record<Pressure, number>>;

function clamp(value: number): number {
  return Math.max(PRESSURE_MIN, Math.min(PRESSURE_MAX, value));
}

/** Applies each delta in Firing priority order. Emits `pressureChanged` only for a value that moves. */
export function adjustPressures(state: GameState, deltas: PressureDeltas): RuleResult {
  const pressures = { ...state.pressures };
  const events: RuleResult["events"] = [];
  for (const pressure of PRESSURES) {
    const delta = deltas[pressure] ?? 0;
    const from = pressures[pressure];
    const to = clamp(from + delta);
    if (to === from) continue;
    pressures[pressure] = to;
    events.push({ type: "pressureChanged", pressure, from, to });
  }
  return { state: { ...state, pressures }, events };
}

/** The Pressure that picks the Firing scene: the first one at 0 in priority order. */
export function firingPressure(pressures: Record<Pressure, number>): Pressure | null {
  return PRESSURES.find((pressure) => pressures[pressure] <= PRESSURE_MIN) ?? null;
}

/** Fires the Intern if any Pressure is at 0. The `fired` event carries only the winning Pressure. */
export function checkFiring(state: GameState, retry: RetryKind): RuleResult {
  const pressure = firingPressure(state.pressures);
  if (pressure === null) return { state, events: [] };
  return {
    state: { ...state, phase: { kind: "fired", pressure, retry } },
    events: [{ type: "fired", pressure, retry }],
  };
}

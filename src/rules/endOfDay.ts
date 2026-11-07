// The end-of-day steps: ignored Fallout, rollover, the neutrality cost and one Firing check.
import type { Faction } from "../content/index";
import { addEscalation } from "./escalation";
import { adjustPressures, checkFiring, type PressureDeltas } from "./pressures";
import { FRIDAY, type GameEvent, type GameState, type RuleResult, type SurvivalVariant } from "./state";

export const IGNORED_FALLOUT_PERFORMANCE = 3;
export const ROLLOVER_PERFORMANCE = 1;

const FACTIONS: readonly Faction[] = ["launchTeam", "paperTrail"];
const NEUTRALITY_FROM_DAY = 2;

/** End-of-day steps 1 to 4. The game autosaves after this, and the next morning runs. */
export function endDay(state: GameState): RuleResult {
  if (state.phase.kind !== "workday") throw new Error("The end-of-day steps need a Workday in progress.");
  const events: GameEvent[] = [];
  const apply = (result: RuleResult): GameState => {
    events.push(...result.events);
    return result.state;
  };

  // Every open Fallout Task arrived today, because Fallout never rolls over.
  const ignored = state.openTasks.filter((task) => task.fallout).length;
  const rolledOver = state.openTasks.filter((task) => !task.fallout);
  let next: GameState = { ...state, hoursLeft: 0, openTasks: rolledOver };
  next = apply(adjustPressures(next, { performance: -IGNORED_FALLOUT_PERFORMANCE * ignored }));
  next = apply(addEscalation(next, ignored));
  next = apply(adjustPressures(next, { performance: -ROLLOVER_PERFORMANCE * rolledOver.length }));
  if (state.day >= NEUTRALITY_FROM_DAY) {
    const unhelped = FACTIONS.filter((faction) => !state.helpedToday.includes(faction));
    next = apply(adjustPressures(next, Object.fromEntries(unhelped.map((faction) => [faction, -1]))));
  }
  next = apply(checkFiring(next, "thisDay"));
  if (next.phase.kind !== "workday") return { state: next, events };
  // On Friday the audit scene plays before the day ends.
  if (state.day === FRIDAY) {
    events.push({ type: "auditStarted" });
    return { state: { ...next, phase: { kind: "audit" } }, events };
  }
  events.push({ type: "dayEnded", day: state.day });
  return { state: next, events };
}

export type AuditAnswer = "bury" | "escalate" | "deflect";

const AUDIT_EFFECTS: Record<AuditAnswer, PressureDeltas> = {
  bury: { launchTeam: 2 },
  escalate: { paperTrail: 2 },
  deflect: { sanity: -2 },
};

export function survivalVariant(pressures: GameState["pressures"]): SurvivalVariant {
  if (pressures.launchTeam === pressures.paperTrail) return "equal";
  return pressures.launchTeam > pressures.paperTrail ? "launchTeam" : "paperTrail";
}

/** Applies the Friday audit answer, runs the second Firing check, and ends the week if the Intern survives. */
export function answerAudit(state: GameState, answer: AuditAnswer): RuleResult {
  if (state.phase.kind !== "audit") throw new Error("An audit answer needs the Friday audit in progress.");
  const effect = adjustPressures(state, AUDIT_EFFECTS[answer]);
  const firing = checkFiring(effect.state, "thisDay");
  const events = [...effect.events, ...firing.events];
  if (firing.state.phase.kind === "fired") return { state: firing.state, events };
  const variant = survivalVariant(firing.state.pressures);
  events.push({ type: "dayEnded", day: state.day }, { type: "weekSurvived", variant });
  return { state: { ...firing.state, phase: { kind: "weekSurvived", variant } }, events };
}

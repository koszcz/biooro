// Pure state and rule functions, with no Three.js and no DOM.
export { tierOf } from "./escalation";
export { firingPressure } from "./pressures";
export {
  type ColleagueId,
  type GameEvent,
  type GameState,
  newGame,
  type OpenTask,
  type PendingFallout,
  type Phase,
  PRESSURE_MAX,
  PRESSURE_MIN,
  PRESSURE_START,
  PRESSURES,
  type Pressure,
  type RetryKind,
  type RuleResult,
  type TaskChoice,
  type Tier,
  WORKDAY_HOURS,
} from "./state";
export { applyTaskChoice, TASK_CHOICE_HOURS, TASK_CHOICES, taskChoiceLockedReason } from "./taskChoice";
export { applyBreak, BREAK_HOURS, BREAK_SANITY, breakLockedReason, goHome } from "./workday";

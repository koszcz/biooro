// Pure state and rule functions, with no Three.js and no DOM.
export { type AuditAnswer, answerAudit, endDay, survivalVariant } from "./endOfDay";
export { tierOf } from "./escalation";
export { FALLOUT_DELAY_DAYS, FALLOUT_DO_HOURS, queueFallout } from "./fallout";
export { startDay } from "./morning";
export { firingPressure } from "./pressures";
export {
  type ColleagueId,
  FRIDAY,
  FRIDAY_TASK_HOURS,
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
  type SurvivalVariant,
  type TaskChoice,
  type Tier,
  WORKDAY_HOURS,
} from "./state";
export {
  applyTaskChoice,
  TASK_CHOICE_HOURS,
  TASK_CHOICES,
  taskChoiceHours,
  taskChoiceLockedReason,
} from "./taskChoice";
export { applyBreak, BREAK_HOURS, BREAK_SANITY, breakLockedReason, goHome } from "./workday";

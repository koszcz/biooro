// The morning steps that start each day of the week.
import { STRANGE_TASK_BY_DAY, TASK_SLOTS, type Weekday } from "../content/index";
import { addEscalation, tierOf } from "./escalation";
import { deliverFallout } from "./fallout";
import { adjustPressures, checkFiring } from "./pressures";
import {
  FRIDAY,
  FRIDAY_TASK_HOURS,
  type GameEvent,
  type GameState,
  type OpenTask,
  type RuleResult,
  type Tier,
  WORKDAY_HOURS,
} from "./state";

const BASE_NEW_TASKS = 2;
const TUESDAY = 2;

/** The tier each day starts at in the spec's week table. A strange Task swaps in above it. */
const DAY_START_TIER: Record<Weekday, Tier> = { 1: "mundane", 2: "mundane", 3: "odd", 4: "odd", 5: "wrong" };
const TIER_ORDER: readonly Tier[] = ["mundane", "odd", "wrong"];

/** Morning step 7: 2 new Tasks plus 1 for every 2 finished yesterday, capped at the day's slots. */
function newTasksFor(day: Weekday, finishedYesterday: number, tier: Tier): OpenTask[] {
  const slots = TASK_SLOTS[day];
  const count = Math.min(BASE_NEW_TASKS + Math.floor(finishedYesterday / 2), slots.length);
  const tasks: OpenTask[] = slots.slice(0, count).map((id) => ({ id, fallout: false }));
  const strange = STRANGE_TASK_BY_DAY[day];
  const last = tasks.at(-1);
  if (strange && last && TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(DAY_START_TIER[day])) {
    tasks[tasks.length - 1] = { ...last, strange };
  }
  return tasks;
}

/** Runs the morning steps. The store takes the day-start snapshot from the returned state. */
export function startDay(state: GameState): RuleResult {
  if (state.phase.kind !== "workday") throw new Error("A new day needs the week still in progress.");
  if (state.day >= FRIDAY) throw new Error("The week ends on Friday.");
  const day = state.day + 1;
  const events: GameEvent[] = [];
  const escalation = addEscalation({ ...state, day }, 1);
  events.push(...escalation.events);
  let next = escalation.state;

  if (day >= TUESDAY) {
    const sanity = adjustPressures(next, { sanity: -1 });
    next = sanity.state;
    events.push(...sanity.events);
  }
  const firing = checkFiring(next, "yesterday");
  if (firing.state.phase.kind === "fired") return { state: firing.state, events: [...events, ...firing.events] };
  if (day === TUESDAY) events.push({ type: "goodwillRevealed" });
  const fallout = deliverFallout(firing.state);
  next = fallout.state;
  events.push(...fallout.events);

  const newTasks = newTasksFor(day as Weekday, state.finishedToday.length, tierOf(next.escalation));
  for (const task of newTasks) events.push({ type: "taskAssigned", task });

  next = {
    ...next,
    hoursLeft: day === FRIDAY ? FRIDAY_TASK_HOURS : WORKDAY_HOURS,
    openTasks: [...next.openTasks, ...newTasks],
    finishedToday: [],
    helpedToday: [],
    talkedToday: [],
  };
  events.push({ type: "dayStarted", day });
  return { state: next, events };
}

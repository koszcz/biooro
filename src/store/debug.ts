// Dev-only commands for the debug panel. They use the store's public commands and its dev hook.
import { taskById } from "../content/index";
import {
  type GameState,
  type OpenTask,
  PRESSURE_MAX,
  PRESSURE_MIN,
  type Pressure,
  taskChoiceLockedReason,
} from "../rules/index";
import type { GameStore } from "./store";

const canChoose = (state: GameState, task: OpenTask, choice: "do" | "fake"): boolean =>
  taskChoiceLockedReason(state, task, choice) === null;

/** The Task to do properly: Fallout first, then the oldest Task of each Faction not yet helped today. */
function taskToDo(state: GameState): OpenTask | undefined {
  const fallout = state.openTasks.find((task) => task.fallout && canChoose(state, task, "do"));
  if (fallout) return fallout;
  for (const task of state.openTasks) {
    const side = taskById(task.id).side;
    if (task.fallout || side === null || state.helpedToday.includes(side)) continue;
    const oldest = state.openTasks.find((open) => !open.fallout && taskById(open.id).side === side);
    if (oldest === task && canChoose(state, task, "do")) return task;
  }
  return undefined;
}

/**
 * The fixed default policy for one day, the spec's mixed week: do Fallout and one Task per Faction
 * (a Break first when Sanity is 1), fake the rest, take Breaks while Sanity is below 10, then go home.
 * Played all week, the Intern survives.
 */
export function playDefaultDay(store: GameStore): void {
  const day = store.state.day;
  while (store.state.day === day && store.state.phase.kind === "workday") playDefaultStep(store);
}

function playDefaultStep(store: GameStore): void {
  const state = store.state;
  const target = taskToDo(state);
  const fake = state.openTasks.find((task) => canChoose(state, task, "fake"));
  const pick = target ?? fake;
  if (target && state.pressures.sanity <= 1) {
    store.takeBreak();
  } else if (pick) {
    store.chooseTask(pick, target ? "do" : "fake");
    store.finishTaskAction();
  } else if (state.hoursLeft >= 1 && state.pressures.sanity < PRESSURE_MAX) {
    store.takeBreak();
  } else {
    store.goHome();
  }
}

/**
 * Starts over and plays the default policy until `day` begins. This gives the same state as playing
 * the earlier days by hand. It stops early if the Intern is fired on the way.
 */
export function jumpToDay(store: GameStore, day: number): void {
  store.startOver();
  while (store.state.day < day && store.state.phase.kind === "workday") playDefaultDay(store);
  store.devReplaceState(store.state);
}

export function setDebugPressure(store: GameStore, pressure: Pressure, value: number): void {
  const clamped = Math.min(PRESSURE_MAX, Math.max(PRESSURE_MIN, Math.round(value)));
  store.devReplaceState({ ...store.state, pressures: { ...store.state.pressures, [pressure]: clamped } });
}

export function setDebugFlag(store: GameStore, name: string, on: boolean): void {
  const rest = store.state.flags.filter((flag) => flag !== name);
  store.devReplaceState({ ...store.state, flags: on ? [...rest, name] : rest });
}

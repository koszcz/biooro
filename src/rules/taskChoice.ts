// "Do it", "Fake it" and "Sabotage it": hours, effects, help and locks for one Task choice.
import { type Faction, type LockedReason, taskById } from "../content/index";
import { addEscalation } from "./escalation";
import { adjustPressures, checkFiring, type PressureDeltas } from "./pressures";
import type { GameEvent, GameState, OpenTask, RuleResult, TaskChoice } from "./state";

export const TASK_CHOICES: readonly TaskChoice[] = ["do", "fake", "sabotage"];

export const TASK_CHOICE_HOURS: Record<TaskChoice, number> = { do: 3, fake: 1, sabotage: 2 };

const RIVAL: Record<Faction, Faction> = { launchTeam: "paperTrail", paperTrail: "launchTeam" };

interface ChoiceOutcome {
  deltas: PressureDeltas;
  /** The Faction the real work ends up serving, from the "Helping a Faction" table. */
  helps: Faction | null;
  finished: boolean;
}

function outcomeOf(side: Faction | null, choice: TaskChoice): ChoiceOutcome {
  // A Paper Trail Task never raises Performance.
  const performanceGain = side === "paperTrail" ? 0 : 1;
  switch (choice) {
    case "do":
      return {
        deltas: { performance: performanceGain, sanity: -1, ...(side && { [side]: 1 }) },
        helps: side,
        finished: true,
      };
    case "fake":
      return { deltas: { performance: performanceGain }, helps: null, finished: true };
    case "sabotage":
      return {
        deltas: { performance: -1, sanity: 1, ...(side && { [side]: -2, [RIVAL[side]]: 1 }) },
        helps: side && RIVAL[side],
        finished: false,
      };
  }
}

/** Why a Task choice is locked, or `null` when the Intern can make it. */
export function taskChoiceLockedReason(state: GameState, _task: OpenTask, choice: TaskChoice): LockedReason | null {
  if (TASK_CHOICE_HOURS[choice] > state.hoursLeft) return "notEnoughHours";
  return null;
}

function isSameTask(a: OpenTask, b: OpenTask): boolean {
  return a.id === b.id && a.fallout === b.fallout;
}

/** Applies a whole Task choice in one step and runs the mid-day Firing check. */
export function applyTaskChoice(state: GameState, task: OpenTask, choice: TaskChoice): RuleResult {
  if (state.phase.kind !== "workday") throw new Error("A Task choice needs a Workday in progress.");
  const index = state.openTasks.findIndex((open) => isSameTask(open, task));
  if (index === -1) throw new Error(`Task ${task.id} is not open.`);
  const reason = taskChoiceLockedReason(state, task, choice);
  if (reason !== null) throw new Error(`Task choice ${choice} is locked: ${reason}.`);

  const outcome = outcomeOf(taskById(task.id).side, choice);
  const hoursLeft = state.hoursLeft - TASK_CHOICE_HOURS[choice];
  const events: GameEvent[] = [{ type: "hoursChanged", hoursLeft }];
  let next: GameState = {
    ...state,
    hoursLeft,
    openTasks: state.openTasks.filter((_, i) => i !== index),
    finishedToday: outcome.finished ? [...state.finishedToday, task.id] : state.finishedToday,
    helpedToday:
      outcome.helps && !state.helpedToday.includes(outcome.helps)
        ? [...state.helpedToday, outcome.helps]
        : state.helpedToday,
  };

  const pressures = adjustPressures(next, outcome.deltas);
  // One Task choice adds at most 1 Escalation: sabotage, or any help to the Paper Trail.
  const escalates = choice === "sabotage" || outcome.helps === "paperTrail";
  const escalation = addEscalation(pressures.state, escalates ? 1 : 0);
  const firing = checkFiring(escalation.state, "thisDay");
  next = firing.state;
  events.push(...pressures.events, ...escalation.events, { type: "taskResolved", task, choice }, ...firing.events);
  return { state: next, events };
}

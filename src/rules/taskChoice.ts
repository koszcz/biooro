// "Do it", "Fake it", "Delegate it" and "Sabotage it": hours, effects, help and locks for one Task choice.
import { type ColleagueId, type Faction, type LockedReason, taskById } from "../content/index";
import { type ChoiceOutcome, delegationLockedReason, delegationOutcome } from "./delegation";
import { addEscalation } from "./escalation";
import { FALLOUT_DO_HOURS, queueFallout } from "./fallout";
import { adjustPressures, checkFiring } from "./pressures";
import type { GameEvent, GameState, OpenTask, RuleResult, TaskChoice } from "./state";

export const TASK_CHOICES: readonly TaskChoice[] = ["do", "fake", "delegate", "sabotage"];

export const TASK_CHOICE_HOURS: Record<TaskChoice, number> = { do: 3, fake: 1, delegate: 1, sabotage: 2 };

const RIVAL: Record<Faction, Faction> = { launchTeam: "paperTrail", paperTrail: "launchTeam" };

function outcomeOf(side: Faction | null, choice: TaskChoice, colleague?: ColleagueId): ChoiceOutcome {
  // A Paper Trail Task never raises Performance.
  const performanceGain = side === "paperTrail" ? 0 : 1;
  switch (choice) {
    case "do":
      return {
        deltas: { performance: performanceGain, sanity: -1, ...(side && { [side]: 1 }) },
        helps: side,
        finished: true,
        causesFallout: false,
      };
    case "fake":
      return { deltas: { performance: performanceGain }, helps: null, finished: true, causesFallout: true };
    case "delegate":
      if (!colleague) throw new Error("Delegating needs a Colleague.");
      return delegationOutcome(side, colleague);
    case "sabotage":
      return {
        deltas: { performance: -1, sanity: 1, ...(side && { [side]: -2, [RIVAL[side]]: 1 }) },
        helps: side && RIVAL[side],
        finished: false,
        causesFallout: false,
      };
  }
}

/** Why a Task choice is locked, or `null` when the Intern can make it. Delegating needs a Colleague. */
export function taskChoiceLockedReason(
  state: GameState,
  task: OpenTask,
  choice: TaskChoice,
  colleague?: ColleagueId,
): LockedReason | null {
  // No Fallout Task ever creates more Fallout.
  if (task.fallout && choice === "fake") return "alreadyFaked";
  if (taskChoiceHours(task, choice) > state.hoursLeft) return "notEnoughHours";
  if (choice === "delegate") {
    if (!colleague) throw new Error("Delegating needs a Colleague.");
    return delegationLockedReason(state, task, colleague);
  }
  return null;
}

/** The hours a Task choice costs. "Do it" on a Fallout Task takes 4 hours. */
export function taskChoiceHours(task: OpenTask, choice: TaskChoice): number {
  return task.fallout && choice === "do" ? FALLOUT_DO_HOURS : TASK_CHOICE_HOURS[choice];
}

function isSameTask(a: OpenTask, b: OpenTask): boolean {
  return a.id === b.id && a.fallout === b.fallout;
}

/** Applies a whole Task choice in one step and runs the mid-day Firing check. */
export function applyTaskChoice(
  state: GameState,
  task: OpenTask,
  choice: TaskChoice,
  colleague?: ColleagueId,
): RuleResult {
  if (state.phase.kind !== "workday") throw new Error("A Task choice needs a Workday in progress.");
  const index = state.openTasks.findIndex((open) => isSameTask(open, task));
  if (index === -1) throw new Error(`Task ${task.id} is not open.`);
  const reason = taskChoiceLockedReason(state, task, choice, colleague);
  if (reason !== null) throw new Error(`Task choice ${choice} is locked: ${reason}.`);

  const outcome = outcomeOf(taskById(task.id).side, choice, colleague);
  const hoursLeft = state.hoursLeft - taskChoiceHours(task, choice);
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

  if (outcome.causesFallout) next = queueFallout(next, task);
  const pressures = adjustPressures(next, outcome.deltas);
  // One Task choice adds at most 1 Escalation: sabotage, or any help to the Paper Trail.
  const escalates = choice === "sabotage" || outcome.helps === "paperTrail";
  const escalation = addEscalation(pressures.state, escalates ? 1 : 0);
  const firing = checkFiring(escalation.state, "thisDay");
  next = firing.state;
  events.push(
    ...pressures.events,
    ...escalation.events,
    { type: "taskResolved", task, choice, ...(colleague && { colleague }) },
    ...firing.events,
  );
  return { state: next, events };
}

// The three scripted weeks from the spec's tech plan. Each asserts exact results on purpose.
// If one fails after a rule change, rerun .scratch/intern-game/sim/week_sim.py before changing a number.
import { describe, expect, it } from "vitest";
import { type Faction, taskById } from "../content/index";
import {
  type AuditAnswer,
  answerAudit,
  applyBreak,
  applyTaskChoice,
  endDay,
  type GameState,
  goHome,
  newGame,
  type OpenTask,
  PRESSURE_MAX,
  type RuleResult,
  startDay,
  type TaskChoice,
  taskChoiceLockedReason,
} from "./index";

type Action = { kind: "choice"; task: OpenTask; choice: TaskChoice } | { kind: "break" } | { kind: "home" };

type Policy = (state: GameState) => Action;

const canChoose = (state: GameState, task: OpenTask, choice: TaskChoice): boolean =>
  taskChoiceLockedReason(state, task, choice) === null;
const choose = (task: OpenTask, choice: TaskChoice): Action => ({ kind: "choice", task, choice });
const canBreak = (state: GameState): boolean => state.hoursLeft >= 1 && state.pressures.sanity < PRESSURE_MAX;

function act(state: GameState, action: Action): RuleResult {
  if (action.kind === "choice") return applyTaskChoice(state, action.task, action.choice);
  if (action.kind === "break") return applyBreak(state);
  return goHome(state);
}

/** Plays the week from a new game. The policy acts until it goes home or the hours run out. */
function playWeek(policy: Policy, audit: (state: GameState) => AuditAnswer = () => "bury"): GameState {
  let state = startDay(newGame()).state;
  while (state.phase.kind === "workday") {
    const action = policy(state);
    state = act(state, action).state;
    if (state.phase.kind !== "workday") break;
    if (state.hoursLeft > 0 && action.kind !== "home") continue;
    state = endDay(state).state;
    if (state.phase.kind === "audit") state = answerAudit(state, audit(state)).state;
    if (state.phase.kind === "workday") state = startDay(state).state;
  }
  return state;
}

const sideOf = (task: OpenTask): Faction | null => taskById(task.id).side;

/** Picks the mixed week's next Task to do: Fallout first, then one Task for each Faction not helped today. */
function mixedDoTarget(state: GameState): OpenTask | undefined {
  const fallout = state.openTasks.find((task) => task.fallout && canChoose(state, task, "do"));
  if (fallout) return fallout;
  for (const task of state.openTasks) {
    const side = sideOf(task);
    if (task.fallout || side === null || state.helpedToday.includes(side)) continue;
    const oldest = state.openTasks.find((open) => !open.fallout && sideOf(open) === side);
    if (oldest === task && canChoose(state, task, "do")) return task;
  }
  return undefined;
}

const mixedWeek: Policy = (state) => {
  const target = mixedDoTarget(state);
  if (target) return state.pressures.sanity <= 1 ? { kind: "break" } : choose(target, "do");
  const fake = state.openTasks.find((task) => canChoose(state, task, "fake"));
  if (fake) return choose(fake, "fake");
  return canBreak(state) ? { kind: "break" } : { kind: "home" };
};

const alwaysDoIt: Policy = (state) => {
  const task = state.openTasks.find((open) => canChoose(state, open, "do"));
  return task ? choose(task, "do") : { kind: "home" };
};

const fakeFirst: Policy = (state) => {
  const fake = state.openTasks.find((task) => canChoose(state, task, "fake"));
  if (fake) return choose(fake, "fake");
  const fallout = state.openTasks.find((task) => task.fallout && canChoose(state, task, "do"));
  if (fallout) return choose(fallout, "do");
  return canBreak(state) ? { kind: "break" } : { kind: "home" };
};

describe("the scripted weeks", () => {
  it("1. the mixed week survives with the spec's exact Pressures", () => {
    const auditAnswer = (state: GameState): AuditAnswer =>
      state.pressures.launchTeam <= state.pressures.paperTrail ? "bury" : "escalate";
    const state = playWeek(mixedWeek, auditAnswer);
    expect(state.phase.kind).toBe("weekSurvived");
    expect(state.pressures).toEqual({ performance: 6, launchTeam: 9, paperTrail: 8, sanity: 1 });
    expect(state.escalation).toBe(7);
  });

  it("2. always 'Do it' with no Breaks is fired for Sanity on Wednesday morning, with 'Retry yesterday'", () => {
    const state = playWeek(alwaysDoIt);
    expect(state.day).toBe(3);
    expect(state.phase).toEqual({ kind: "fired", pressure: "sanity", retry: "yesterday" });
  });

  it("3. fake first, with Breaks, is fired for Performance on Friday night", () => {
    const state = playWeek(fakeFirst);
    expect(state.day).toBe(5);
    expect(state.phase).toEqual({ kind: "fired", pressure: "performance", retry: "thisDay" });
  });
});

// What the Task choice popover shows for one Task: hours, effect chips, locked reasons and delegate rows.
import { COLLEAGUES, type ColleagueId, taskById } from "../content";
import { DELEGATE_NOTES, EFFECT_CHIPS, hudText, LOCKED_REASONS, TASK_CHOICE_LABELS } from "../locales";
import {
  applyTaskChoice,
  type GameState,
  type OpenTask,
  PRESSURES,
  type Pressure,
  TASK_CHOICES,
  type TaskChoice,
  taskChoiceHours,
  taskChoiceLockedReason,
} from "../rules";

export type Deltas = Partial<Record<Pressure, number>>;

export interface Chip {
  pressure: Pressure;
  text: string;
}

/** One pickable line: a Task choice, or one Colleague under "Delegate it". */
export interface Pick {
  choice: TaskChoice;
  colleague?: ColleagueId;
  hours: number;
  /** Every Pressure change, hidden goodwill included. The gauges preview only the ones they show. */
  deltas: Deltas;
  chips: Chip[];
  locked: string | null;
}

export interface DelegateRow extends Pick {
  colleague: ColleagueId;
  name: string;
  note: string;
}

export interface ChoiceView extends Pick {
  label: string;
  /** Only for "Delegate it": one row per Colleague. */
  rows?: DelegateRow[];
}

const COLLEAGUE_IDS = Object.keys(COLLEAGUES) as ColleagueId[];

/** Goodwill appears on screen only from Tuesday. */
export function goodwillVisible(state: GameState): boolean {
  return state.day >= 2;
}

export function visiblePressures(state: GameState): Pressure[] {
  return goodwillVisible(state) ? [...PRESSURES] : ["performance", "sanity"];
}

/**
 * The Task choice's effects from the rules, before clamping. It runs the choice on a copy of the state with
 * every Pressure at 5, so no Pressure hits 0 or 10 on the way.
 */
function effectsOf(state: GameState, task: OpenTask, choice: TaskChoice, colleague?: ColleagueId): Deltas {
  const middle = { ...state, phase: { kind: "workday" as const }, hoursLeft: 8 };
  middle.pressures = { performance: 5, launchTeam: 5, paperTrail: 5, sanity: 5 };
  middle.openTasks = [task];
  const after = applyTaskChoice(middle, task, choice, colleague).state.pressures;
  const deltas: Deltas = {};
  for (const pressure of PRESSURES) {
    const change = after[pressure] - middle.pressures[pressure];
    if (change !== 0) deltas[pressure] = change;
  }
  return deltas;
}

function chipsOf(state: GameState, deltas: Deltas): Chip[] {
  return visiblePressures(state)
    .filter((pressure) => deltas[pressure])
    .map((pressure) => {
      const change = deltas[pressure] ?? 0;
      const signed = change > 0 ? `+${change}` : `−${-change}`;
      return { pressure, text: EFFECT_CHIPS[pressure](signed) };
    });
}

function pickOf(state: GameState, task: OpenTask, choice: TaskChoice, colleague?: ColleagueId): Pick {
  const reason = taskChoiceLockedReason(state, task, choice, colleague);
  const deltas = reason === null ? effectsOf(state, task, choice, colleague) : {};
  return {
    choice,
    ...(colleague && { colleague }),
    hours: taskChoiceHours(task, choice),
    deltas,
    chips: chipsOf(state, deltas),
    locked: reason === null ? null : LOCKED_REASONS[reason],
  };
}

function delegateView(state: GameState, task: OpenTask): ChoiceView {
  const side = taskById(task.id).side ?? "none";
  const rows = COLLEAGUE_IDS.map((colleague) => ({
    ...pickOf(state, task, "delegate", colleague),
    colleague,
    name: COLLEAGUES[colleague].name,
    note: DELEGATE_NOTES[colleague][side],
  }));
  const hours = taskChoiceHours(task, "delegate");
  const outOfHours = hours > state.hoursLeft;
  const allLocked = rows.every((row) => row.locked !== null);
  const locked = outOfHours ? LOCKED_REASONS.notEnoughHours : allLocked ? hudText.nobodyWillTakeIt : null;
  return { choice: "delegate", label: TASK_CHOICE_LABELS.delegate, hours, deltas: {}, chips: [], locked, rows };
}

/** All four Task choices, in the spec's order. A locked one carries its reason. */
export function taskChoiceViews(state: GameState, task: OpenTask): ChoiceView[] {
  return TASK_CHOICES.map((choice) =>
    choice === "delegate"
      ? delegateView(state, task)
      : { ...pickOf(state, task, choice), label: TASK_CHOICE_LABELS[choice] },
  );
}

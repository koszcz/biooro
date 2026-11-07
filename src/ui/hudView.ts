// What the gauges, the hour blocks and the Task bubbles show for a GameState, with an optional preview.
import { type Faction, taskById } from "../content";
import {
  ASSIGNER_NAMES,
  FALLOUT_WORDING,
  GAUGE_LABELS,
  hudText,
  LOCKED_REASONS,
  type ReturningTaskId,
  STRANGE_TASK_WORDING,
  TASK_WORDING,
} from "../locales";
import {
  breakLockedReason,
  type GameState,
  type OpenTask,
  PRESSURE_MAX,
  PRESSURE_MIN,
  type Pressure,
  WORKDAY_HOURS,
} from "../rules";
import { type Deltas, goodwillVisible, visiblePressures } from "./choices";

/** A gauge pulses at this value or lower. */
export const LOW_PRESSURE = 2;

export interface Preview {
  hours: number;
  deltas: Deltas;
}

export interface GaugeView {
  pressure: Pressure;
  label: string;
  value: number;
  low: boolean;
  /** The striped section a hovered Task choice would add or remove. */
  preview: { from: number; to: number } | null;
}

export type HourBlock = "left" | "preview" | "spent";

export interface HudView {
  gauges: GaugeView[];
  blocks: HourBlock[];
  hoursLabel: string;
  breakLocked: string | null;
}

function clamp(value: number): number {
  return Math.max(PRESSURE_MIN, Math.min(PRESSURE_MAX, value));
}

export function hudView(state: GameState, preview?: Preview): HudView {
  const gauges = visiblePressures(state).map((pressure) => {
    const value = state.pressures[pressure];
    const to = clamp(value + (preview?.deltas[pressure] ?? 0));
    return {
      pressure,
      label: GAUGE_LABELS[pressure],
      value,
      low: value <= LOW_PRESSURE,
      preview: to === value ? null : { from: value, to },
    };
  });
  const previewFrom = state.hoursLeft - (preview?.hours ?? 0);
  const blocks = Array.from({ length: WORKDAY_HOURS }, (_, hour): HourBlock => {
    if (hour >= state.hoursLeft) return "spent";
    return hour >= previewFrom ? "preview" : "left";
  });
  const reason = breakLockedReason(state);
  return {
    gauges,
    blocks,
    hoursLabel: hudText.hoursLeft(state.hoursLeft),
    breakLocked: reason === null ? null : LOCKED_REASONS[reason],
  };
}

/** Who a bubble floats over. "Anyone" Tasks float over the Intern. */
export type BubbleOwner = Exclude<ReturnType<typeof taskById>["assigner"], "anyone"> | "intern";

export interface BubbleView {
  task: OpenTask;
  over: BubbleOwner;
  text: string;
  /** The border colour: the Task side from Tuesday, grey ("none") on Monday and for Tasks with no side. */
  border: Faction | "none";
  fallout: boolean;
}

export function taskText(task: OpenTask): string {
  if (task.fallout) return FALLOUT_WORDING[`${(task.strange ?? task.id) as ReturningTaskId}.fallout`];
  return task.strange ? STRANGE_TASK_WORDING[task.strange] : TASK_WORDING[task.id];
}

/** A person with this many open Tasks or more shows a pill instead of every bubble. */
export const CROWD_FROM = 3;
export const SHOWN_WHEN_CROWDED = 2;

export interface MorePill {
  text: string;
  /** "⚠ N" when N hidden Tasks are Fallout, otherwise null. */
  fallout: string | null;
}

export interface BubbleGroup {
  over: BubbleOwner;
  bubbles: BubbleView[];
  pill: MorePill | null;
}

export function ownerName(over: BubbleOwner): string {
  return ASSIGNER_NAMES[over === "intern" ? "anyone" : over];
}

/** A person's Tasks, most urgent first: Fallout first, then oldest first (the open-list order). */
export function urgentTasks(state: GameState, over: BubbleOwner): BubbleView[] {
  const own = bubbleViews(state).filter((view) => view.over === over);
  return [...own.filter((view) => view.fallout), ...own.filter((view) => !view.fallout)];
}

/** The bubbles to draw, one group per person, in the order each person first has a Task. */
export function bubbleGroups(state: GameState): BubbleGroup[] {
  const owners = [...new Set(bubbleViews(state).map((view) => view.over))];
  return owners.map((over) => {
    const sorted = urgentTasks(state, over);
    if (sorted.length < CROWD_FROM) return { over, bubbles: sorted, pill: null };
    const hidden = sorted.slice(SHOWN_WHEN_CROWDED);
    const falloutHidden = hidden.filter((view) => view.fallout).length;
    return {
      over,
      bubbles: sorted.slice(0, SHOWN_WHEN_CROWDED),
      pill: {
        text: hudText.morePill(hidden.length, ownerName(over)),
        fallout: falloutHidden > 0 ? hudText.pillFallout(falloutHidden) : null,
      },
    };
  });
}

/** One bubble per open Task, in open-list order. */
export function bubbleViews(state: GameState): BubbleView[] {
  return state.openTasks.map((task) => {
    const { assigner, side } = taskById(task.id);
    return {
      task,
      over: assigner === "anyone" ? "intern" : assigner,
      text: taskText(task),
      border: side && goodwillVisible(state) ? side : "none",
      fallout: task.fallout,
    };
  });
}

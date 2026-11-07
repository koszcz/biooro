// The one serialisable GameState object and the events rule functions return.
import type { ColleagueId, Faction, TaskId } from "../content/index";

export type { ColleagueId };

/** The four Pressures, in Firing priority order. */
export const PRESSURES = ["performance", "launchTeam", "paperTrail", "sanity"] as const;
export type Pressure = (typeof PRESSURES)[number];

export const PRESSURE_MIN = 0;
export const PRESSURE_MAX = 10;
export const PRESSURE_START = 6;
export const WORKDAY_HOURS = 8;

export type Tier = "mundane" | "odd" | "wrong";
export type TaskChoice = "do" | "fake" | "delegate" | "sabotage";
export type RetryKind = "thisDay" | "yesterday";

/** One entry in the open list. A Fallout Task returns with the same Task ID. */
export interface OpenTask {
  id: TaskId;
  fallout: boolean;
}

export interface PendingFallout {
  id: TaskId;
  dueDay: number;
}

export type Phase =
  | { kind: "workday" }
  | { kind: "fired"; pressure: Pressure; retry: RetryKind }
  | { kind: "weekSurvived" };

export interface GameState {
  pressures: Record<Pressure, number>;
  /** 0 before Monday's morning steps, then 1 (Monday) to 5 (Friday). */
  day: number;
  hoursLeft: number;
  escalation: number;
  /** Open Tasks in open-list order: rolled over, then Fallout, then new. */
  openTasks: OpenTask[];
  pendingFallout: PendingFallout[];
  finishedToday: TaskId[];
  helpedToday: Faction[];
  talkedToday: ColleagueId[];
  phase: Phase;
  flags: string[];
}

export type GameEvent =
  | { type: "hoursChanged"; hoursLeft: number }
  | { type: "pressureChanged"; pressure: Pressure; from: number; to: number }
  | { type: "tierChanged"; tier: Tier }
  | { type: "taskResolved"; task: OpenTask; choice: TaskChoice; colleague?: ColleagueId }
  | { type: "fired"; pressure: Pressure; retry: RetryKind };

export interface RuleResult {
  state: GameState;
  events: GameEvent[];
}

/** The state before Monday's morning steps run. */
export function newGame(): GameState {
  return {
    pressures: {
      performance: PRESSURE_START,
      launchTeam: PRESSURE_START,
      paperTrail: PRESSURE_START,
      sanity: PRESSURE_START,
    },
    day: 0,
    hoursLeft: 0,
    escalation: 0,
    openTasks: [],
    pendingFallout: [],
    finishedToday: [],
    helpedToday: [],
    talkedToday: [],
    phase: { kind: "workday" },
    flags: [],
  };
}

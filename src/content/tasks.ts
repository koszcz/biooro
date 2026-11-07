// Tasks, Task places and Task slots from the spec's "Task slots" and "How Task choices play out" tables.

/** The two Factions. A Task with no side has the side `null`. */
export type Faction = "launchTeam" | "paperTrail";

/** Who hands out a Task. "anyone" Tasks have no side and float over the Intern. */
export type Assigner = "zbigniew" | "halina" | "ryszard" | "wiola" | "kamil" | "anyone";

/** Animation clips from Kenney Mini Characters that Task places use. */
export type TaskClip =
  | "sit"
  | "crouch"
  | "interact-left"
  | "interact-right"
  | "pick-up"
  | "attack-kick-left"
  | "attack-kick-right"
  | "attack-melee-right";

export type TaskPlaceId = "desk" | "printer" | "sink" | "plant" | "shredder" | "room4" | "evidenceShelf";

export interface TaskPlace {
  doClip: TaskClip;
  sabotageClip: TaskClip;
}

export const TASK_PLACES: Record<TaskPlaceId, TaskPlace> = {
  desk: { doClip: "sit", sabotageClip: "sit" },
  printer: { doClip: "interact-left", sabotageClip: "attack-kick-right" },
  sink: { doClip: "interact-right", sabotageClip: "interact-left" },
  plant: { doClip: "pick-up", sabotageClip: "attack-kick-left" },
  shredder: { doClip: "crouch", sabotageClip: "attack-melee-right" },
  room4: { doClip: "interact-left", sabotageClip: "attack-kick-right" },
  evidenceShelf: { doClip: "pick-up", sabotageClip: "interact-right" },
};

export interface Task {
  assigner: Assigner;
  side: Faction | null;
  place: TaskPlaceId;
}

// Every slot Task starts at the Intern's desk. The "Task wording" ticket sets the real places.
export const TASKS = {
  "mon-zbigniew": { assigner: "zbigniew", side: "launchTeam", place: "desk" },
  "mon-anyone": { assigner: "anyone", side: null, place: "desk" },
  "tue-halina": { assigner: "halina", side: "paperTrail", place: "desk" },
  "tue-zbigniew": { assigner: "zbigniew", side: "launchTeam", place: "desk" },
  "tue-anyone": { assigner: "anyone", side: null, place: "desk" },
  "wed-kamil": { assigner: "kamil", side: "paperTrail", place: "desk" },
  "wed-wiola": { assigner: "wiola", side: "launchTeam", place: "desk" },
  "wed-ryszard": { assigner: "ryszard", side: "launchTeam", place: "desk" },
  "thu-halina": { assigner: "halina", side: "paperTrail", place: "desk" },
  "thu-zbigniew": { assigner: "zbigniew", side: "launchTeam", place: "desk" },
  "thu-kamil": { assigner: "kamil", side: "paperTrail", place: "desk" },
  "thu-anyone": { assigner: "anyone", side: null, place: "desk" },
  "fri-zbigniew": { assigner: "zbigniew", side: "launchTeam", place: "desk" },
  "fri-halina": { assigner: "halina", side: "paperTrail", place: "desk" },
  "fri-wiola": { assigner: "wiola", side: "launchTeam", place: "desk" },
  "fri-ryszard": { assigner: "ryszard", side: "launchTeam", place: "desk" },
} as const satisfies Record<string, Task>;

export type TaskId = keyof typeof TASKS;

/** A weekday, from Monday (1) to Friday (5). */
export type Weekday = 1 | 2 | 3 | 4 | 5;

/** Each morning takes slots from the start of that day's list. */
export const TASK_SLOTS: Record<Weekday, readonly TaskId[]> = {
  1: ["mon-zbigniew", "mon-anyone"],
  2: ["tue-halina", "tue-zbigniew", "tue-anyone"],
  3: ["wed-kamil", "wed-wiola", "wed-ryszard"],
  4: ["thu-halina", "thu-zbigniew", "thu-kamil", "thu-anyone"],
  5: ["fri-zbigniew", "fri-halina", "fri-wiola", "fri-ryszard"],
};

/**
 * A strange Task replaces the last slot used on its day. It keeps that slot's assigner and Task side,
 * so it names only its own Task place.
 */
export interface StrangeTask {
  place: TaskPlaceId;
}

// Each strange Task starts at the Intern's desk. The "Task wording" ticket sets the real places.
export const STRANGE_TASKS = {
  "tue-strange": { place: "desk" },
  "wed-strange": { place: "desk" },
  "thu-strange": { place: "desk" },
} as const satisfies Record<string, StrangeTask>;

export type StrangeTaskId = keyof typeof STRANGE_TASKS;

/** The days with a strange Task. */
export const STRANGE_TASK_BY_DAY: Partial<Record<Weekday, StrangeTaskId>> = {
  2: "tue-strange",
  3: "wed-strange",
  4: "thu-strange",
};

export function taskById(id: TaskId): Task {
  return TASKS[id];
}

export type ColleagueId = "ryszard" | "wiola" | "kamil";

/** What a Colleague does with a delegated Task. */
export type Handling = "fakes" | "doesProperly" | "escalates";

export interface Colleague {
  name: string;
  faction: Faction;
  handling: Handling;
}

export const COLLEAGUES: Record<ColleagueId, Colleague> = {
  ryszard: { name: "Ryszard", faction: "launchTeam", handling: "fakes" },
  wiola: { name: "Wiola", faction: "launchTeam", handling: "doesProperly" },
  kamil: { name: "Kamil", faction: "paperTrail", handling: "escalates" },
};

/** Why a Task choice or Break is locked. The locales hold the text the player reads. */
export type LockedReason = "notEnoughHours" | "alreadyFaked" | "ryszardAlreadyFaked" | `${ColleagueId}DoesntTrust`;

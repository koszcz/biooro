// Task actions: how a Task choice plays out in the office, from `taskActionStarted` to `finishTaskAction()`.
// It plans each action as steps on a stage, so tests can drive it without Three.js.
import { type CastId, type ColleagueId, STRANGE_TASKS, TASK_PLACES, type TaskPlaceId, taskById } from "../content";
import type { OpenTask } from "../rules";
import type { GameStore, StoreEventOf } from "../store";
import { run, Sequence, type Step, until, wait } from "./sequence";

/** Screen seconds per in-game hour. The spec says to start at 1 and tune it in the build. */
export const SECONDS_PER_HOUR = 1;
/** How long Ryszard waits before he shows "✨ looks done". */
const RYSZARD_DELAY = 0.6;

/** Where someone walks: a Task place, or to stand beside a person. */
export type ActionGoal = { place: TaskPlaceId } | { person: CastId };

/** What the people in the office can do. The Three.js scene and the tests each provide one. */
export interface ActionStage {
  /** Walks the Intern to the goal. A desk Task walks the Intern to sit at the desk. */
  internTo(goal: ActionGoal, arrived: () => void): void;
  /** Plays a clip on the Intern, facing the goal when there is one. */
  internPlay(clip: string, toward?: ActionGoal): void;
  /** The Colleague and the Intern face each other, and the Colleague nods. */
  handOff(colleague: ColleagueId): void;
  /** Walks a Colleague to the goal, or back to their own spot, where they settle in their usual pose. */
  colleagueTo(colleague: ColleagueId, goal: ActionGoal | "home", arrived: () => void): void;
  /** Turns a Colleague back to their set direction and usual pose, where they are. */
  colleagueRest(colleague: ColleagueId): void;
  /** Plays a clip on a Colleague, facing the goal when there is one. */
  colleaguePlay(colleague: ColleagueId, clip: string, toward?: ActionGoal): void;
}

/** What the DOM overlays show while an action plays. */
export type ActionCue =
  | { kind: "drained"; hours: number }
  | { kind: "looksDone"; over: CastId | "intern" }
  | { kind: "handOff"; colleague: ColleagueId };

export type ActionSource = Pick<GameStore, "on" | "finishTaskAction">;

export interface TaskActions {
  /** True from `taskActionStarted` until the scene calls `finishTaskAction()`. */
  readonly playing: boolean;
  update(seconds: number): void;
}

export function taskPlace(task: OpenTask): TaskPlaceId {
  return task.strange ? STRANGE_TASKS[task.strange].place : taskById(task.id).place;
}

type Started = StoreEventOf<"taskActionStarted">;

function drain(hours: number, cue: (cue: ActionCue) => void): Step[] {
  return Array.from({ length: hours }, (_, hour) => [
    wait(SECONDS_PER_HOUR),
    run(() => cue({ kind: "drained", hours: hour + 1 })),
  ]).flat();
}

/** The Intern's part of a Task choice. A hand-off then starts the Colleague's own part. */
function internSteps(action: Started, stage: ActionStage, cue: (cue: ActionCue) => void, handedOff: () => void) {
  const { task, choice, colleague, hours } = action;
  if (choice === "delegate" && colleague) {
    const goal = { person: colleague };
    return [
      until((done) => stage.internTo(goal, done)),
      run(() => {
        stage.handOff(colleague);
        cue({ kind: "handOff", colleague });
      }),
      ...drain(hours, cue),
      run(() => stage.internPlay("idle")),
      run(handedOff),
    ];
  }
  const place = taskPlace(task);
  const goal = { place };
  const clip = choice === "sabotage" ? TASK_PLACES[place].sabotageClip : TASK_PLACES[place].doClip;
  return [
    until((done) => stage.internTo(goal, done)),
    run(() => stage.internPlay(clip, goal)),
    ...drain(hours, cue),
    run(() => {
      if (choice === "fake") cue({ kind: "looksDone", over: "intern" });
      // At the desk the Intern stays seated.
      if (place !== "desk") stage.internPlay("idle");
    }),
  ];
}

/** What a Colleague does on their own after a hand-off. It costs the Intern nothing. */
export function colleagueSteps(
  colleague: ColleagueId,
  task: OpenTask,
  stage: ActionStage,
  cue: (cue: ActionCue) => void,
): Step[] {
  const home = until((done) => stage.colleagueTo(colleague, "home", done));
  if (colleague === "ryszard")
    return [
      run(() => stage.colleagueRest(colleague)),
      wait(RYSZARD_DELAY),
      run(() => cue({ kind: "looksDone", over: "ryszard" })),
    ];
  const place = taskPlace(task);
  const toHalina = colleague === "kamil" && taskById(task.id).side === "launchTeam";
  const goal: ActionGoal | null = toHalina ? { person: "halina" } : place === "desk" ? null : { place };
  // A desk Task has no place to walk to, so the Colleague works where they are.
  const clip = toHalina ? "interact-right" : place === "desk" ? "interact-left" : TASK_PLACES[place].doClip;
  return [
    ...(goal ? [until((done) => stage.colleagueTo(colleague, goal, done))] : []),
    run(() => stage.colleaguePlay(colleague, clip, goal ?? undefined)),
    wait(3 * SECONDS_PER_HOUR),
    home,
  ];
}

export function createTaskActions(
  source: ActionSource,
  stage: ActionStage,
  cue: (cue: ActionCue) => void,
): TaskActions {
  let main: Sequence | null = null;
  const colleagues = new Map<ColleagueId, Sequence>();

  source.on("taskActionStarted", (action) => {
    main = new Sequence(
      internSteps(action, stage, cue, () => {
        if (action.colleague) {
          colleagues.set(action.colleague, new Sequence(colleagueSteps(action.colleague, action.task, stage, cue)));
        }
      }),
    );
    // The walk starts at the click.
    main.update(0);
  });
  // A retry or a new game drops an action that was still playing. The store has already let it go.
  source.on("dayStarted", () => {
    main = null;
  });

  return {
    get playing() {
      return main !== null;
    },
    update(seconds) {
      for (const [colleague, sequence] of colleagues) if (sequence.update(seconds)) colleagues.delete(colleague);
      if (main?.update(seconds)) {
        main = null;
        source.finishTaskAction();
      }
    },
  };
}

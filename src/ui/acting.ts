// What the HUD shows while a Task action plays: the state from before the click, hours that drain one by one,
// the tag over the Intern, and the Pressure floats when the action finishes or a Break is taken.
import { PRESSURE_FLOATS, TASK_CHOICE_LABELS } from "../locales";
import { type GameState, type OpenTask, PRESSURES, type Pressure } from "../rules";
import type { GameStore, StoreEventOf } from "../store";
import { visiblePressures } from "./choices";
import { taskText } from "./hudView";

export interface Float {
  pressure: Pressure;
  text: string;
}

export interface ActionTag {
  /** The Task choice, such as "Do it". */
  label: string;
  task: string;
  hours: number;
  hoursLeft: number;
  /** True for sabotage, which shows the purple "🤫" tag. */
  secret: boolean;
}

export interface Acting {
  /** True from `taskActionStarted` until `taskActionFinished`. */
  readonly playing: boolean;
  /** The Task whose action is playing. */
  readonly busyTask: OpenTask | null;
  /** The state to draw. While an action plays, it is the state from before the click, less the drained hours. */
  shown(state: GameState): GameState;
  tag(): ActionTag | null;
  /** The scene has drained this many of the action's hours. */
  drained(hours: number): void;
  /** Call just before `chooseTask()`, so the HUD keeps showing this state until the action finishes. */
  expect(before: GameState): void;
  /** Runs a Break and floats its Pressure change. */
  takeBreak(command: () => void): void;
  onFloats(listener: (floats: Float[]) => void): void;
}

type PressureChange = StoreEventOf<"pressureChanged">;

function floatsFor(state: GameState, changes: PressureChange[]): Float[] {
  const visible = visiblePressures(state);
  return PRESSURES.flatMap((pressure) => {
    const change = changes.filter((c) => c.pressure === pressure).reduce((sum, c) => sum + c.to - c.from, 0);
    if (change === 0 || !visible.includes(pressure)) return [];
    const signed = change > 0 ? `+${change}` : `−${-change}`;
    return [{ pressure, text: PRESSURE_FLOATS[pressure](signed) }];
  });
}

export function createActing(store: GameStore): Acting {
  let expected: GameState | null = null;
  let action: { event: StoreEventOf<"taskActionStarted">; before: GameState; drained: number } | null = null;
  let recording = false;
  let changes: PressureChange[] = [];
  const listeners: ((floats: Float[]) => void)[] = [];

  const flush = () => {
    const floats = floatsFor(store.state, changes);
    changes = [];
    recording = false;
    if (floats.length > 0) for (const listener of listeners) listener(floats);
  };

  store.on("taskActionStarted", (event) => {
    action = { event, before: expected ?? store.state, drained: 0 };
    expected = null;
    changes = [];
    recording = true;
  });
  store.on("pressureChanged", (event) => {
    if (recording) changes.push(event);
  });
  store.on("taskActionFinished", () => {
    action = null;
    flush();
  });
  // The end-of-day steps after a Break are not part of the Break.
  store.on("dayEnded", () => {
    if (!action) recording = false;
  });
  // A retry or a new game drops an action that was still playing.
  store.on("dayStarted", () => {
    action = null;
  });

  return {
    get playing() {
      return action !== null;
    },
    get busyTask() {
      return action?.event.task ?? null;
    },
    shown(state) {
      if (!action) return state;
      return { ...action.before, hoursLeft: action.before.hoursLeft - action.drained };
    },
    tag() {
      if (!action) return null;
      const { task, choice, hours } = action.event;
      return {
        label: TASK_CHOICE_LABELS[choice],
        task: taskText(task),
        hours,
        hoursLeft: hours - action.drained,
        secret: choice === "sabotage",
      };
    },
    drained(hours) {
      if (action) action.drained = Math.min(hours, action.event.hours);
    },
    expect(before) {
      expected = before;
    },
    takeBreak(command) {
      changes = [];
      recording = true;
      command();
      // A Break changes only Sanity. Anything else came from the end-of-day steps.
      changes = changes.filter((c) => c.pressure === "sanity");
      flush();
    },
    onFloats(listener) {
      listeners.push(listener);
    },
  };
}

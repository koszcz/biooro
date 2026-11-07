// Fallout: faked Tasks that return two days later, and the hours a Fallout Task costs.
import { FRIDAY, type GameEvent, type GameState, type OpenTask } from "./state";

export const FALLOUT_DELAY_DAYS = 2;
export const FALLOUT_DO_HOURS = 4;

/** Queues a faked Task to return as Fallout. Fallout that would arrive after Friday never arrives. */
export function queueFallout(state: GameState, task: OpenTask): GameState {
  const dueDay = state.day + FALLOUT_DELAY_DAYS;
  if (dueDay > FRIDAY) return state;
  const pending = { id: task.id, dueDay, ...(task.strange && { strange: task.strange }) };
  return { ...state, pendingFallout: [...state.pendingFallout, pending] };
}

/** Morning step 6: moves the Fallout due today into the open list, in arrival order. */
export function deliverFallout(state: GameState): { state: GameState; events: GameEvent[] } {
  const due = state.pendingFallout.filter((pending) => pending.dueDay === state.day);
  const arrived: OpenTask[] = due.map(({ id, strange }) => ({ id, fallout: true, ...(strange && { strange }) }));
  return {
    state: {
      ...state,
      openTasks: [...state.openTasks, ...arrived],
      pendingFallout: state.pendingFallout.filter((pending) => pending.dueDay !== state.day),
    },
    events: arrived.map((task) => ({ type: "falloutArrived", task })),
  };
}

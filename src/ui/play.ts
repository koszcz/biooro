// The player's Workday actions, sent to the store. Task choices resolve at once until Task actions play out.
import type { OpenTask } from "../rules";
import type { GameStore } from "../store";
import type { Pick } from "./choices";

export interface Play {
  /** Starts an available Task choice. A locked pick does nothing. */
  pick(task: OpenTask, pick: Pick): void;
  takeBreak(): void;
  /** Goes home, or returns "confirm" while Tasks are open and the player has not confirmed. */
  goHome(options?: { confirmed?: boolean }): "confirm" | "done";
}

export function createPlay(store: GameStore): Play {
  return {
    pick(task, pick) {
      if (pick.locked !== null || store.state.phase.kind !== "workday") return;
      store.chooseTask(task, pick.choice, pick.colleague);
      // The "Task actions in the office" ticket moves this call into the scene, after the walk and clip.
      store.finishTaskAction();
    },
    takeBreak() {
      if (store.state.phase.kind !== "workday" || store.state.hoursLeft < 1) return;
      store.takeBreak();
    },
    goHome(options) {
      if (store.state.openTasks.length > 0 && !options?.confirmed) return "confirm";
      if (store.state.phase.kind === "workday") store.goHome();
      return "done";
    },
  };
}

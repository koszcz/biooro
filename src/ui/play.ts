// The player's Workday actions, sent to the store. Input is locked while a Task action plays out.
import type { OpenTask } from "../rules";
import type { GameStore } from "../store";
import type { Acting } from "./acting";
import type { Pick } from "./choices";

export interface Play {
  /** Starts an available Task choice. The scene finishes it. A locked pick does nothing. */
  pick(task: OpenTask, pick: Pick): void;
  takeBreak(): void;
  /** Goes home, or returns "confirm" while Tasks are open and the player has not confirmed. */
  goHome(options?: { confirmed?: boolean }): "confirm" | "done";
}

export function createPlay(store: GameStore, acting: Acting): Play {
  const canAct = () => store.state.phase.kind === "workday" && !acting.playing;
  return {
    pick(task, pick) {
      if (pick.locked !== null || !canAct()) return;
      acting.expect(store.state);
      store.chooseTask(task, pick.choice, pick.colleague);
    },
    takeBreak() {
      if (!canAct() || store.state.hoursLeft < 1) return;
      acting.takeBreak(() => store.takeBreak());
    },
    goHome(options) {
      if (acting.playing) return "done";
      if (store.state.openTasks.length > 0 && !options?.confirmed) return "confirm";
      if (canAct()) store.goHome();
      return "done";
    },
  };
}

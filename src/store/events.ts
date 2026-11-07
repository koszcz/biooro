// Every event the store emits, and a typed emitter for them.
import type { CastId } from "../content/index";
import type { ColleagueId, GameEvent, OpenTask, TaskChoice } from "../rules/index";

export type StoreEvent =
  | GameEvent
  | { type: "taskActionStarted"; task: OpenTask; choice: TaskChoice; colleague?: ColleagueId; hours: number }
  | { type: "taskActionFinished"; task: OpenTask }
  | { type: "conversationStarted"; person: CastId; scripted: boolean }
  | { type: "conversationEnded"; person: CastId };

export type StoreEventType = StoreEvent["type"];
export type StoreEventOf<K extends StoreEventType> = Extract<StoreEvent, { type: K }>;
export type Listener<K extends StoreEventType> = (event: StoreEventOf<K>) => void;

export class Emitter {
  private readonly listeners = new Map<StoreEventType, Set<(event: StoreEvent) => void>>();

  /** Calls `listener` for each event of this type. Returns a function that unsubscribes. */
  on<K extends StoreEventType>(type: K, listener: Listener<K>): () => void {
    const set = this.listeners.get(type) ?? new Set();
    const wrapped = listener as (event: StoreEvent) => void;
    set.add(wrapped);
    this.listeners.set(type, set);
    return () => set.delete(wrapped);
  }

  emit(event: StoreEvent): void {
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
  }
}

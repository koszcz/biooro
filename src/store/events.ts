// Every event the store emits, and a typed emitter for them.
import type { Assigner } from "../content/index";
import type { ColleagueId, GameEvent, OpenTask, TaskChoice } from "../rules/index";

/** Anyone the Intern can talk to, or who leads a scripted scene. */
export type Person = Exclude<Assigner, "anyone">;

export type StoreEvent =
  | GameEvent
  | { type: "taskActionStarted"; task: OpenTask; choice: TaskChoice; colleague?: ColleagueId; hours: number }
  | { type: "taskActionFinished"; task: OpenTask }
  | { type: "conversationStarted"; person: Person; scripted: boolean }
  | { type: "conversationEnded"; person: Person };

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

// The game store: the only way other folders change state. It applies rule results, autosaves and emits events.

import { COLLEAGUES } from "../content/index";
import {
  type AuditAnswer,
  answerAudit,
  applyBreak,
  applyTaskChoice,
  type ColleagueId,
  endDay,
  type GameEvent,
  type GameState,
  goHome,
  newGame,
  type OpenTask,
  type RuleResult,
  startDay,
  type TaskChoice,
  taskChoiceHours,
} from "../rules/index";
import { Emitter, type Listener, type Person, type StoreEvent, type StoreEventType } from "./events";

function isColleague(person: Person): person is ColleagueId {
  return person in COLLEAGUES;
}

import {
  type DayStartSnapshot,
  readSave,
  readSettings,
  SAVE_KEY,
  type SaveStorage,
  type Settings,
  writeSave,
  writeSettings,
} from "./save";

interface TaskAction {
  task: OpenTask;
  /** The Task choice's events, held until the scene finishes the action. */
  events: GameEvent[];
}

export class GameStore {
  private action: TaskAction | null = null;
  private conversation: { person: Person; scripted: boolean } | null = null;
  private current: GameState = newGame();
  private inkStateJson: string | null = null;
  private snapshot: DayStartSnapshot | null = null;
  private readonly emitter = new Emitter();

  private currentSettings: Settings;

  constructor(private readonly storage: SaveStorage) {
    this.currentSettings = readSettings(storage);
  }

  get state(): GameState {
    return this.current;
  }

  /** The Ink state JSON from the last Conversation end, retry or load. `null` before any Conversation. */
  get inkState(): string | null {
    return this.inkStateJson;
  }

  on<K extends StoreEventType>(type: K, listener: Listener<K>): () => void {
    return this.emitter.on(type, listener);
  }

  /**
   * Loads the save slot. Returns false when there is nothing to continue.
   * `loadInk` gets the saved Ink state JSON. If it throws, the save is discarded.
   */
  continueGame(loadInk: (inkStateJson: string | null) => void = () => {}): boolean {
    const record = readSave(this.storage);
    if (!record) return false;
    try {
      loadInk(record.inkState);
    } catch {
      this.storage.removeItem(SAVE_KEY);
      return false;
    }
    this.current = record.state;
    this.inkStateJson = record.inkState;
    this.snapshot = record.snapshot;
    // A save taken at the click of the last Task choice has 0 hours left.
    this.endDayIfOutOfHours();
    return true;
  }

  /** Starts a new game and overwrites the save slot. */
  startOver(): void {
    this.current = newGame();
    this.inkStateJson = null;
    this.snapshot = null;
    this.runMorning();
  }

  /** Applies the whole Task choice and autosaves. Holds every event but `taskActionStarted`. */
  chooseTask(task: OpenTask, choice: TaskChoice, colleague?: ColleagueId): void {
    if (this.action) throw new Error("A Task action is already playing out.");
    const hours = taskChoiceHours(task, choice);
    const result = applyTaskChoice(this.current, task, choice, colleague);
    this.current = result.state;
    this.action = { task, events: result.events };
    this.autosave();
    this.emitter.emit({ type: "taskActionStarted", task, choice, ...(colleague && { colleague }), hours });
  }

  /** Emits the held events and `taskActionFinished`, then any Firing, or the end-of-day steps at 0 hours. */
  finishTaskAction(): void {
    const action = this.action;
    if (!action) throw new Error("No Task action is playing out.");
    this.action = null;
    const firing = action.events.filter((event) => event.type === "fired");
    this.emitAll({ events: action.events.filter((event) => event.type !== "fired") });
    this.emitter.emit({ type: "taskActionFinished", task: action.task });
    this.emitAll({ events: firing });
    this.endDayIfOutOfHours();
  }

  /** Applies the Break and autosaves. A Break that spends the last hour ends the day. */
  takeBreak(): void {
    const result = applyBreak(this.current);
    this.current = result.state;
    this.autosave();
    this.emitAll(result);
    this.endDayIfOutOfHours();
  }

  /** Sets the hours left to 0 and runs the end-of-day steps. */
  goHome(): void {
    const result = goHome(this.current);
    this.current = result.state;
    this.emitAll(result);
    this.runEndOfDay();
  }

  private endDayIfOutOfHours(): void {
    if (this.current.phase.kind === "workday" && this.current.hoursLeft === 0) this.runEndOfDay();
  }

  /** End-of-day steps 1 to 4, the autosave at step 5, then the next morning unless the day stopped. */
  private runEndOfDay(): void {
    const result = endDay(this.current);
    this.current = result.state;
    this.autosave();
    this.emitAll(result);
    if (this.current.phase.kind === "workday") this.runMorning();
  }

  /** Emits `conversationStarted`. The store does not autosave until the Conversation ends. */
  startConversation(person: Person, scripted: boolean): void {
    this.conversation = { person, scripted };
    this.emitter.emit({ type: "conversationStarted", person, scripted });
  }

  /** Marks the Colleague as talked today, stores the Ink state JSON, autosaves and emits `conversationEnded`. */
  endConversation(inkStateJson: string): void {
    const conversation = this.conversation;
    if (!conversation) throw new Error("No Conversation is in progress.");
    this.conversation = null;
    const { person, scripted } = conversation;
    if (!scripted && isColleague(person) && !this.current.talkedToday.includes(person)) {
      this.current = { ...this.current, talkedToday: [...this.current.talkedToday, person] };
    }
    this.inkStateJson = inkStateJson;
    this.autosave();
    this.emitter.emit({ type: "conversationEnded", person });
  }

  /** Applies the Friday audit answer. A finished week removes the save, so Continue goes away. */
  answerAudit(answer: AuditAnswer): void {
    const result = answerAudit(this.current, answer);
    this.current = result.state;
    if (this.current.phase.kind === "weekSurvived") this.storage.removeItem(SAVE_KEY);
    else this.autosave();
    this.emitAll(result);
  }

  get settings(): Settings {
    return this.currentSettings;
  }

  updateSettings(changes: Partial<Settings>): void {
    this.currentSettings = { ...this.currentSettings, ...changes };
    writeSettings(this.storage, this.currentSettings);
  }

  /** Restores the day-start snapshot, both GameState and Ink state. The morning steps do not run again. */
  retry(): void {
    if (!this.snapshot) throw new Error("There is no day-start snapshot to retry.");
    this.action = null;
    this.conversation = null;
    this.current = this.snapshot.state;
    this.inkStateJson = this.snapshot.inkState;
    this.autosave();
    this.emitter.emit({ type: "dayStarted", day: this.current.day });
  }

  /** Morning steps 1 to 10. A morning Firing stops before step 8, so the last snapshot stays. */
  private runMorning(): void {
    const result = startDay(this.current);
    this.current = result.state;
    if (this.current.phase.kind === "workday") {
      this.snapshot = { state: result.state, inkState: this.inkStateJson };
    }
    this.autosave();
    this.emitAll(result);
  }

  /** Saves the slot, except inside a Conversation. */
  private autosave(): void {
    if (this.conversation) return;
    writeSave(this.storage, { state: this.current, inkState: this.inkStateJson, snapshot: this.snapshot });
  }

  private emitAll(result: RuleResult | { events: StoreEvent[] }): void {
    for (const event of result.events) this.emitter.emit(event);
  }
}

export function createStore(storage: SaveStorage): GameStore {
  return new GameStore(storage);
}

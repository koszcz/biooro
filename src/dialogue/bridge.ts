// Runs Ink knots with inkjs and binds the seven game functions to the store.
import { Story } from "inkjs";
import type { CastId } from "../content/index";
import { PRESSURES, type Pressure, tierOf } from "../rules/index";
import type { GameStore } from "../store/index";
import { ConversationCaps } from "./caps";

export interface DialogueLine {
  text: string;
  tags: string[];
  /** The line's `#id:` tag, without the `id:`. */
  id: string | null;
}

export interface DialogueChoice {
  index: number;
  text: string;
  tags: string[];
  id: string | null;
}

export interface DialogueOptions {
  /** Throw when a Colleague Conversation breaks a Conversation cap. On in development and tests. */
  strict?: boolean;
  /** Replaces each line and choice's English text, such as with its Polish text by id. */
  translate?: (id: string | null, english: string) => string;
}

function idOf(tags: string[]): string | null {
  const tag = tags.find((name) => name.startsWith("id:"));
  return tag ? tag.slice("id:".length).trim() : null;
}

function toPressure(name: unknown): Pressure {
  const pressure = PRESSURES.find((known) => known === name);
  if (!pressure) throw new Error(`Ink named an unknown Pressure: ${String(name)}.`);
  return pressure;
}

export class Dialogue {
  private readonly story: Story;
  private readonly strict: boolean;
  private readonly translate: (id: string | null, english: string) => string;
  /** The Ink state JSON the story last matched in the store. */
  private knownInkState: string | null = null;
  private caps: ConversationCaps | null = null;
  private running = false;

  constructor(
    private readonly store: GameStore,
    storyJson: string | Record<string, unknown>,
    options: DialogueOptions = {},
  ) {
    this.story = new Story(typeof storyJson === "string" ? storyJson : JSON.stringify(storyJson));
    this.strict = options.strict ?? import.meta.env.DEV;
    this.translate = options.translate ?? ((_id, english) => english);
    this.bindReads();
    this.bindWrites();
  }

  /** True from `start()` until `end()`, or until a Firing ends the Conversation. */
  get active(): boolean {
    return this.running;
  }

  /** Checks a saved Ink state for `GameStore.continueGame`. Throws if Ink cannot load it. */
  readonly loadInk = (inkStateJson: string | null): void => {
    if (inkStateJson === null) return;
    new Story(this.story.ToJson() ?? "").state.LoadJson(inkStateJson);
  };

  /** Starts a Conversation or scripted scene at `knot`. Caps apply only when `scripted` is false. */
  start(person: CastId, knot: string, scripted: boolean): void {
    if (this.running) throw new Error("A Conversation is already running.");
    this.syncInkState();
    this.story.ChoosePathString(knot);
    this.caps = scripted ? null : new ConversationCaps(knot);
    this.running = true;
    this.store.startConversation(person, scripted);
  }

  get canContinue(): boolean {
    return this.running && this.story.canContinue;
  }

  get choices(): DialogueChoice[] {
    if (!this.running || this.story.canContinue) return [];
    return this.story.currentChoices.map((choice) => {
      const id = idOf(choice.tags ?? []);
      return { index: choice.index, text: this.translate(id, choice.text), tags: choice.tags ?? [], id };
    });
  }

  /** Runs to the next line with text, and skips empty ones. Each write applies at once. */
  continue(): DialogueLine {
    if (!this.canContinue) throw new Error("The Conversation has no next line.");
    let line = this.step();
    while (this.running && line.text === "" && this.story.canContinue) line = this.step();
    return line;
  }

  /** Runs one line, then the Firing check. A Firing ends the Conversation at once. */
  private step(): DialogueLine {
    const line = this.nextLine();
    const inkState = this.story.state.toJson();
    if (this.store.checkFiring(inkState)) this.finish(inkState);
    return line;
  }

  /** True when the knot has no more lines or choices. The player may still be reading the last line. */
  get finished(): boolean {
    return this.running && !this.story.canContinue && this.story.currentChoices.length === 0;
  }

  /** Ends a finished Conversation, after the player reads its last line. */
  end(): void {
    if (!this.finished) throw new Error("The Conversation has not reached its end.");
    const inkState = this.story.state.toJson();
    this.store.endConversation(inkState);
    this.finish(inkState);
  }

  /** True when the story holds a knot with this name. */
  hasKnot(name: string): boolean {
    return this.story.KnotContainerWithName(name) !== null;
  }

  choose(index: number): void {
    if (!this.running || this.story.canContinue) throw new Error("There is no choice to make now.");
    this.story.ChooseChoiceIndex(index);
  }

  /** Reads every line of a knot outside a Conversation, such as a brush-off. Its writes throw. */
  readLines(knot: string): DialogueLine[] {
    if (this.running) throw new Error("A Conversation is already running.");
    this.syncInkState();
    this.story.ChoosePathString(knot);
    const lines: DialogueLine[] = [];
    while (this.story.canContinue) {
      const line = this.nextLine();
      if (line.text !== "") lines.push(line);
    }
    if (this.story.currentChoices.length > 0) throw new Error(`Knot "${knot}" offers choices outside a Conversation.`);
    return lines;
  }

  private nextLine(): DialogueLine {
    const text = (this.story.Continue() ?? "").trim();
    const tags = this.story.currentTags ?? [];
    const id = idOf(tags);
    return { text: text === "" ? text : this.translate(id, text), tags, id };
  }

  private finish(inkState: string): void {
    this.knownInkState = inkState;
    this.running = false;
    this.caps = null;
  }

  /** Loads the store's Ink state when it differs from the story's, such as after a retry or a load. */
  private syncInkState(): void {
    const saved = this.store.inkState;
    if (saved === this.knownInkState) return;
    if (saved === null) this.story.ResetState();
    else this.story.state.LoadJson(saved);
    this.knownInkState = saved;
  }

  private bindReads(): void {
    const store = this.store;
    this.story.BindExternalFunction("pressure", (name: unknown) => store.state.pressures[toPressure(name)], true);
    this.story.BindExternalFunction("tier", () => tierOf(store.state.escalation), true);
    this.story.BindExternalFunction("flag", (name: unknown) => store.state.flags.includes(String(name)), true);
    this.story.BindExternalFunction("day", () => store.state.day, true);
  }

  private bindWrites(): void {
    this.story.BindExternalFunction(
      "adjust",
      (name: unknown, delta: unknown) => {
        const pressure = toPressure(name);
        if (this.strict) this.caps?.adjust(pressure, Number(delta));
        this.store.adjust(pressure, Number(delta));
      },
      false,
    );
    this.story.BindExternalFunction("set_flag", (name: unknown) => this.store.setFlag(String(name)), false);
    this.story.BindExternalFunction(
      "escalate",
      () => {
        if (this.strict) this.caps?.escalate();
        this.store.escalate();
      },
      false,
    );
  }
}

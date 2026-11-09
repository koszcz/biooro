// Runs a click on a person: a Colleague Conversation, or a brush-off for a used-up Colleague or a Boss.
import { CAST, type CastId, COLLEAGUES } from "../content/index";
import type { ColleagueId } from "../rules/index";
import type { GameStore } from "../store/index";
import type { Dialogue, DialogueChoice, DialogueLine } from "./bridge";

/** Who says a line. Head office never appears, so its lines sit at the top of the screen. */
export type Speaker = CastId | "intern" | "headOffice";

/** What a click on a person offers: a Conversation, a brush-off after it, or a Boss's brush-off. */
export type Availability = "available" | "held" | "boss";

/** The DOM side of a Conversation. Each promise resolves when the player moves on. */
export interface ConversationView {
  say(speaker: Speaker, text: string): Promise<void>;
  /** Shows the choices and resolves with the index the player picks. */
  choose(choices: readonly string[]): Promise<number>;
  brushOff(person: CastId, text: string): void;
  /** Locks the overlays while the Intern walks to `person` for a Conversation. `conversationEnded` unlocks them. */
  approach(person: CastId): void;
}

/** The office side of a Conversation. */
export interface ConversationStage {
  /** Walks the Intern to the first free cell beside the person. Clicks on the office do nothing until the Conversation ends. */
  walkBeside(person: CastId): Promise<void>;
  /** Turns the two to face each other. Returns a function that turns the person back. */
  faceEachOther(person: CastId): () => void;
}

/** `#speaker:intern`, `#speaker:headOffice`, or a cast member such as `#speaker:ryszard` in a scene with two people. */
const SPEAKERS: readonly Speaker[] = ["intern", "headOffice", ...CAST];

function speakerOf(line: DialogueLine, partner: CastId): Speaker {
  for (const tag of line.tags) {
    const speaker = SPEAKERS.find((name) => tag.trim() === `speaker:${name}`);
    if (speaker) return speaker;
  }
  return partner;
}

const isColleague = (person: CastId): person is ColleagueId => person in COLLEAGUES;

/** The knot of a Colleague's Conversation on a day, such as `wiola_day1`. */
export const conversationKnot = (colleague: ColleagueId, day: number): string => `${colleague}_day${day}`;
export const brushOffKnot = (person: CastId): string => `${person}_brush_off`;
export const handOffKnot = (colleague: ColleagueId): string => `${colleague}_hand_off`;

/** The line a Colleague says when the Intern hands them a Task. */
export function readHandOffLine(dialogue: Dialogue, colleague: ColleagueId): DialogueLine {
  const knot = handOffKnot(colleague);
  const [line] = dialogue.readLines(knot);
  if (!line) throw new Error(`Knot "${knot}" has no line.`);
  return line;
}

export class Conversations {
  private running = false;

  constructor(
    private readonly store: GameStore,
    private readonly dialogue: Dialogue,
    private readonly stage: ConversationStage,
    private readonly view: ConversationView,
  ) {}

  /** True from the click on a Colleague until their Conversation ends. */
  get busy(): boolean {
    return this.running;
  }

  /** Ryszard has no Monday knot, because the Monday onboarding is his Monday Conversation. */
  availability(person: CastId): Availability {
    if (!isColleague(person)) return "boss";
    const { talkedToday, day } = this.store.state;
    if (talkedToday.includes(person) || !this.dialogue.hasKnot(conversationKnot(person, day))) return "held";
    return "available";
  }

  /** Locks input at the click and walks the Intern over. The Conversation starts on arrival. Resolves when it ends. */
  async click(person: CastId): Promise<void> {
    if (this.running || this.dialogue.active || this.store.state.phase.kind !== "workday") return;
    if (this.availability(person) !== "available" || !isColleague(person)) {
      const [line] = this.dialogue.readLines(brushOffKnot(person));
      if (line) this.view.brushOff(person, line.text);
      return;
    }
    this.running = true;
    try {
      const knot = conversationKnot(person, this.store.state.day);
      this.view.approach(person);
      await this.stage.walkBeside(person);
      const turnBack = this.stage.faceEachOther(person);
      this.dialogue.start(person, knot, false);
      await playDialogue(this.dialogue, this.view, person);
      turnBack();
    } finally {
      this.running = false;
    }
  }
}

/**
 * Plays lines and choices until the Conversation or scene ends. The Intern says a chosen text before
 * Ink runs its writes. `picked` hears each chosen choice.
 */
export async function playDialogue(
  dialogue: Dialogue,
  view: ConversationView,
  partner: CastId,
  picked: (choice: DialogueChoice) => void = () => {},
): Promise<void> {
  while (dialogue.active) {
    if (dialogue.canContinue) {
      const line = dialogue.continue();
      if (line.text !== "") await view.say(speakerOf(line, partner), line.text);
    } else if (dialogue.finished) dialogue.end();
    else {
      const choices = dialogue.choices;
      const choice = choices[await view.choose(choices.map((option) => option.text))];
      await view.say("intern", choice.text);
      picked(choice);
      dialogue.choose(choice.index);
    }
  }
}

// Runs a click on a person: a Colleague Conversation, or a brush-off for a used-up Colleague or a Boss.
import { COLLEAGUES } from "../content/index";
import type { ColleagueId } from "../rules/index";
import type { GameStore, Person } from "../store/index";
import type { Dialogue, DialogueChoice, DialogueLine } from "./bridge";

/** Who says a line. Head office never appears, so its lines sit at the top of the screen. */
export type Speaker = Person | "intern" | "headOffice";

/** What a click on a person offers: a Conversation, a brush-off after it, or a Boss's brush-off. */
export type Availability = "talk" | "talked" | "boss";

/** The DOM side of a Conversation. Each promise resolves when the player moves on. */
export interface TalkView {
  say(speaker: Speaker, text: string): Promise<void>;
  /** Shows the choices and resolves with the index the player picks. */
  choose(choices: readonly string[]): Promise<number>;
  brushOff(person: Person, text: string): void;
  /** Locks the overlays while the Intern walks to `person` for a Conversation. `conversationEnded` unlocks them. */
  approach(person: Person): void;
}

/** The office side of a Conversation. */
export interface TalkStage {
  /** Walks the Intern to the first free cell beside the person. Clicks on the office do nothing until the Conversation ends. */
  walkBeside(person: Person): Promise<void>;
  /** Turns the two to face each other. Returns a function that turns the person back. */
  faceEachOther(person: Person): () => void;
}

const SPEAKER_TAGS: Readonly<Record<string, Speaker>> = {
  "speaker:intern": "intern",
  "speaker:headOffice": "headOffice",
};

function speakerOf(line: DialogueLine, partner: Person): Speaker {
  for (const tag of line.tags) {
    const speaker = SPEAKER_TAGS[tag.trim()];
    if (speaker) return speaker;
  }
  return partner;
}

const isColleague = (person: Person): person is ColleagueId => person in COLLEAGUES;

/** The knot of a Colleague's Conversation on a day, such as `wiola_day1`. */
export const conversationKnot = (colleague: ColleagueId, day: number): string => `${colleague}_day${day}`;
export const brushOffKnot = (person: Person): string => `${person}_brush_off`;

export class Conversations {
  private running = false;

  constructor(
    private readonly store: GameStore,
    private readonly dialogue: Dialogue,
    private readonly stage: TalkStage,
    private readonly view: TalkView,
  ) {}

  /** True from the click on a Colleague until their Conversation ends. */
  get busy(): boolean {
    return this.running;
  }

  /** Ryszard has no Monday knot, because the Monday onboarding is his Monday Conversation. */
  availability(person: Person): Availability {
    if (!isColleague(person)) return "boss";
    const { talkedToday, day } = this.store.state;
    if (talkedToday.includes(person) || !this.dialogue.hasKnot(conversationKnot(person, day))) return "talked";
    return "talk";
  }

  /** Locks input at the click and walks the Intern over. The Conversation starts on arrival. Resolves when it ends. */
  async click(person: Person): Promise<void> {
    if (this.running || this.dialogue.active || this.store.state.phase.kind !== "workday") return;
    if (this.availability(person) !== "talk" || !isColleague(person)) {
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
  view: TalkView,
  partner: Person,
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

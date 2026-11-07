// English Task wording, keyed by Task ID. The type checker fails if a Task has no wording.
// Each line shows in a speech bubble over its assigner, or over the Intern for "anyone" Tasks.
import type { StrangeTaskId, TaskId } from "../../content/index";

// A strange Task takes over whichever slot came last that morning, so its assigner and Task side vary.
// Its wording names no assigner and reads the same from anyone.
export const STRANGE_TASK_WORDING: Record<StrangeTaskId, string> = {
  "tue-strange":
    'A customer says her Smart seat greeted her by name. Check the seat in Room 4 for a "greeting" setting.',
  "wed-strange": 'A man writes that his Smart seat told him to "drink more water". He lives alone. Reply to him.',
  "thu-strange": "Since nine, the printer has printed a stranger's resting heart rate on every page. Make it stop.",
};

export const TASK_WORDING: Record<TaskId, string> = {
  "mon-zbigniew": "Print fifty of our new feedback moment forms, would you? Such a lovely shade of beige.",
  "mon-anyone": "Wash the department's mugs. One of them has a dried teabag stuck to the bottom.",
  "tue-halina": "Put last week's Smart range complaints on the evidence shelf. Initial every page. It's for the file.",
  "tue-zbigniew": "Let's give those old Smart range feedback moments a fresh start. The shredder is right there.",
  "tue-anyone": "Water the plant by the window. Nobody remembers whose it is.",
  "wed-kamil":
    "Print these forty complaints for my binder. Read them. They all say the seat was warm before they sat down.",
  "wed-wiola": "Wipe down the Smart seat in Room 4 before the demo, please. Oh, and happy almost-birthday!",
  "wed-ryszard":
    "Close these thirty Smart range complaints with Template 12. Don't read them. Reading only slows you down.",
  "thu-halina": "Sign this statement saying you warned Pan Zbigniew. Then shelve it with the others. For the file.",
  "thu-zbigniew": "Wonderful news! Pani Halina's folder is ready for recycling. The shredder, when you have a moment.",
  "thu-kamil": "Test the seat in Room 4 with me. Sit down, say nothing, and write down what it says back.",
  "thu-anyone": "The plant by the window has turned to face Room 4. Turn it back.",
  "fri-zbigniew":
    "Everything is perfect for Head office today. Everything. Empty the complaints drawer into the shredder, please.",
  "fri-halina": "Box up the evidence shelf for Head office. If anyone asks, you packed it. Not me.",
  "fri-wiola": "Make Room 4 lovely for Head office. The seat asked for fresh flowers. It told me your favourite.",
  "fri-ryszard": 'Print Template 1 for Head office. It says "No issues found". It has said that for nineteen years.',
};

/** The Tasks whose Fallout can return: the Monday to Wednesday slots and the 3 strange swap Tasks. */
export type ReturningTaskId = Extract<TaskId, `mon-${string}` | `tue-${string}` | `wed-${string}`> | StrangeTaskId;

// A Fallout Task is the faked Task coming back two days later. It keeps the original's assigner.
export const FALLOUT_WORDING: Record<`${ReturningTaskId}.fallout`, string> = {
  "mon-zbigniew.fallout": "Our feedback moment forms came out blank! What a fun chance to print all fifty again.",
  "mon-anyone.fallout": "The mugs are back, and the teabag has grown something. Scrub every mug properly this time.",
  "tue-halina.fallout":
    "Last week's Smart range complaints never reached the shelf. I have noted that. Shelve them now and initial every page twice.",
  "tue-zbigniew.fallout":
    "Those Smart range feedback moments came back to us! Let's shred them again, slowly and thoroughly.",
  "tue-anyone.fallout": "The plant by the window is dying. Water it properly this time. Maybe apologise to it.",
  "wed-kamil.fallout":
    "My binder is missing forty pages. You never printed them. Print them again, and this time read them.",
  "wed-wiola.fallout":
    "The demo seat in Room 4 was sticky. It told me it felt hurt. Clean it properly, please, for both of us.",
  "wed-ryszard.fallout": "Those thirty complaints came back reopened. Template 12 again, but sign each one by hand.",
  "tue-strange.fallout":
    "The customer writes again. Her Smart seat now greets her guests by name. Check the seat in Room 4 again.",
  "wed-strange.fallout":
    "The man who lives alone writes again. His Smart seat now thanks him for drinking more water. Reply to him properly.",
  "thu-strange.fallout":
    "The printer is printing the stranger's heart rate again. It is faster now. Fix the printer properly this time.",
};

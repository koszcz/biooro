// String tables for every line the player reads, in the language that `LANGUAGE` picks at load.
import * as en from "./en/index";
import { LANGUAGE } from "./language";
import * as pl from "./pl/index";

export type { ReturningTaskId } from "./en/tasks";
export { LANGUAGE, LANGUAGE_KEY, LANGUAGES, type Language, pickLanguage } from "./language";

const table = LANGUAGE === "pl" ? pl : en;

export const actionText = table.actionText;
export const PRESSURE_FLOATS = table.PRESSURE_FLOATS;
export const MUTE_LABELS = table.MUTE_LABELS;
export const HOVER_LABELS = table.HOVER_LABELS;
export const PRESSURE_CHANGE_LABELS = table.PRESSURE_CHANGE_LABELS;
export const SPEAKER_NAMES = table.SPEAKER_NAMES;
export const ASSIGNER_NAMES = table.ASSIGNER_NAMES;
export const DELEGATE_NOTES = table.DELEGATE_NOTES;
export const EFFECT_CHIPS = table.EFFECT_CHIPS;
export const endCardText = table.endCardText;
export const GAUGE_LABELS = table.GAUGE_LABELS;
export const hudText = table.hudText;
export const SIDE_LABELS = table.SIDE_LABELS;
export const TASK_CHOICE_LABELS = table.TASK_CHOICE_LABELS;
export const WEEKDAY_NAMES = table.WEEKDAY_NAMES;
export const billboardText = table.billboardText;
export const loadingText = table.loadingText;
export const officeSigns = table.officeSigns;
export const LOCKED_REASONS = table.LOCKED_REASONS;
export const sceneTitles = table.sceneTitles;
export const titleText = table.titleText;
export const FALLOUT_WORDING = table.FALLOUT_WORDING;
export const STRANGE_TASK_WORDING = table.STRANGE_TASK_WORDING;
export const TASK_WORDING = table.TASK_WORDING;

/** The text of one Ink line in the game language. English lines, and lines with no id, stay as Ink wrote them. */
export function storyLine(id: string | null, english: string): string {
  if (LANGUAGE !== "pl" || id === null) return english;
  return pl.STORY_LINES[id] ?? english;
}

/** The button that switches to the other language, written in that language. */
export const LANGUAGE_SWITCH = LANGUAGE === "pl" ? { to: "en", label: "English" } : { to: "pl", label: "Polski" };

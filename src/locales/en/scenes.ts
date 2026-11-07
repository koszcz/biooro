// English text for the title screen and the title cards of the scripted scenes. Placeholder wording for review.
import type { SceneKnot } from "../../dialogue/index";

export const titleText = {
  gameTitle: "Biooro",
  continueButton: "Continue",
  newGameButton: "New game",
  newGameConfirm: "Start a new game? This replaces your saved game.",
  newGameConfirmYes: "Start a new game",
  newGameConfirmNo: "Back",
} as const;

/** The title card in the top letterbox bar of each scripted scene, by the scene's Ink knot. */
export const sceneTitles: Readonly<Record<SceneKnot, string>> = {
  onboarding: "Monday 9:00 · Onboarding",
  firing_performance: "Fired · Performance hit 0",
  firing_launchTeam: "Fired · Launch Team goodwill hit 0",
  firing_paperTrail: "Fired · Paper Trail goodwill hit 0",
  firing_sanity: "Fired · Sanity hit 0",
  audit: "Friday 14:00 · The audit",
  survival_launchTeam: "Friday evening",
  survival_paperTrail: "Friday evening",
  survival_equal: "Friday evening",
};

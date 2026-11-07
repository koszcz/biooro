// English text for the title screen and the title cards of the scripted scenes. Placeholder wording for review.

type Pressure = "performance" | "launchTeam" | "paperTrail" | "sanity";
type SurvivalVariant = "launchTeam" | "paperTrail" | "equal";

export const titleText = {
  gameTitle: "Biooro",
  continueButton: "Continue",
  newGameButton: "New game",
  newGameConfirm: "Start a new game? This replaces your saved game.",
  newGameConfirmYes: "Start a new game",
  newGameConfirmNo: "Back",
} as const;

/** The title card in the top letterbox bar of each scripted scene. */
export const sceneTitles = {
  onboarding: "Monday 9:00 · Onboarding",
  firing: {
    performance: "Fired · Performance hit 0",
    launchTeam: "Fired · Launch Team goodwill hit 0",
    paperTrail: "Fired · Paper Trail goodwill hit 0",
    sanity: "Fired · Sanity hit 0",
  } satisfies Record<Pressure, string>,
  audit: "Friday 14:00 · The audit",
  survival: {
    launchTeam: "Friday evening",
    paperTrail: "Friday evening",
    equal: "Friday evening",
  } satisfies Record<SurvivalVariant, string>,
} as const;

// Polish text for the title screen and the title cards of the scripted scenes.
import type * as en from "../en/scenes";
import type { Strings } from "../strings";

export const titleText: Strings<typeof en.titleText> = {
  gameTitle: "Biooro",
  continueButton: "Kontynuuj",
  newGameButton: "Nowa gra",
  newGameConfirm: "Zacząć nową grę? Nowa gra zastąpi zapisaną.",
  newGameConfirmYes: "Zacznij nową grę",
  newGameConfirmNo: "Wróć",
};

export const sceneTitles: Strings<typeof en.sceneTitles> = {
  onboarding: "Poniedziałek 9:00 · Wdrożenie",
  firing_performance: "Zwolnienie · Wyniki spadły do 0",
  firing_launchTeam: "Zwolnienie · Przychylność Zespołu Premiery spadła do 0",
  firing_paperTrail: "Zwolnienie · Przychylność Papierowego Śladu spadła do 0",
  firing_sanity: "Zwolnienie · Psychika spadła do 0",
  audit: "Piątek 14:00 · Audyt",
  survival_launchTeam: "Piątek wieczorem",
  survival_paperTrail: "Piątek wieczorem",
  survival_equal: "Piątek wieczorem",
};

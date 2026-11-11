// Polish text for the HUD, Task bubbles, the Task choice popover and the day card.
// Labels that hold a name put it after a colon, so no name needs a Polish case ending.
import type { Pressure } from "../../rules/index";
import type * as en from "../en/hud";
import type { Strings } from "../strings";

export const GAUGE_LABELS: Strings<typeof en.GAUGE_LABELS> = {
  performance: "Wyniki",
  launchTeam: "Premiera",
  paperTrail: "Papiery",
  sanity: "Psychika",
};

export const EFFECT_CHIPS = Object.fromEntries(
  Object.entries(GAUGE_LABELS).map(([pressure, label]) => [pressure, (change: string) => `${change} ${label}`]),
) as Record<Pressure, (change: string) => string>;

export const TASK_CHOICE_LABELS: Strings<typeof en.TASK_CHOICE_LABELS> = {
  do: "Zrób to",
  fake: "Ściemnij",
  delegate: "Przekaż komuś",
  sabotage: "Sabotuj",
};

export const ASSIGNER_NAMES: Strings<typeof en.ASSIGNER_NAMES> = {
  zbigniew: "Pan Zbigniew",
  halina: "Pani Halina",
  ryszard: "Ryszard",
  wiola: "Wiola",
  kamil: "Kamil",
  anyone: "Ktokolwiek",
};

export const SIDE_LABELS: Strings<typeof en.SIDE_LABELS> = {
  launchTeam: "Zespół Premiery",
  paperTrail: "Papierowy Ślad",
  none: "Niczyje",
};

export const DELEGATE_NOTES: Strings<typeof en.DELEGATE_NOTES> = {
  ryszard: {
    launchTeam: "Ściemni je. Za 2 dni wróci jako Rykoszet.",
    paperTrail: "Ściemni je. Za 2 dni wróci jako Rykoszet.",
    none: "Ściemni je. Za 2 dni wróci jako Rykoszet.",
  },
  wiola: {
    launchTeam: "Zrobi je porządnie.",
    paperTrail: "Zrobi je porządnie.",
    none: "Zrobi je porządnie.",
  },
  kamil: {
    launchTeam: "Zgłosi je do Papierowego Śladu.",
    paperTrail: "Zrobi je porządnie.",
    none: "Przekaże je Papierowemu Śladowi.",
  },
};

export const WEEKDAY_NAMES: Strings<typeof en.WEEKDAY_NAMES> = {
  1: "Poniedziałek",
  2: "Wtorek",
  3: "Środa",
  4: "Czwartek",
  5: "Piątek",
};

export const hudText: Strings<typeof en.hudText> = {
  hoursLeft: (hours) => `${hours} h`,
  choiceHours: (hours) => `${hours} h`,
  breakButton: "Przerwa",
  goHomeButton: "Do domu",
  goHomeConfirm: "Masz jeszcze otwarte Zadania. Iść mimo to do domu?",
  goHomeConfirmYes: "Idę do domu",
  goHomeConfirmNo: "Zostaję",
  nobodyWantsAnything: "Nikt niczego nie chce",
  pickColleague: "Komu to przekazać?",
  nobodyWillTakeIt: "Nikt tego nie weźmie",
  close: "Zamknij",
  morePill: (count, name) => `+${count} więcej · ${name}`,
  pillFallout: (count) => `⚠ ${count}`,
  backToList: "Wróć",
  taskListTitle: (name) => `Zadania · ${name}`,
  fallout: "Rykoszet",
  startDay: "Zacznij dzień",
};

export const endCardText: Strings<typeof en.endCardText> = {
  fired: {
    performance: "Wyniki spadły do 0",
    launchTeam: "Przychylność Zespołu Premiery spadła do 0",
    paperTrail: "Przychylność Papierowego Śladu spadła do 0",
    sanity: "Psychika spadła do 0",
  },
  firedTitle: "Zwolnienie",
  retryThisDay: "Powtórz ten dzień",
  retryYesterday: "Powtórz wczorajszy dzień",
  startOver: "Zacznij od nowa",
  survivedTitle: "Tydzień przetrwany",
};

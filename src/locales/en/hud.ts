// English text for the HUD, Task bubbles, the Task choice popover and the day card.
import type { Assigner, ColleagueId, Faction } from "../../content/index";

type Pressure = "performance" | "launchTeam" | "paperTrail" | "sanity";
type TaskChoice = "do" | "fake" | "delegate" | "sabotage";

/** The short gauge labels from the spec's "Pressures and hours" section. */
export const GAUGE_LABELS: Record<Pressure, string> = {
  performance: "Perf",
  launchTeam: "Launch",
  paperTrail: "Paper",
  sanity: "Sanity",
};

/** One effect chip per Pressure, such as "+1 Perf". `change` already carries its sign. */
export const EFFECT_CHIPS: Record<Pressure, (change: string) => string> = {
  performance: (change) => `${change} Perf`,
  launchTeam: (change) => `${change} Launch`,
  paperTrail: (change) => `${change} Paper`,
  sanity: (change) => `${change} Sanity`,
};

export const TASK_CHOICE_LABELS: Record<TaskChoice, string> = {
  do: "Do it",
  fake: "Fake it",
  delegate: "Delegate it",
  sabotage: "Sabotage it",
};

export const ASSIGNER_NAMES: Record<Assigner, string> = {
  zbigniew: "Pan Zbigniew",
  halina: "Pani Halina",
  ryszard: "Ryszard",
  wiola: "Wiola",
  kamil: "Kamil",
  anyone: "Anyone",
};

export const SIDE_LABELS: Record<Faction | "none", string> = {
  launchTeam: "Launch Team",
  paperTrail: "Paper Trail",
  none: "No side",
};

/** One line per Colleague on what they do with a delegated Task. Kamil's line depends on the Task side. */
export const DELEGATE_NOTES: Record<ColleagueId, Record<Faction | "none", string>> = {
  ryszard: {
    launchTeam: "He fakes it. It comes back as Fallout in 2 days.",
    paperTrail: "He fakes it. It comes back as Fallout in 2 days.",
    none: "He fakes it. It comes back as Fallout in 2 days.",
  },
  wiola: {
    launchTeam: "She does it properly.",
    paperTrail: "She does it properly.",
    none: "She does it properly.",
  },
  kamil: {
    launchTeam: "He escalates it to the Paper Trail.",
    paperTrail: "He does it properly.",
    none: "He hands it to the Paper Trail.",
  },
};

export const WEEKDAY_NAMES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
};

export const hudText = {
  hoursLeft: (hours: number) => `${hours}h`,
  choiceHours: (hours: number) => `${hours}h`,
  breakButton: "Break",
  goHomeButton: "Go home",
  goHomeConfirm: "You still have open Tasks. Go home anyway?",
  goHomeConfirmYes: "Go home",
  goHomeConfirmNo: "Stay",
  nobodyWantsAnything: "Nobody wants anything",
  pickColleague: "Pick a Colleague",
  nobodyWillTakeIt: "Nobody will take it",
  close: "Close",
  morePill: (count: number, name: string) => `+${count} more from ${name}`,
  pillFallout: (count: number) => `⚠ ${count}`,
  backToList: "Back",
  taskListTitle: (name: string) => `Tasks from ${name}`,
  fallout: "Fallout",
  startDay: "Start the day",
} as const;

/** Plain placeholder cards for the end of the week. The scripted scenes replace them later. */
export const endCardText = {
  fired: {
    performance: "Performance hit 0",
    launchTeam: "Launch Team goodwill hit 0",
    paperTrail: "Paper Trail goodwill hit 0",
    sanity: "Sanity hit 0",
  } satisfies Record<Pressure, string>,
  firedTitle: "Fired",
  retryThisDay: "Retry this day",
  retryYesterday: "Retry yesterday",
  startOver: "Start over",
  auditTitle: "The Friday audit",
  auditAnswers: { bury: "Bury", escalate: "Escalate", deflect: "Deflect" },
  survivedTitle: "You survived the week",
} as const;

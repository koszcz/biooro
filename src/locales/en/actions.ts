// English text for Task actions in the office: the tag over the Intern, sparkles and floats.
import type { Pressure } from "../../rules/index";

export const actionText = {
  /** Before the title of the Task whose action is playing. */
  busy: "⏳",
  looksDone: "✨ looks done",
  /** The sabotage tag. Only the player sees it. */
  secret: "🤫",
} as const;

/** One float per Pressure change, such as "+1 Performance". `change` already carries its sign. */
export const PRESSURE_FLOATS: Record<Pressure, (change: string) => string> = {
  performance: (change) => `${change} Performance`,
  launchTeam: (change) => `${change} Launch Team`,
  paperTrail: (change) => `${change} Paper Trail`,
  sanity: (change) => `${change} Sanity`,
};

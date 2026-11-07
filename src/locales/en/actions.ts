// English text for Task actions in the office: the tag over the Intern, sparkles, hand-off lines and floats.
import type { ColleagueId } from "../../content/index";

type Pressure = "performance" | "launchTeam" | "paperTrail" | "sanity";

export const actionText = {
  /** Before the title of the Task whose action is playing. */
  busy: "⏳",
  looksDone: "✨ looks done",
  /** The sabotage tag. Only the player sees it. */
  secret: "🤫",
} as const;

/**
 * Placeholder hand-off lines. The "Brush-offs and hand-off lines" ticket moves them into Ink.
 */
export const HAND_OFF_LINES: Record<ColleagueId, string> = {
  ryszard: "Sure. Sure sure sure.",
  wiola: "On it! Love this for you.",
  kamil: "Oh, I will handle this.",
};

/** One float per Pressure change, such as "+1 Performance". `change` already carries its sign. */
export const PRESSURE_FLOATS: Record<Pressure, (change: string) => string> = {
  performance: (change) => `${change} Performance`,
  launchTeam: (change) => `${change} Launch Team`,
  paperTrail: (change) => `${change} Paper Trail`,
  sanity: (change) => `${change} Sanity`,
};

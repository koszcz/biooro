// English text for Conversations: speaker names, hover labels and the Pressure change labels.
import type { CastId } from "../../content/index";
import type { Pressure } from "../../rules/index";

/** The heading on a speech bubble. Polish names stay as they are. */
export const SPEAKER_NAMES: Record<CastId | "intern" | "headOffice", string> = {
  intern: "You",
  zbigniew: "Pan Zbigniew",
  halina: "Pani Halina",
  ryszard: "Ryszard",
  wiola: "Wiola",
  kamil: "Kamil",
  headOffice: "Head office",
};

/** The label under a person's head when the pointer is over them. */
export const HOVER_LABELS = {
  talk: (name: string) => `💬 Talk to ${name}`,
  talked: (name: string) => `${name} · talked today`,
  boss: (name: string) => `${name} · busy (Boss)`,
} as const;

/** The label that floats up beside the gauges when a Conversation moves a Pressure. */
export const PRESSURE_CHANGE_LABELS: Record<Pressure, (signedAmount: string) => string> = {
  performance: (amount) => `${amount} Performance`,
  launchTeam: (amount) => `${amount} Launch Team`,
  paperTrail: (amount) => `${amount} Paper Trail`,
  sanity: (amount) => `${amount} Sanity`,
};

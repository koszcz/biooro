// Polish text for Task actions in the office: the tag over the Intern, sparkles and floats.
import type * as en from "../en/actions";
import type { Strings } from "../strings";

export const actionText: Strings<typeof en.actionText> = {
  busy: "⏳",
  looksDone: "✨ wygląda na zrobione",
  secret: "🤫",
};

export const PRESSURE_FLOATS: Strings<typeof en.PRESSURE_FLOATS> = {
  performance: (change) => `${change} Wyniki`,
  launchTeam: (change) => `${change} Zespół Premiery`,
  paperTrail: (change) => `${change} Papierowy Ślad`,
  sanity: (change) => `${change} Psychika`,
};

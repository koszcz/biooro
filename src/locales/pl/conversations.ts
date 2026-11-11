// Polish text for Conversations: speaker names, hover labels and the Pressure change labels.
// The labels put the name after a colon or a dot, so no name needs a Polish case ending.
import type * as en from "../en/conversations";
import type { Strings } from "../strings";
import { PRESSURE_FLOATS } from "./actions";

export const SPEAKER_NAMES: Strings<typeof en.SPEAKER_NAMES> = {
  intern: "Ty",
  zbigniew: "Pan Zbigniew",
  halina: "Pani Halina",
  ryszard: "Ryszard",
  wiola: "Wiola",
  kamil: "Kamil",
  headOffice: "Centrala",
};

export const HOVER_LABELS: Strings<typeof en.HOVER_LABELS> = {
  available: (name) => `💬 Porozmawiaj: ${name}`,
  held: (name) => `${name} · rozmowa już dziś była`,
  boss: (name) => `${name} · brak czasu (kierownictwo)`,
};

export const PRESSURE_CHANGE_LABELS: Strings<typeof en.PRESSURE_CHANGE_LABELS> = PRESSURE_FLOATS;

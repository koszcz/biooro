// Polish text on signs in the office, and on the loading screen.
import type * as en from "../en/office";
import type { Strings } from "../strings";

export const officeSigns: Strings<typeof en.officeSigns> = {
  launchTeam: ["ZESPÓŁ", "PREMIERY"],
  weLoveFeedback: ["KOCHAMY", "FEEDBACK"],
  inWriting: ["UWAGA", "WSZYSTKO", "NA PIŚMIE"],
  smartRange: ["SERIA", "SMART"],
  itListens: ["Ona słucha.", "Ty już nie musisz."],
  complaints: ["Dział Reklamacji"],
  safety: ["Bezpieczeństwo Produktu"],
  showroom: ["Salon"],
};

// "Słuchamy" is the same word Head office uses in the audit: "Centrala zawsze słucha."
export const billboardText: Strings<typeof en.billboardText> = {
  mundane: ["BIOORO", "Słuchamy Twojego ciała,", "spłukanie po spłukaniu."],
  odd: ["BIOORO", "Słuchamy Twojego ciała.", "Każde spłukanie. Zawsze."],
  wrong: ["BIOORO", "CAŁY CZAS", "SŁUCHAMY"],
};

export const loadingText: Strings<typeof en.loadingText> = {
  label: "Wczytywanie biura…",
};

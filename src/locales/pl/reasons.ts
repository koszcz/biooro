// Polish text for each reason a Task choice or Break is locked.
import type * as en from "../en/reasons";
import type { Strings } from "../strings";

export const LOCKED_REASONS: Strings<typeof en.LOCKED_REASONS> = {
  notEnoughHours: "Za mało godzin do końca dnia.",
  alreadyFaked: "To zadanie już raz było ściemnione.",
  ryszardAlreadyFaked: "Ryszard już raz to ściemnił.",
  ryszardDoesntTrust: "Ryszard jeszcze ci nie ufa",
  wiolaDoesntTrust: "Wiola jeszcze ci nie ufa",
  kamilDoesntTrust: "Kamil jeszcze ci nie ufa",
};

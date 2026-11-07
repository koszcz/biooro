// English text for each reason a Task choice or Break is locked.
import type { LockedReason } from "../../content/index";

export const LOCKED_REASONS: Record<LockedReason, string> = {
  notEnoughHours: "Not enough hours left today.",
  ryszardDoesntTrust: "Ryszard doesn't trust you yet",
  wiolaDoesntTrust: "Wiola doesn't trust you yet",
  kamilDoesntTrust: "Kamil doesn't trust you yet",
};

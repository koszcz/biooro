// English Task wording, keyed by Task ID. The type checker fails if a Task has no wording.
// These are placeholders. The "Task wording" ticket writes the real lines.
import type { StrangeTaskId, TaskId } from "../../content/index";

export const STRANGE_TASK_WORDING: Record<StrangeTaskId, string> = {
  "tue-strange": "Placeholder: Tuesday's strange Smart range Task.",
  "wed-strange": "Placeholder: Wednesday's strange Smart range complaint.",
  "thu-strange": "Placeholder: Thursday's strange Smart range Task.",
};

export const TASK_WORDING: Record<TaskId, string> = {
  "mon-zbigniew": "Placeholder: Pan Zbigniew's Monday Task.",
  "mon-anyone": "Placeholder: an unclaimed Monday Task.",
  "tue-halina": "Placeholder: Pani Halina's Tuesday Task.",
  "tue-zbigniew": "Placeholder: Pan Zbigniew's Tuesday Task.",
  "tue-anyone": "Placeholder: an unclaimed Tuesday Task.",
  "wed-kamil": "Placeholder: Kamil's Wednesday Task.",
  "wed-wiola": "Placeholder: Wiola's Wednesday Task.",
  "wed-ryszard": "Placeholder: Ryszard's Wednesday Task.",
  "thu-halina": "Placeholder: Pani Halina's Thursday Task.",
  "thu-zbigniew": "Placeholder: Pan Zbigniew's Thursday Task.",
  "thu-kamil": "Placeholder: Kamil's Thursday Task.",
  "thu-anyone": "Placeholder: an unclaimed Thursday Task.",
  "fri-zbigniew": "Placeholder: Pan Zbigniew's Friday Task.",
  "fri-halina": "Placeholder: Pani Halina's Friday Task.",
  "fri-wiola": "Placeholder: Wiola's Friday Task.",
  "fri-ryszard": "Placeholder: Ryszard's Friday Task.",
};

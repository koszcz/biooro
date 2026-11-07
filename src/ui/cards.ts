// Plain full-screen cards: the day card between days, and placeholders for the end of the week.
// The scripted scenes replace the end-of-week cards later.
import { endCardText, hudText, WEEKDAY_NAMES } from "../locales";
import type { AuditAnswer, GameState } from "../rules";
import type { GameStore } from "../store";
import { button, el } from "./dom";

export interface Cards {
  /** Shows the day card for the day that just started. */
  showDay(day: number): void;
  /** Shows an end-of-week card when the phase leaves the Workday. Returns true while any card shows. */
  render(state: GameState): boolean;
}

const AUDIT_ANSWERS: AuditAnswer[] = ["bury", "escalate", "deflect"];

export function createCards(root: HTMLElement, store: GameStore, onDismiss: () => void): Cards {
  const card = el("div", "hud-card");
  card.hidden = true;
  card.addEventListener("pointerdown", (event) => event.stopPropagation());
  root.append(card);
  let dayCard: number | null = null;

  function show(title: string, subtitle: string | null, buttons: HTMLButtonElement[]): void {
    const row = el("div", "buttons");
    row.append(...buttons);
    card.replaceChildren(el("div", "", title), ...(subtitle ? [el("div", "sub", subtitle)] : []), row);
    card.hidden = false;
  }

  function endCard(state: GameState): boolean {
    const phase = state.phase;
    if (phase.kind === "fired") {
      const retry = phase.retry === "thisDay" ? endCardText.retryThisDay : endCardText.retryYesterday;
      show(endCardText.firedTitle, endCardText.fired[phase.pressure], [
        button(retry, () => store.retry()),
        button(endCardText.startOver, () => store.startOver()),
      ]);
    } else if (phase.kind === "audit") {
      const answers = AUDIT_ANSWERS.map((answer) =>
        button(endCardText.auditAnswers[answer], () => store.answerAudit(answer)),
      );
      show(endCardText.auditTitle, null, answers);
    } else if (phase.kind === "weekSurvived") {
      show(endCardText.survivedTitle, null, [button(endCardText.startOver, () => store.startOver())]);
    } else return false;
    return true;
  }

  return {
    showDay(day) {
      dayCard = day;
    },
    render(state) {
      if (endCard(state)) return true;
      if (dayCard !== null && dayCard === state.day) {
        const name = WEEKDAY_NAMES[state.day as keyof typeof WEEKDAY_NAMES];
        show(name, null, [
          button(hudText.startDay, () => {
            dayCard = null;
            card.hidden = true;
            onDismiss();
          }),
        ]);
        return true;
      }
      card.hidden = true;
      return false;
    },
  };
}

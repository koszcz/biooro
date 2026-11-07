// Plain full-screen cards: the day card between days, the screen after a Firing scene, and the card
// after the survival scene. The scene frame hides them while a scripted scene plays.
import { endCardText, hudText, WEEKDAY_NAMES } from "../locales/index";
import type { GameState } from "../rules/index";
import type { GameStore } from "../store/index";
import { button, el } from "./dom";

export interface Cards {
  /** Shows the day card for the day that just started. */
  showDay(day: number): void;
  /** Shows the card for a phase outside the Workday. Returns true while the Workday is paused. */
  render(state: GameState): boolean;
}

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
      // The audit scene asks the question. Nothing else shows until it ends.
      card.hidden = true;
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

// The "…" badges over Colleagues, the hover label under a head, and the gauge floats during a Conversation.
import { type CastId, COLLEAGUES, type ColleagueId } from "../content/index";
import type { Availability } from "../dialogue/index";
import type { GameStore } from "../store/index";
import { type ConversationLayer, type ConversationOffice, element } from "./conversationLayer";
import { FLOAT_DURATION_MS, PERSON_COLOURS, PRESSURE_COLOURS } from "./conversationStyles";
import { hoverLabel, pressureChangeLabel } from "./conversationText";

const COLLEAGUE_IDS = Object.keys(COLLEAGUES) as ColleagueId[];
const BADGE_LIFT = -6;
const HOVER_DROP = 8;

/**
 * Mounts the marks. From the click until a Conversation ends, the container carries `data-conversation` with the
 * partner's ID, so other overlays can hide or fade their own elements. The marks clear it when it ends.
 * Returns a function that connects the marks to whatever knows who still has a Conversation today.
 */
export function mountConversationMarks(
  container: HTMLElement,
  layer: ConversationLayer,
  office: ConversationOffice,
  store: GameStore,
): (availability: (person: CastId) => Availability) => void {
  let availability: ((person: CastId) => Availability) | undefined;

  const badges = new Map<ColleagueId, HTMLElement>();
  for (const id of COLLEAGUE_IDS) {
    const badge = element("div", "conversation-badge", PERSON_COLOURS[id]);
    badge.textContent = "…";
    badges.set(id, badge);
    layer.anchor(badge, id, BADGE_LIFT);
  }
  const refreshBadges = () => {
    for (const [id, badge] of badges) badge.classList.toggle("used", availability?.(id) !== "available");
  };
  store.on("dayStarted", refreshBadges);

  let hoverEl: HTMLElement | undefined;
  office.onPersonHover((person) => {
    if (hoverEl) layer.remove(hoverEl);
    hoverEl = undefined;
    const offer = person && availability?.(person);
    if (!person || !offer) return;
    hoverEl = element(
      "div",
      `conversation-hover${offer === "available" ? "" : " unavailable"}`,
      PERSON_COLOURS[person],
    );
    hoverEl.textContent = hoverLabel(person, offer);
    layer.anchor(hoverEl, person, HOVER_DROP);
  });

  // Floats show only during a Conversation. Task choices float their own changes.
  let inConversation = false;
  store.on("conversationStarted", ({ person }) => {
    inConversation = true;
    container.dataset.conversation = person;
  });
  store.on("conversationEnded", () => {
    inConversation = false;
    delete container.dataset.conversation;
    refreshBadges();
  });
  store.on("pressureChanged", ({ pressure, from, to }) => {
    const label = inConversation && pressureChangeLabel(pressure, from, to, store.state.day);
    if (!label) return;
    const float = element("div", "conversation-float", PRESSURE_COLOURS[pressure]);
    float.textContent = label;
    layer.root.append(float);
    setTimeout(() => float.remove(), FLOAT_DURATION_MS);
  });

  return (source) => {
    availability = source;
    refreshBadges();
  };
}

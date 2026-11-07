// The "…" badges over Colleagues, the hover label under a head, and the gauge floats during a Conversation.
import { type CastId, COLLEAGUES, type ColleagueId } from "../content/index";
import type { Availability } from "../dialogue/index";
import type { GameStore } from "../store/index";
import { element, type TalkLayer, type TalkOffice } from "./talkLayer";
import { FLOAT_DURATION_MS, PERSON_COLOURS, PRESSURE_COLOURS } from "./talkStyles";
import { hoverLabel, pressureChangeLabel } from "./talkText";

const COLLEAGUE_IDS = Object.keys(COLLEAGUES) as ColleagueId[];
const BADGE_LIFT = -6;
const HOVER_DROP = 8;

/**
 * Mounts the marks. While a Conversation runs, the container carries `data-conversation` with the
 * partner's ID, so other overlays can hide or fade their own elements.
 * Returns a function that connects the marks to whatever knows who still has a Conversation today.
 */
export function mountTalkMarks(
  container: HTMLElement,
  layer: TalkLayer,
  office: TalkOffice,
  store: GameStore,
): (availability: (person: CastId) => Availability) => void {
  let availability: ((person: CastId) => Availability) | undefined;

  const badges = new Map<ColleagueId, HTMLElement>();
  for (const id of COLLEAGUE_IDS) {
    const badge = element("div", "talk-badge", PERSON_COLOURS[id]);
    badge.textContent = "…";
    badges.set(id, badge);
    layer.anchor(badge, id, BADGE_LIFT);
  }
  const refreshBadges = () => {
    for (const [id, badge] of badges) badge.classList.toggle("used", availability?.(id) !== "talk");
  };
  store.on("dayStarted", refreshBadges);

  let hoverEl: HTMLElement | undefined;
  office.onPersonHover((person) => {
    if (hoverEl) layer.remove(hoverEl);
    hoverEl = undefined;
    const offer = person && availability?.(person);
    if (!person || !offer) return;
    hoverEl = element("div", `talk-hover${offer === "talk" ? "" : " unavailable"}`, PERSON_COLOURS[person]);
    hoverEl.textContent = hoverLabel(person, offer);
    layer.anchor(hoverEl, person, HOVER_DROP);
  });

  // Floats show only during a Conversation. Task choices float their own changes.
  let talking = false;
  store.on("conversationStarted", ({ person }) => {
    talking = true;
    container.dataset.conversation = person;
  });
  store.on("conversationEnded", () => {
    talking = false;
    delete container.dataset.conversation;
    refreshBadges();
  });
  store.on("pressureChanged", ({ pressure, from, to }) => {
    const label = talking && pressureChangeLabel(pressure, from, to, store.state.day);
    if (!label) return;
    const float = element("div", "talk-float", PRESSURE_COLOURS[pressure]);
    float.textContent = label;
    layer.root.append(float);
    setTimeout(() => float.remove(), FLOAT_DURATION_MS);
  });

  return (source) => {
    availability = source;
    refreshBadges();
  };
}

// The overlay layer that keeps Conversation elements over people's heads as the office moves.
import type { CastId } from "../content/index";
import { CONVERSATION_CSS, CONVERSATION_FOCUS_CSS } from "./conversationStyles";

/** What the overlay needs from the office scene. */
export interface ConversationOffice {
  onFrame(listener: () => void): void;
  onPersonHover(listener: (person: CastId | undefined) => void): void;
  headAt(who: CastId | "intern"): { x: number; y: number };
}

export type Head = CastId | "intern";

export interface ConversationLayer {
  readonly root: HTMLElement;
  /** Adds `el` and keeps it `dy` pixels from the head of `who`. */
  anchor(el: HTMLElement, who: Head, dy: number): void;
  remove(el: HTMLElement): void;
}

export function element(tag: string, className: string, colour?: string): HTMLElement {
  const el = document.createElement(tag);
  el.className = className;
  if (colour) el.style.setProperty("--c", colour);
  return el;
}

export function createConversationLayer(container: HTMLElement, office: ConversationOffice): ConversationLayer {
  const style = document.createElement("style");
  style.textContent = CONVERSATION_CSS + CONVERSATION_FOCUS_CSS;
  const root = element("div", "conversation-layer");
  container.append(style, root);

  const anchored = new Map<HTMLElement, { who: Head; dy: number }>();
  const place = (el: HTMLElement) => {
    const at = anchored.get(el);
    if (!at) return;
    const point = office.headAt(at.who);
    el.style.left = `${point.x}px`;
    el.style.top = `${point.y + at.dy}px`;
  };
  office.onFrame(() => {
    for (const el of anchored.keys()) place(el);
  });

  return {
    root,
    anchor(el, who, dy) {
      anchored.set(el, { who, dy });
      root.append(el);
      place(el);
    },
    remove(el) {
      anchored.delete(el);
      el.remove();
    },
  };
}

// The Conversation overlay: speech bubbles, choices and brush-offs, plus the marks in talkMarks.ts.
import type { CastId } from "../content/index";
import type { Availability, Speaker, TalkView } from "../dialogue/index";
import { SPEAKER_NAMES } from "../locales/index";
import type { GameStore } from "../store/index";
import { createTalkLayer, element, type TalkOffice } from "./talkLayer";
import { mountTalkMarks } from "./talkMarks";
import { BRUSH_OFF_MS, SPEAKER_COLOURS } from "./talkStyles";
import { revealedLength } from "./talkText";

export interface TalkOverlay {
  readonly view: TalkView;
  /** Connects the overlay to whatever knows who still has a Conversation today. */
  connect(availability: (person: CastId) => Availability): void;
}

/** Bubbles sit this many pixels above a head, clear of the "…" badge. */
const BUBBLE_LIFT = -26;

/**
 * Reveals `text` at the reveal pace. A click, Space or Enter completes the line, and the next one moves on.
 * Listening starts after the current event, so the click that opened the line never counts.
 */
function reveal(target: HTMLElement, text: string, onShown?: (from: number, to: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    let complete = false;
    let blipped = 0;
    const finish = () => {
      complete = true;
      target.textContent = text;
      target.classList.add("done");
    };
    const tick = () => {
      if (complete) return;
      const shown = revealedLength(performance.now() - started, text.length);
      if (shown >= text.length) finish();
      else {
        onShown?.(blipped, shown);
        blipped = shown;
        target.textContent = text.slice(0, shown);
        requestAnimationFrame(tick);
      }
    };
    const press = (event: Event) => {
      if (event instanceof KeyboardEvent && event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      event.stopPropagation();
      if (!complete) return finish();
      window.removeEventListener("pointerdown", press, true);
      window.removeEventListener("keydown", press, true);
      resolve();
    };
    setTimeout(() => {
      window.addEventListener("pointerdown", press, true);
      window.addEventListener("keydown", press, true);
    });
    tick();
  });
}

/** Called as a line is revealed: how many characters of `text` were shown before and now. */
export type RevealListener = (speaker: Speaker, text: string, from: number, to: number) => void;

export function mountTalk(
  container: HTMLElement,
  office: TalkOffice,
  store: GameStore,
  onReveal?: RevealListener,
): TalkOverlay {
  const layer = createTalkLayer(container, office);
  const connect = mountTalkMarks(container, layer, office, store);

  const bubble = (speaker: Speaker, extra = "") => {
    const el = element("div", `talk-say${extra}`, SPEAKER_COLOURS[speaker]);
    const name = element("b", "");
    name.textContent = SPEAKER_NAMES[speaker];
    el.append(name);
    return el;
  };
  const show = (el: HTMLElement, speaker: Speaker) => {
    if (speaker === "headOffice") layer.root.append(el);
    else layer.anchor(el, speaker, BUBBLE_LIFT);
  };

  let brushOff: HTMLElement | undefined;
  const view: TalkView = {
    async say(speaker, text) {
      const el = bubble(speaker, speaker === "headOffice" ? " head-office" : "");
      const body = element("span", "text");
      el.append(body);
      show(el, speaker);
      await reveal(body, text, (from, to) => onReveal?.(speaker, text, from, to));
      layer.remove(el);
    },
    choose(choices) {
      const list = element("div", "talk-choices");
      const buttons = choices.map((text, index) => {
        const button = document.createElement("button");
        const number = document.createElement("i");
        number.textContent = String(index + 1);
        button.append(number, text);
        list.append(button);
        return button;
      });
      layer.anchor(list, "intern", BUBBLE_LIFT);
      return new Promise((resolve) => {
        const pick = (index: number) => {
          window.removeEventListener("keydown", key, true);
          layer.remove(list);
          resolve(index);
        };
        const key = (event: KeyboardEvent) => {
          const index = Number(event.key) - 1;
          if (!buttons[index]) return;
          event.preventDefault();
          pick(index);
        };
        buttons.forEach((button, index) => {
          button.addEventListener("pointerdown", (event) => event.stopPropagation());
          button.addEventListener("click", () => pick(index));
        });
        window.addEventListener("keydown", key, true);
      });
    },
    brushOff(person, text) {
      if (brushOff) layer.remove(brushOff);
      const el = bubble(person, " brush-off");
      el.append(text);
      layer.anchor(el, person, BUBBLE_LIFT);
      brushOff = el;
      setTimeout(() => layer.remove(el), BRUSH_OFF_MS);
    },
  };

  return { view, connect };
}

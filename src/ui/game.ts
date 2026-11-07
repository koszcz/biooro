// Mounts the playable HUD: Task bubbles, the Task choice popover, gauges, hour blocks and the day card.
import type { GameStore, StoreEventType } from "../store";
import { createBubbles, type HeadLocator } from "./bubbles";
import { createCards } from "./cards";
import { el } from "./dom";
import { createHud } from "./hud";
import type { BubbleOwner, Preview } from "./hudView";
import { createPlay } from "./play";
import { createPopover } from "./popover";
import { HUD_CSS } from "./styles";

/** Every store event that changes what the HUD shows. */
const REDRAW_ON: StoreEventType[] = [
  "dayStarted",
  "dayEnded",
  "hoursChanged",
  "pressureChanged",
  "taskAssigned",
  "falloutArrived",
  "taskResolved",
  "taskActionFinished",
  "fired",
  "weekSurvived",
];

export type { BubbleOwner, HeadLocator };

/** Mounts the HUD over `container`. Mount it before the first morning, so it sees Monday's `dayStarted`. */
export function mountGameUi(container: HTMLElement, store: GameStore, headAt: HeadLocator): void {
  const style = el("style", "", HUD_CSS);
  const root = el("div", "hud");
  container.append(style, root);
  const play = createPlay(store);
  let confirming = false;
  let revealGoodwill = false;
  let preview: Preview | undefined;
  let queued = false;

  const bubbles = createBubbles(
    root,
    headAt,
    (task, over) => {
      popover.open(task, over);
      redraw();
    },
    (over) => {
      popover.openList(over);
      redraw();
    },
  );
  const cards = createCards(root, store, () => redraw());
  const hud = createHud(root, {
    takeBreak: () => act(() => play.takeBreak()),
    goHome: () => {
      confirming = play.goHome() === "confirm";
      if (!confirming) popover.close();
      redraw();
    },
    confirmGoHome: (yes) => {
      confirming = false;
      if (yes) act(() => play.goHome({ confirmed: true }));
      redraw();
    },
  });
  const popover = createPopover(root, headAt, {
    pick: (task, pick) => act(() => play.pick(task, pick)),
    preview: (next) => {
      preview = next;
      hud.renderPreview(store.state, preview);
    },
    closed: () => redraw(),
  });

  function act(command: () => void): void {
    confirming = false;
    command();
    redraw();
  }

  function draw(): void {
    queued = false;
    const state = store.state;
    const carded = cards.render(state);
    if (carded) popover.close();
    hud.render(state, { preview, confirming: confirming && !carded, revealGoodwill });
    hud.hours.hidden = carded;
    revealGoodwill = false;
    bubbles.render(state, !carded, popover.owner);
    popover.render(state);
  }

  function redraw(): void {
    if (queued) return;
    queued = true;
    queueMicrotask(draw);
  }

  for (const type of REDRAW_ON) store.on(type, () => redraw());
  store.on("goodwillRevealed", () => {
    revealGoodwill = true;
    redraw();
  });
  store.on("dayStarted", (event) => {
    cards.showDay(event.day);
    confirming = false;
    redraw();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") popover.close();
  });

  const follow = () => {
    bubbles.follow();
    const rect = (node: HTMLElement) => {
      const box = node.getBoundingClientRect();
      const origin = root.getBoundingClientRect();
      return {
        left: box.left - origin.left,
        top: box.top - origin.top,
        right: box.right - origin.left,
        bottom: box.bottom - origin.top,
      };
    };
    popover.follow({ gauges: rect(hud.gauges), hours: rect(hud.hours) });
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
  draw();
}

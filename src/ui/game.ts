// Mounts the playable HUD: Task bubbles, the Task choice popover, gauges, hour blocks and the day card.
import type { CastId } from "../content/index";
import type { ColleagueId } from "../rules/index";
import type { GameStore, StoreEventType } from "../store/index";
import { createActing } from "./acting";
import { ACTION_CSS, createActionLayer } from "./actionLayer";
import { createBubbles, type HeadLocator } from "./bubbles";
import { createCards } from "./cards";
import { el } from "./dom";
import { createHud } from "./hud";
import type { BubbleOwner, Preview } from "./hudView";
import { createPlay } from "./play";
import { createPopover } from "./popover";
import { HUD_CSS } from "./styles";
import type { RevealListener } from "./talkText";

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

/** What the scene tells the HUD while a Task action plays. */
export type ActionCue =
  | { kind: "drained"; hours: number }
  | { kind: "looksDone"; over: CastId | "intern" }
  | { kind: "handOff"; colleague: ColleagueId };

/**
 * Mounts the HUD over `container`. Mount it before the first morning, so it sees Monday's `dayStarted`.
 * `onActionCue` subscribes to the scene's cues for Task actions. `onReveal` hears hand-off lines as they reveal.
 */
export function mountGameUi(
  container: HTMLElement,
  store: GameStore,
  headAt: HeadLocator,
  onActionCue: (listener: (cue: ActionCue) => void) => void,
  onReveal?: RevealListener,
): void {
  const style = el("style", "", HUD_CSS + ACTION_CSS);
  const root = el("div", "hud");
  container.append(style, root);
  const acting = createActing(store);
  const play = createPlay(store, acting);
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
  const labels = createActionLayer(root, headAt, onReveal);
  const popover = createPopover(root, headAt, {
    pick: (task, pick) => act(() => play.pick(task, pick)),
    preview: (next) => {
      // A closing popover clears its preview, which must not draw the finished result while an action plays.
      if (acting.playing) return;
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
    // While a Task action plays, this is the state from before the click, so the Pressures and any Firing wait.
    const state = acting.shown(store.state);
    const locked = acting.playing;
    const carded = cards.render(state);
    if (carded || locked) popover.close();
    hud.render(state, { preview, confirming: confirming && !carded, revealGoodwill, locked });
    hud.hours.hidden = carded;
    revealGoodwill = false;
    bubbles.render(state, !carded && !locked, popover.owner, acting.busyTask);
    popover.render(state);
    labels.renderTag(acting.tag());
  }

  function redraw(): void {
    if (queued) return;
    queued = true;
    queueMicrotask(draw);
  }

  for (const type of REDRAW_ON) store.on(type, () => redraw());
  // The popover closes while a Task action plays. A Task picked from a list returns to that list afterwards.
  let backToList: BubbleOwner | null = null;
  store.on("taskActionStarted", () => {
    preview = undefined;
    backToList = popover.listOwner;
    popover.close();
    redraw();
  });
  store.on("taskActionFinished", () => {
    if (backToList) popover.openList(backToList);
    backToList = null;
  });
  store.on("dayStarted", () => {
    backToList = null;
  });
  acting.onFloats((floats) => labels.floats(floats));
  onActionCue((cue) => {
    if (cue.kind === "drained") {
      acting.drained(cue.hours);
      redraw();
    } else if (cue.kind === "looksDone") labels.looksDone(cue.over);
    else labels.handOff(cue.colleague);
  });
  store.on("goodwillRevealed", () => {
    revealGoodwill = true;
    redraw();
  });
  store.on("dayStarted", (event) => {
    // On Monday the onboarding title card stands in for the day card.
    if (event.day !== 1) cards.showDay(event.day);
    confirming = false;
    redraw();
  });
  // A Conversation closes any open popover. The talk overlay's CSS fades and hides the bubbles.
  store.on("conversationStarted", () => {
    confirming = false;
    popover.close();
    redraw();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") popover.close();
  });

  const follow = () => {
    bubbles.follow();
    labels.follow();
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

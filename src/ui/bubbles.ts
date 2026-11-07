// Task bubbles: one speech bubble per open Task over its assigner's head, following them every frame.

import { actionText } from "../locales";
import type { GameState, OpenTask } from "../rules";
import { el } from "./dom";
import { type BubbleOwner, bubbleViews } from "./hudView";
import { SIDE_COLOURS } from "./styles";

export type ScreenPoint = { x: number; y: number };
/** Where a person's head is on screen, in pixels from the top left of the overlay. */
export type HeadLocator = (owner: BubbleOwner) => ScreenPoint;

/** The gap between stacked bubbles over one person. */
const STACK_GAP = 12;

export interface Bubbles {
  /** While a Task action plays, every bubble dims and `busy` shows "⏳" before its title. */
  render(state: GameState, enabled: boolean, busy?: OpenTask | null): void;
  /** Moves each bubble over its person's head. Call it every frame. */
  follow(): void;
}

export function createBubbles(
  root: HTMLElement,
  headAt: HeadLocator,
  onOpen: (task: OpenTask, over: BubbleOwner) => void,
): Bubbles {
  const layer = el("div", "hud-bubbles");
  root.append(layer);
  let placed: { node: HTMLElement; over: BubbleOwner }[] = [];

  return {
    render(state, enabled, busy) {
      layer.classList.toggle("dim", Boolean(busy));
      const isBusy = (task: OpenTask) =>
        busy?.id === task.id && busy.fallout === task.fallout && busy.strange === task.strange;
      const views = state.phase.kind === "workday" ? bubbleViews(state) : [];
      placed = views.map((view) => {
        const node = el(
          "div",
          `hud-bubble${view.fallout ? " fallout" : ""}`,
          `${isBusy(view.task) ? `${actionText.busy} ` : ""}${view.fallout ? `⚠ ${view.text}` : view.text}`,
        );
        node.style.setProperty("--c", SIDE_COLOURS[view.border]);
        node.dataset.task = view.task.id;
        node.style.pointerEvents = enabled ? "auto" : "none";
        node.addEventListener("click", (event) => {
          event.stopPropagation();
          onOpen(view.task, view.over);
        });
        return { node, over: view.over };
      });
      layer.replaceChildren(...placed.map((bubble) => bubble.node));
      this.follow();
    },
    follow() {
      const lift = new Map<BubbleOwner, number>();
      for (const { node, over } of placed) {
        const head = headAt(over);
        const offset = lift.get(over) ?? 0;
        node.style.left = `${head.x}px`;
        node.style.top = `${head.y - offset}px`;
        lift.set(over, offset + node.offsetHeight + STACK_GAP);
      }
    },
  };
}

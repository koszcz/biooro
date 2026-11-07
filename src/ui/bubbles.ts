// Task bubbles: speech bubbles over each assigner's head, following them every frame.
// A crowded person shows their two most urgent bubbles and a "+N more" pill. A group slides in from screen edges.
import type { GameState, OpenTask } from "../rules";
import { el } from "./dom";
import { type BubbleGroup, type BubbleOwner, type BubbleView, bubbleGroups, type MorePill } from "./hudView";
import { slideGroupIn } from "./placement";
import { SIDE_COLOURS } from "./styles";

export type ScreenPoint = { x: number; y: number };
/** Where a person's head is on screen, in pixels from the top left of the overlay. */
export type HeadLocator = (owner: BubbleOwner) => ScreenPoint;

/** The gap between stacked bubbles over one person. */
const STACK_GAP = 12;

export interface Bubbles {
  /** `openFor` is whose popover is open, or null. Everyone else's bubbles fade. */
  render(state: GameState, enabled: boolean, openFor: BubbleOwner | null): void;
  /** Moves each bubble over its person's head. Call it every frame. */
  follow(): void;
}

function taskBubble(view: BubbleView, onOpen: (task: OpenTask, over: BubbleOwner) => void): HTMLElement {
  const node = el("div", `hud-bubble${view.fallout ? " fallout" : ""}`, view.fallout ? `⚠ ${view.text}` : view.text);
  node.style.setProperty("--c", SIDE_COLOURS[view.border]);
  node.dataset.task = view.task.id;
  node.addEventListener("click", (event) => {
    event.stopPropagation();
    onOpen(view.task, view.over);
  });
  return node;
}

function pillBubble(group: BubbleGroup, pill: MorePill, onList: (over: BubbleOwner) => void): HTMLElement {
  const node = el("div", "hud-bubble hud-pill", pill.text);
  node.dataset.pill = group.over;
  if (pill.fallout) node.append(el("b", "warn", pill.fallout));
  node.addEventListener("click", (event) => {
    event.stopPropagation();
    onList(group.over);
  });
  return node;
}

export function createBubbles(
  root: HTMLElement,
  headAt: HeadLocator,
  onOpen: (task: OpenTask, over: BubbleOwner) => void,
  onList: (over: BubbleOwner) => void,
): Bubbles {
  const layer = el("div", "hud-bubbles");
  root.append(layer);
  let placed: { node: HTMLElement; over: BubbleOwner }[] = [];

  return {
    render(state, enabled, openFor) {
      const groups = state.phase.kind === "workday" ? bubbleGroups(state) : [];
      placed = groups.flatMap((group) => {
        const nodes = group.bubbles.map((view) => taskBubble(view, onOpen));
        if (group.pill) nodes.push(pillBubble(group, group.pill, onList));
        return nodes.map((node) => {
          node.style.pointerEvents = enabled ? "auto" : "none";
          node.dataset.over = group.over;
          node.classList.toggle("faded", openFor !== null && openFor !== group.over);
          return { node, over: group.over };
        });
      });
      layer.replaceChildren(...placed.map((bubble) => bubble.node));
      this.follow();
    },
    follow() {
      const viewport = { width: root.clientWidth, height: root.clientHeight };
      const owners = [...new Set(placed.map((bubble) => bubble.over))];
      for (const over of owners) {
        const nodes = placed.filter((bubble) => bubble.over === over).map((bubble) => bubble.node);
        const head = headAt(over);
        let offset = 0;
        const tops = nodes.map((node) => {
          const top = offset;
          offset += node.offsetHeight + STACK_GAP;
          return top;
        });
        const slide = slideGroupIn(
          {
            x: head.x,
            bottom: head.y,
            width: Math.max(...nodes.map((node) => node.offsetWidth)),
            height: offset - STACK_GAP,
          },
          viewport,
        );
        nodes.forEach((node, i) => {
          node.style.left = `${head.x + slide.dx}px`;
          node.style.top = `${head.y + slide.dy - tops[i]}px`;
        });
      }
    },
  };
}

// The Task choice popover: the Task text, assigner, side and all four Task choices, beside the assigner.
import { taskById } from "../content";
import { ASSIGNER_NAMES, hudText, SIDE_LABELS } from "../locales";
import type { GameState, OpenTask } from "../rules";
import type { HeadLocator } from "./bubbles";
import { type Chip, type ChoiceView, goodwillVisible, type Pick, taskChoiceViews } from "./choices";
import { button, el } from "./dom";
import type { BubbleOwner, Preview } from "./hudView";
import { taskText } from "./hudView";
import { placePopover, type Rect } from "./placement";
import { PRESSURE_COLOURS, SIDE_COLOURS } from "./styles";

export interface PopoverActions {
  pick(task: OpenTask, pick: Pick): void;
  /** A hovered Task choice to preview, or nothing. */
  preview(preview: Preview | undefined): void;
  closed(): void;
}

export interface Popover {
  open(task: OpenTask, over: BubbleOwner): void;
  close(): void;
  readonly isOpen: boolean;
  /** Redraws the content, or closes when the Task is no longer open. */
  render(state: GameState): void;
  follow(avoid: { gauges: Rect; hours: Rect }): void;
}

function chipElements(chips: Chip[]): HTMLElement[] {
  return chips.map((chip) => {
    const node = el("span", "hud-chip", chip.text);
    node.style.setProperty("--c", PRESSURE_COLOURS[chip.pressure]);
    return node;
  });
}

function rowElement(label: string, pick: Pick, detail: HTMLElement[], hours?: string): HTMLElement {
  const row = el("div", `row${pick.locked === null ? "" : " locked"}`);
  const body = el("div");
  const effects = el("div");
  effects.append(...(pick.locked === null ? chipElements(pick.chips) : [el("span", "reason", pick.locked)]));
  body.append(el("b", "", label), effects, ...detail);
  row.append(body);
  if (hours) row.append(el("span", "", hours));
  return row;
}

export function createPopover(root: HTMLElement, headAt: HeadLocator, actions: PopoverActions): Popover {
  const node = el("div", "hud-pop");
  node.hidden = true;
  node.addEventListener("pointerdown", (event) => event.stopPropagation());
  root.append(node);
  let current: { task: OpenTask; over: BubbleOwner } | null = null;
  let delegateOpen = false;

  function wire(row: HTMLElement, task: OpenTask, pick: Pick): HTMLElement {
    if (pick.locked !== null) return row;
    row.addEventListener("mouseenter", () => actions.preview({ hours: pick.hours, deltas: pick.deltas }));
    row.addEventListener("mouseleave", () => actions.preview(undefined));
    row.addEventListener("click", () => {
      actions.preview(undefined);
      actions.pick(task, pick);
    });
    return row;
  }

  function delegateElements(task: OpenTask, view: ChoiceView, rerender: () => void): HTMLElement[] {
    const hint = view.locked ?? hudText.pickColleague;
    const head = el("div", `row${view.locked === null ? "" : " locked"}`);
    const body = el("div");
    body.append(
      el("b", "", `${view.label} ${delegateOpen ? "▾" : "▸"}`),
      el("div", view.locked === null ? "note" : "reason", hint),
    );
    head.append(body, el("span", "", hudText.choiceHours(view.hours)));
    head.addEventListener("click", () => {
      delegateOpen = !delegateOpen;
      rerender();
    });
    if (!delegateOpen) return [head];
    const rows = (view.rows ?? []).map((row) => {
      const note = row.locked === null ? [el("div", "note", row.note)] : [];
      const line = rowElement(row.name, row, note);
      line.classList.add("sub");
      return wire(line, task, row);
    });
    return [head, ...rows];
  }

  function content(state: GameState, task: OpenTask, rerender: () => void): HTMLElement[] {
    const { assigner, side } = taskById(task.id);
    const who = el("div", "who", ASSIGNER_NAMES[assigner]);
    if (!side || goodwillVisible(state)) {
      const tag = el("span", "hud-side", SIDE_LABELS[side ?? "none"]);
      tag.style.setProperty("--c", SIDE_COLOURS[side ?? "none"]);
      who.append(tag);
    }
    const close = button("×", () => popover.close(), "close");
    close.setAttribute("aria-label", hudText.close);
    const choices = taskChoiceViews(state, task).flatMap((view) =>
      view.rows
        ? delegateElements(task, view, rerender)
        : [wire(rowElement(view.label, view, [], hudText.choiceHours(view.hours)), task, view)],
    );
    return [close, el("div", "title", taskText(task)), who, ...choices];
  }

  const popover: Popover = {
    get isOpen() {
      return current !== null;
    },
    open(task, over) {
      current = { task, over };
      delegateOpen = false;
      node.hidden = false;
    },
    close() {
      if (!current) return;
      current = null;
      node.hidden = true;
      actions.preview(undefined);
      actions.closed();
    },
    render(state) {
      const task = current?.task;
      const stillOpen = state.openTasks.some((open) => open.id === task?.id && open.fallout === task?.fallout);
      if (!task || !stillOpen || state.phase.kind !== "workday") return popover.close();
      node.replaceChildren(...content(state, task, () => popover.render(state)));
    },
    follow(avoid) {
      if (!current) return;
      node.style.height = "auto";
      const place = placePopover({
        anchor: headAt(current.over),
        size: { width: node.offsetWidth, height: node.scrollHeight },
        viewport: { width: root.clientWidth, height: root.clientHeight },
        avoid,
      });
      node.style.left = `${place.left}px`;
      node.style.top = `${place.top}px`;
      node.style.height = `${place.height}px`;
    },
  };
  return popover;
}

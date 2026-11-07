// The Task choice popover: the Task text, assigner, side and all four Task choices, beside the assigner.
import { taskById } from "../content";
import { ASSIGNER_NAMES, hudText, SIDE_LABELS } from "../locales";
import type { GameState, OpenTask } from "../rules";
import type { HeadLocator } from "./bubbles";
import { type Chip, type ChoiceView, goodwillVisible, type Pick, taskChoiceViews } from "./choices";
import { button, el } from "./dom";
import type { BubbleOwner, Preview } from "./hudView";
import { ownerName, taskText, urgentTasks } from "./hudView";
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
  /** Opens the list of one person's Tasks, most urgent first. */
  openList(over: BubbleOwner): void;
  /** Whose popover is open, or null. */
  readonly owner: BubbleOwner | null;
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
  /** A Task view remembers if it came from the list, so it can return there when the Task finishes. */
  type Current = { over: BubbleOwner; task: OpenTask | null; fromList: boolean };
  let current: Current | null = null;
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

  function listContent(state: GameState, over: BubbleOwner, rerender: () => void): HTMLElement[] {
    const close = button("×", () => popover.close(), "close");
    close.setAttribute("aria-label", hudText.close);
    const rows = urgentTasks(state, over).map((view) => {
      const row = el(
        "div",
        `row list-row${view.fallout ? " fallout" : ""}`,
        view.fallout ? `⚠ ${view.text}` : view.text,
      );
      row.dataset.task = view.task.id;
      row.addEventListener("click", () => {
        current = { over, task: view.task, fromList: true };
        delegateOpen = false;
        rerender();
      });
      return row;
    });
    return [close, el("div", "title", hudText.taskListTitle(ownerName(over))), ...rows];
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
    const back = current?.fromList
      ? [
          button(
            hudText.backToList,
            () => {
              if (current) current = { over: current.over, task: null, fromList: false };
              rerender();
            },
            "back",
          ),
        ]
      : [];
    return [close, ...back, el("div", "title", taskText(task)), who, ...choices];
  }

  const popover: Popover = {
    get isOpen() {
      return current !== null;
    },
    get owner() {
      return current?.over ?? null;
    },
    open(task, over) {
      current = { task, over, fromList: false };
      delegateOpen = false;
      node.hidden = false;
    },
    openList(over) {
      current = { task: null, over, fromList: false };
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
      if (!current || state.phase.kind !== "workday") return popover.close();
      const rerender = () => popover.render(state);
      const { task, over, fromList } = current;
      const stillOpen = (open: OpenTask) => state.openTasks.some((t) => t.id === open.id && t.fallout === open.fallout);
      if (task && stillOpen(task)) {
        node.replaceChildren(...content(state, task, rerender));
        return;
      }
      // A finished Task returns to the list, or closes when nothing is left.
      if (task && !fromList) return popover.close();
      if (urgentTasks(state, over).length === 0) return popover.close();
      current = { over, task: null, fromList: false };
      node.replaceChildren(...listContent(state, over, rerender));
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

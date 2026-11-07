// The four Pressure gauges, the 8 hour blocks with Break and "Go home", its confirmation and the empty prompt.
import { hudText } from "../locales";
import type { GameState } from "../rules";
import { button, el } from "./dom";
import { hudView, type Preview } from "./hudView";
import { PRESSURE_COLOURS } from "./styles";

export interface HudActions {
  takeBreak(): void;
  /** The "Go home" button. It may ask for confirmation first. */
  goHome(): void;
  /** The confirmation's answer, or the empty prompt's button (always yes). */
  confirmGoHome(yes: boolean): void;
}

export interface HudLook {
  preview?: Preview;
  confirming: boolean;
  /** True for the render right after `goodwillRevealed`, so the goodwill gauges pop in. */
  revealGoodwill: boolean;
}

export interface Hud {
  render(state: GameState, look: HudLook): void;
  /** Renders only the gauges and hour blocks, for hover previews. */
  renderPreview(state: GameState, preview?: Preview): void;
  readonly gauges: HTMLElement;
  readonly hours: HTMLElement;
}

function gaugeElement(gauge: ReturnType<typeof hudView>["gauges"][number], reveal: boolean): HTMLElement {
  const isGoodwill = gauge.pressure === "launchTeam" || gauge.pressure === "paperTrail";
  const node = el("div", `hud-gauge${gauge.low ? " low" : ""}${reveal && isGoodwill ? " reveal" : ""}`);
  node.style.setProperty("--c", PRESSURE_COLOURS[gauge.pressure]);
  node.dataset.pressure = gauge.pressure;
  const tube = el("div", "tube");
  const fill = el("div", "fill");
  fill.style.height = `${gauge.value * 10}%`;
  tube.append(fill);
  if (gauge.preview) {
    const { from, to } = gauge.preview;
    const stripe = el("div", "stripe");
    stripe.style.setProperty("--x", to > from ? "#5f5" : "#f55");
    stripe.style.bottom = `${Math.min(from, to) * 10}%`;
    stripe.style.height = `${Math.abs(to - from) * 10}%`;
    tube.append(stripe);
  }
  node.append(el("div", "value", String(gauge.value)), tube, el("div", "", gauge.label));
  return node;
}

export function createHud(root: HTMLElement, actions: HudActions): Hud {
  const gauges = el("div", "hud-gauges");
  const hours = el("div", "hud-hours");
  const count = el("span", "count");
  const blocks = el("span");
  blocks.style.display = "contents";
  const breakButton = button(hudText.breakButton, () => actions.takeBreak(), "break");
  const goHomeButton = button(hudText.goHomeButton, () => actions.goHome(), "go-home");
  hours.append(count, blocks, breakButton, goHomeButton);

  const confirm = el("div", "hud-confirm");
  confirm.append(
    el("span", "", hudText.goHomeConfirm),
    button(hudText.goHomeConfirmYes, () => actions.confirmGoHome(true), "confirm-yes"),
    button(hudText.goHomeConfirmNo, () => actions.confirmGoHome(false), "confirm-no"),
  );
  const empty = el("div", "hud-empty");
  empty.append(
    el("span", "", hudText.nobodyWantsAnything),
    button(hudText.goHomeButton, () => actions.confirmGoHome(true), "go-home"),
  );
  root.append(gauges, hours, confirm, empty);

  function renderPreview(state: GameState, preview?: Preview, reveal = false): void {
    const view = hudView(state, preview);
    gauges.replaceChildren(...view.gauges.map((gauge) => gaugeElement(gauge, reveal)));
    count.textContent = view.hoursLabel;
    blocks.replaceChildren(...view.blocks.map((block) => el("i", `block ${block}`)));
    breakButton.disabled = view.breakLocked !== null;
    breakButton.title = view.breakLocked ?? "";
  }

  return {
    gauges,
    hours,
    renderPreview,
    render(state, look) {
      const workday = state.phase.kind === "workday";
      renderPreview(state, look.preview, look.revealGoodwill);
      goHomeButton.disabled = !workday;
      confirm.hidden = !(workday && look.confirming);
      empty.hidden = !(workday && state.openTasks.length === 0);
    },
  };
}

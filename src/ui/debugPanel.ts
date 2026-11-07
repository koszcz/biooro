// The dev-only debug panel: edit Pressures, jump to a day and set flags. Only `npm run dev` mounts it.
// It writes state through the store's debug commands. Its text is for developers, so it is not localised.
import { FRIDAY, PRESSURES, type Pressure } from "../rules/index";
import { type GameStore, jumpToDay, type StoreEventType, setDebugFlag, setDebugPressure } from "../store/index";
import { button, el } from "./dom";

const CSS = `
.debug-panel{position:absolute;right:8px;top:8px;z-index:50;width:200px;background:rgba(20,22,28,.9);color:#eee;font:12px system-ui,sans-serif;padding:8px;border-radius:8px;pointer-events:auto}
.debug-panel *{box-sizing:border-box}
.debug-panel h4{margin:8px 0 4px;font-size:11px;text-transform:uppercase;opacity:.7}
.debug-panel .row{display:flex;gap:4px;align-items:center;margin:2px 0}
.debug-panel .row label{flex:1}
.debug-panel input[type=number]{width:52px}
.debug-panel input[type=text]{flex:1;min-width:0}
.debug-panel button{font:600 11px system-ui;cursor:pointer;padding:2px 6px}
.debug-panel .flags{display:flex;flex-wrap:wrap;gap:4px}
`;

const REFRESH_ON: StoreEventType[] = ["dayStarted", "hoursChanged", "pressureChanged", "tierChanged"];
const PRESSURE_NAMES: Record<Pressure, string> = {
  performance: "Performance",
  launchTeam: "Launch Team",
  paperTrail: "Paper Trail",
  sanity: "Sanity",
};

/** Mounts the panel over `container`. Call it only in development builds. */
export function mountDebugPanel(container: HTMLElement, store: GameStore): void {
  const panel = el("div", "debug-panel");
  const body = el("div");
  const toggle = button("Debug", () => {
    body.hidden = !body.hidden;
  });
  body.hidden = true;
  panel.append(toggle, body);
  container.append(el("style", "", CSS), panel);
  for (const eventType of REFRESH_ON) store.on(eventType, () => queueMicrotask(draw));

  function draw(): void {
    const state = store.state;
    body.replaceChildren(
      el("h4", "", `Day ${state.day}, ${state.hoursLeft} hours left`),
      el("h4", "", "Jump to day"),
      dayRow(),
      el("h4", "", "Pressures"),
      ...PRESSURES.map((pressure) => pressureRow(pressure, state.pressures[pressure])),
      el("h4", "", "Flags"),
      flagRow(),
    );
  }

  function dayRow(): HTMLElement {
    const row = el("div", "row");
    for (let day = 1; day <= FRIDAY; day++) row.append(button(String(day), () => jumpToDay(store, day)));
    return row;
  }

  function pressureRow(pressure: Pressure, value: number): HTMLElement {
    const row = el("div", "row");
    const input = el("input");
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.value = String(value);
    input.addEventListener("change", () => setDebugPressure(store, pressure, Number(input.value)));
    row.append(el("label", "", PRESSURE_NAMES[pressure]), input);
    return row;
  }

  function flagRow(): HTMLElement {
    const wrap = el("div");
    const add = el("div", "row");
    const input = el("input");
    input.type = "text";
    input.placeholder = "flag name";
    add.append(
      input,
      button("Set", () => {
        const name = input.value.trim();
        if (name) setDebugFlag(store, name, true);
      }),
    );
    const list = el("div", "flags");
    for (const name of store.state.flags) list.append(button(`${name} x`, () => setDebugFlag(store, name, false)));
    wrap.append(add, list);
    return wrap;
  }

  draw();
}

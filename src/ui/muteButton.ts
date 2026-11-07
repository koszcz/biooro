// The one mute button. There are no volume sliders.
import { MUTE_LABELS } from "../locales/index";

export interface Muteable {
  readonly muted: boolean;
  setMuted(muted: boolean): void;
}

const CSS = `
.mute-button{position:absolute;right:12px;bottom:12px;z-index:40;background:rgba(20,22,28,.7);color:#eee;border:0;border-radius:999px;padding:6px 12px;font:12px system-ui,sans-serif;cursor:pointer;pointer-events:auto}
`;

export function mountMuteButton(container: HTMLElement, audio: Muteable): void {
  const button = document.createElement("button");
  button.className = "mute-button";
  const draw = () => {
    button.textContent = audio.muted ? MUTE_LABELS.unmute : MUTE_LABELS.mute;
    button.setAttribute("aria-pressed", String(audio.muted));
  };
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  button.addEventListener("click", () => {
    audio.setMuted(!audio.muted);
    draw();
  });
  draw();
  const style = document.createElement("style");
  style.textContent = CSS;
  container.append(style, button);
}

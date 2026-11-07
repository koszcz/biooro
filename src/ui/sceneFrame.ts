// The scripted scene frame: letterbox bars with the title card in the top bar.
// While it is open, the container carries `data-scene`, which hides the HUD, Task bubbles and "…" badges.
import { type SceneFrame, type ScriptedScene, sceneSpec } from "../dialogue/index";
import { sceneTitles } from "../locales/index";
import { el } from "./dom";

export const sceneTitle = (scene: ScriptedScene): string => sceneTitles[sceneSpec(scene).knot];

const BAR_SLIDE_MS = 400;

const SCENE_CSS = `
.scene-bar{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:7;pointer-events:none;
  transition:transform ${BAR_SLIDE_MS}ms ease;display:flex;align-items:center;justify-content:center;
  color:#f3ece0;font:600 18px system-ui,sans-serif;letter-spacing:.04em}
.scene-bar.top{top:0;transform:translateY(-100%)}
.scene-bar.bottom{bottom:0;transform:translateY(100%)}
[data-scene] .scene-bar{transform:translateY(0)}
[data-scene] .hud,[data-scene] .conversation-badge,[data-scene] .conversation-hover{display:none!important}
`;

export function mountSceneFrame(container: HTMLElement): SceneFrame {
  const style = el("style", "", SCENE_CSS);
  const top = el("div", "scene-bar top");
  const bottom = el("div", "scene-bar bottom");
  container.append(style, top, bottom);
  return {
    open(scene) {
      top.textContent = sceneTitle(scene);
      container.dataset.scene = scene.kind;
    },
    close() {
      delete container.dataset.scene;
    },
  };
}

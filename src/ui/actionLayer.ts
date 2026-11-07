// Labels over people's heads while Task actions play: the tag over the Intern, "✨ looks done" sparkles,
// hand-off speech bubbles and the Pressure floats. Looks follow prototype variant J.
import { ASSIGNER_NAMES, actionText, HAND_OFF_LINES } from "../locales/index";
import type { ColleagueId } from "../rules/index";
import type { ActionTag, Float } from "./acting";
import type { HeadLocator } from "./bubbles";
import { el } from "./dom";
import type { BubbleOwner } from "./hudView";
import { PRESSURE_COLOURS } from "./styles";
import { type RevealListener, typeLine } from "./talkText";

const SPARKLE_MS = 1600;
const SAY_MS = 1800;
const FLOAT_MS = 1900;
const FLOAT_GAP_MS = 250;

export const ACTION_CSS = `
.hud-acts{position:absolute;inset:0;pointer-events:none}
.hud-act{position:absolute;transform:translate(-50%,-100%);white-space:nowrap;font:700 11px system-ui;color:#fff;background:var(--c);padding:3px 8px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;gap:6px;align-items:center;max-width:320px}
.hud-act.tag{transform:translate(-50%,0)}
.hud-act .task{font-weight:500;overflow:hidden;text-overflow:ellipsis;max-width:180px}
.hud-act .blocks{display:inline-flex;gap:2px}
.hud-act .blocks i{width:8px;height:8px;border-radius:2px;background:#fff}
.hud-act .blocks i.gone{background:rgba(255,255,255,.3)}
.hud-act.spark{background:#fff8d6;color:#7a5c00;border:1px solid #e2b500;animation:hud-rise 1.6s ease-out forwards}
.hud-say{position:absolute;transform:translate(-50%,-100%);background:#fff;border:2px solid #18b6c8;border-radius:10px;padding:4px 8px;font:500 12px system-ui;color:#222;max-width:200px;width:max-content;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.hud-say b{display:block;font-size:10px;color:#555}
.hud-float{position:absolute;transform:translate(-50%,-100%);font:800 14px system-ui;color:var(--c);text-shadow:0 1px 0 #fff,0 0 4px #fff;animation:hud-rise 1.9s ease-out forwards;white-space:nowrap}
@keyframes hud-rise{0%{opacity:0;margin-top:0}15%{opacity:1}100%{opacity:0;margin-top:-40px}}
`;

const TAG_COLOUR = "#ff8a1f";
const SECRET_COLOUR = "#b27cff";
/**
 * Pixels above the head point for each kind of label. The tag sits under the Intern, clear of Task bubbles.
 * The sparkle sits above the Pressure floats, because both appear when a faked Task finishes.
 */
const LIFT = { tag: -50, spark: 100, say: 8, float: 60 } as const;

export interface ActionLayer {
  /** Shows or clears the tag over the Intern. */
  renderTag(tag: ActionTag | null): void;
  looksDone(over: BubbleOwner): void;
  handOff(colleague: ColleagueId): void;
  floats(floats: Float[]): void;
  /** Moves each label over its person's head. Call it every frame. */
  follow(): void;
}

export function createActionLayer(root: HTMLElement, headAt: HeadLocator, onReveal?: RevealListener): ActionLayer {
  const layer = el("div", "hud-acts");
  root.append(layer);
  const pinned = new Map<HTMLElement, { over: BubbleOwner; lift: number }>();
  let tagNode: HTMLElement | null = null;

  const place = (node: HTMLElement) => {
    const pin = pinned.get(node);
    if (!pin) return;
    const head = headAt(pin.over);
    node.style.left = `${head.x}px`;
    node.style.top = `${head.y - pin.lift}px`;
  };
  const pin = (node: HTMLElement, over: BubbleOwner, lift: number, ms?: number) => {
    pinned.set(node, { over, lift });
    layer.append(node);
    place(node);
    if (ms) setTimeout(() => unpin(node), ms);
  };
  const unpin = (node: HTMLElement) => {
    pinned.delete(node);
    node.remove();
  };

  return {
    renderTag(tag) {
      if (tagNode) unpin(tagNode);
      tagNode = null;
      if (!tag) return;
      const node = el("div", "hud-act tag");
      node.style.setProperty("--c", tag.secret ? SECRET_COLOUR : TAG_COLOUR);
      const blocks = el("span", "blocks");
      const spent = tag.hours - tag.hoursLeft;
      blocks.append(...Array.from({ length: tag.hours }, (_, hour) => el("i", hour < spent ? "gone" : "")));
      node.append(
        ...(tag.secret ? [el("span", "", actionText.secret)] : []),
        el("span", "", tag.label),
        el("span", "task", tag.task),
        blocks,
      );
      node.title = tag.task;
      tagNode = node;
      pin(node, "intern", LIFT.tag);
    },
    looksDone(over) {
      pin(el("div", "hud-act spark", actionText.looksDone), over, LIFT.spark, SPARKLE_MS);
    },
    handOff(colleague) {
      const node = el("div", "hud-say");
      const text = HAND_OFF_LINES[colleague];
      const body = el("span", "");
      node.append(el("b", "", ASSIGNER_NAMES[colleague]), body);
      pin(node, colleague, LIFT.say, SAY_MS);
      typeLine(body, text, (from, to) => onReveal?.(colleague, text, from, to));
    },
    floats(floats) {
      floats.forEach((float, index) => {
        setTimeout(() => {
          const node = el("div", "hud-float", float.text);
          node.style.setProperty("--c", PRESSURE_COLOURS[float.pressure]);
          pin(node, "intern", LIFT.float, FLOAT_MS);
        }, index * FLOAT_GAP_MS);
      });
    },
    follow() {
      for (const node of pinned.keys()) place(node);
    },
  };
}

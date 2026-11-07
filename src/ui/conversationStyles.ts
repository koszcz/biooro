// The look of Conversation bubbles, choices, badges, hover labels and floats, after prototype variant G.
import type { CastId } from "../content/index";
import type { Speaker } from "../dialogue/index";
import type { Pressure } from "../rules/index";

const LAUNCH_TEAM = "#18b6c8";
const PAPER_TRAIL = "#c9ab6b";

/** The border and tail colour of each speaker's bubble: their Faction colour. */
export const SPEAKER_COLOURS: Record<Speaker, string> = {
  intern: "#ff7a1a",
  zbigniew: LAUNCH_TEAM,
  ryszard: LAUNCH_TEAM,
  wiola: LAUNCH_TEAM,
  halina: PAPER_TRAIL,
  kamil: PAPER_TRAIL,
  headOffice: "#555555",
};

export const PERSON_COLOURS: Record<CastId, string> = SPEAKER_COLOURS;

export const PRESSURE_COLOURS: Record<Pressure, string> = {
  performance: "#3b7dd8",
  launchTeam: LAUNCH_TEAM,
  paperTrail: PAPER_TRAIL,
  sanity: "#9b5de5",
};

/** How long a brush-off stays before it is gone, in milliseconds. */
export const BRUSH_OFF_MS = 2600;
const FLOAT_MS = 1800;

export const CONVERSATION_CSS = `
.conversation-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:8}
.conversation-say{position:absolute;transform:translate(-50%,-100%);max-width:280px;background:#fff;color:#222;
  font:15px/1.35 system-ui,sans-serif;padding:9px 12px;border-radius:14px;border:3px solid var(--c);
  box-shadow:0 4px 14px rgba(0,0,0,.35);z-index:3}
.conversation-say:after{content:'';position:absolute;left:50%;bottom:-19px;transform:translateX(-50%);
  border:8px solid transparent;border-top-color:var(--c)}
.conversation-say.head-office{left:50%;top:12vh;transform:translate(-50%,0)}
.conversation-say.head-office:after{display:none}
.conversation-say b{display:block;font:700 10px system-ui,sans-serif;text-transform:uppercase;letter-spacing:.05em;color:var(--c)}
.conversation-say .text.done:after{content:' ▸';color:#aaa}
.conversation-say.brush-off{font-size:13px;padding:6px 10px;animation:conversation-fade ${BRUSH_OFF_MS}ms forwards}
@keyframes conversation-fade{0%,75%{opacity:1}100%{opacity:0}}
.conversation-choices{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;gap:6px;
  pointer-events:auto;z-index:4}
.conversation-choices button{font:14px system-ui,sans-serif;text-align:left;background:#fff8ee;border:2px solid #ff8a1f;
  border-radius:12px;padding:6px 10px;cursor:pointer;color:#222;max-width:300px}
.conversation-choices button:hover{background:#ff8a1f;color:#fff}
.conversation-choices button i{font-style:normal;font-weight:700;margin-right:6px;opacity:.6}
.conversation-badge{position:absolute;transform:translate(-50%,-100%);width:22px;height:16px;border-radius:9px;
  background:#fff;color:#222;text-align:center;font:700 11px/12px system-ui,sans-serif;border:2px solid var(--c);z-index:1}
.conversation-badge.used{opacity:.35}
.conversation-hover{position:absolute;transform:translate(-50%,0);font:700 12px system-ui,sans-serif;background:#222;color:#fff;
  padding:3px 8px;border-radius:6px;white-space:nowrap;border-bottom:3px solid var(--c);z-index:2}
.conversation-hover.unavailable{background:#555;color:#ddd;font-weight:500}
.conversation-float{position:absolute;left:64px;top:45%;font:700 14px system-ui,sans-serif;padding:3px 8px;border-radius:999px;
  color:#fff;background:var(--c);animation:conversation-rise ${FLOAT_MS}ms forwards;z-index:5}
@keyframes conversation-rise{from{transform:translateY(0);opacity:1}to{transform:translateY(-60px);opacity:0}}
`;

export const FLOAT_DURATION_MS = FLOAT_MS;

/**
 * From the click on a Colleague until the Conversation ends, the container carries `data-conversation`.
 * The partner's Task bubbles hide, everyone else's fade to 25% and ignore clicks, and Break and "Go home" are
 * disabled. An open popover hides until `conversationStarted` closes it. The gauges stay.
 */
export const CONVERSATION_FOCUS_CSS = `
[data-conversation] .hud-bubble{opacity:.25!important;pointer-events:none!important}
[data-conversation] .hud-pop{display:none}
[data-conversation] .hud-hours button,[data-conversation] .hud-confirm button{pointer-events:none!important;opacity:.45}
${Object.keys(PERSON_COLOURS)
  .map((id) => `[data-conversation="${id}"] .hud-bubble[data-over="${id}"]{display:none}`)
  .join("\n")}
`;

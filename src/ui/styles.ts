// The CSS for the HUD, Task bubbles, the Task choice popover and the day card. Layout follows prototype variant C.

/** Each Pressure's gauge colour. The goodwill colours match the Faction vests in the office. */
export const PRESSURE_COLOURS = {
  performance: "#3b7dd8",
  launchTeam: "#18b6c8",
  paperTrail: "#c9ab6b",
  sanity: "#9b5de5",
} as const;

export const SIDE_COLOURS = { launchTeam: "#18b6c8", paperTrail: "#c9ab6b", none: "#999" } as const;

export const HUD_CSS = `
.hud{position:absolute;inset:0;pointer-events:none;font:12px system-ui,sans-serif;color:#222;overflow:hidden}
.hud *{box-sizing:border-box}
.hud [hidden]{display:none!important}
.hud button{pointer-events:auto;font:600 12px system-ui,sans-serif;cursor:pointer;border:0;border-radius:6px;padding:4px 10px;background:#f2efe6;color:#222}
.hud button:disabled{opacity:.45;cursor:not-allowed}
.hud-gauges{position:absolute;left:12px;top:50%;transform:translateY(-50%);display:flex;gap:8px;background:rgba(20,22,28,.7);padding:10px;border-radius:12px;pointer-events:auto}
.hud-gauge{display:flex;flex-direction:column;align-items:center;gap:4px;font:600 10px system-ui;color:#eee;width:40px}
.hud-gauge .tube{position:relative;width:14px;height:150px;border-radius:7px;background:#3a3f48;overflow:hidden}
.hud-gauge .fill{position:absolute;left:0;right:0;bottom:0;background:var(--c);transition:height .3s}
.hud-gauge .stripe{position:absolute;left:0;right:0;background:repeating-linear-gradient(45deg,var(--x) 0 3px,transparent 3px 6px)}
.hud-gauge.low .fill{animation:hud-pulse 1s infinite}
.hud-gauge .value{font:700 14px system-ui}
.hud-gauge.reveal{animation:hud-reveal .9s ease-out}
@keyframes hud-pulse{50%{opacity:.35}}
@keyframes hud-reveal{0%{transform:scale(.6);opacity:0;filter:brightness(2)}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
.hud-hours{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:4px;align-items:center;background:rgba(20,22,28,.7);padding:6px 10px;border-radius:10px;font:600 12px system-ui;color:#eee;pointer-events:auto}
.hud-hours .count{margin-right:6px;min-width:22px}
.hud-hours .block{width:26px;height:14px;border-radius:3px;background:#f2efe6}
.hud-hours .block.spent{background:#4a4f58}
.hud-hours .block.preview{background:#ff9f1c}
.hud-hours button{margin-left:6px}
.hud-confirm{position:absolute;bottom:64px;left:50%;transform:translateX(-50%);background:#fff;border-radius:10px;padding:10px;box-shadow:0 6px 24px rgba(0,0,0,.5);pointer-events:auto;display:flex;gap:8px;align-items:center}
.hud-empty{position:absolute;top:14px;left:50%;transform:translateX(-50%);background:#fff;padding:6px 10px;border-radius:8px;display:flex;gap:8px;align-items:center;pointer-events:auto;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.hud-bubble{position:absolute;transform:translate(-50%,-100%);background:#fff;border-radius:10px;padding:4px 8px;font:600 12px system-ui;color:#222;box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer;width:max-content;max-width:200px;line-height:1.3;text-align:center;border:2px solid var(--c);pointer-events:auto}
.hud-bubble:after{content:'';position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);border:6px solid transparent;border-top-color:var(--c)}
.hud-bubble.fallout{background:#ffe5e5}
.hud-bubble:hover{transform:translate(-50%,-100%) scale(1.05)}
.hud-pop{position:absolute;width:280px;background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.5);padding:8px;overflow-y:auto;pointer-events:auto}
.hud-pop .title{font-weight:700;margin:0 16px 2px 0}
.hud-pop .who{font-size:11px;color:#666;margin-bottom:6px;display:flex;gap:6px;align-items:center}
.hud-pop .row{display:flex;justify-content:space-between;gap:6px;padding:5px 6px;border-radius:6px;cursor:pointer}
.hud-pop .row:hover:not(.locked){background:#fff3e0}
.hud-pop .row.locked{opacity:.6;cursor:not-allowed}
.hud-pop .sub{margin-left:14px;border-left:2px solid #eee;border-radius:0 6px 6px 0}
.hud-pop .note{font-size:11px;color:#777}
.hud-pop .reason{font-size:11px;color:#c0262d;font-style:italic}
.hud-pop .close{position:absolute;top:4px;right:6px;background:none;padding:0 4px;color:#999;font-size:16px}
.hud-chip{display:inline-block;font:600 11px system-ui;padding:1px 6px;border-radius:999px;margin:1px 3px 1px 0;background:color-mix(in srgb,var(--c) 18%,white);color:color-mix(in srgb,var(--c) 75%,black);border:1px solid color-mix(in srgb,var(--c) 40%,white)}
.hud-side{display:inline-block;font:600 10px system-ui;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;border-radius:3px;color:#fff;background:var(--c)}
.hud-card{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(20,22,28,.85);color:#f3ece0;font:600 28px system-ui,sans-serif;pointer-events:auto}
.hud-card .sub{font-size:16px;font-weight:400}
.hud-card .buttons{display:flex;gap:8px}
.hud-card button{font-size:16px;padding:8px 16px}
`;

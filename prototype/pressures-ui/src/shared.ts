// PROTOTYPE, throwaway. Small helpers the three variants share. Layout stays per variant.
import { CHOICE_LABEL, choicesFor, type ChoiceKey, type ChoiceView, type Deltas, type PressureKey, PRESSURE_LABEL, SIDE_LABEL, state, type Task, visibleDeltas } from './game';

export const COLOR: Record<PressureKey, string> = { performance: '#3b7dd8', launch: '#e08a2c', paper: '#2a9d8f', sanity: '#9b5de5' };
export const SHORT: Record<PressureKey, string> = { performance: 'Perf', launch: 'Launch', paper: 'Paper', sanity: 'Sanity' };

export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function chips(d: Deltas, short = true) {
  return visibleDeltas(d)
    .map(([k, v]) => `<span class="chip" style="--c:${COLOR[k]}">${v > 0 ? '+' : '−'}${Math.abs(v)} ${short ? SHORT[k] : PRESSURE_LABEL[k]}</span>`)
    .join('');
}

export function sideTag(t: Task) {
  if (!t.side) return '<span class="side none">No side</span>';
  if (!state.goodwillVisible) return '';
  return `<span class="side" style="--c:${COLOR[t.side]}">${SIDE_LABEL[t.side]}</span>`;
}

/** Group the five rows into the four Task choices the player sees. */
export function grouped(t: Task): { key: ChoiceKey; label: string; rows: ChoiceView[] }[] {
  const all = choicesFor(t);
  return (['do', 'fake', 'delegate', 'sabotage'] as ChoiceKey[]).map((key) => ({ key, label: CHOICE_LABEL[key], rows: all.filter((c) => c.key === key) }));
}

export const BASE_CSS = `
.chip{display:inline-block;font:600 11px system-ui;padding:1px 6px;border-radius:999px;margin:1px 3px 1px 0;background:color-mix(in srgb,var(--c) 18%,white);color:color-mix(in srgb,var(--c) 75%,black);border:1px solid color-mix(in srgb,var(--c) 40%,white)}
.side{display:inline-block;font:600 10px system-ui;text-transform:uppercase;letter-spacing:.04em;padding:1px 5px;border-radius:3px;color:#fff;background:var(--c)}
.side.none{background:#999}
.locked{opacity:.55;cursor:not-allowed!important}
.reason{font-size:11px;color:#a33;font-style:italic}
@keyframes reveal{0%{transform:scale(.6);opacity:0;filter:brightness(2)}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
.reveal{animation:reveal .9s ease-out}
@keyframes bump{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
.bump{animation:bump .4s ease-out}
`;

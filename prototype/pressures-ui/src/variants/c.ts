// PROTOTYPE, throwaway. Variant C, "In the world".
// Each Task is a speech bubble over whoever assigned it, tracked in the 3D scene.
// "Anyone" Tasks float over the Intern. Clicking a bubble opens a compact popover beside it.
// Pressures are slim vertical gauges on the left edge. Hours are 8 blocks along the bottom;
// hovering a choice lights up the blocks it would spend.
import { choose, endDay, NAME, on, state, takeBreak, visiblePressures, type ChoiceView, type GameEvent, type Task } from '../game';
import { onFrame, screenPos } from '../scene';
import { chips, COLOR, esc, grouped, SHORT, sideTag } from '../shared';

const CSS = `
#vc-g{position:fixed;left:12px;top:50%;transform:translateY(-50%);display:flex;gap:8px;background:rgba(20,22,28,.7);padding:10px;border-radius:12px}
#vc-g .g{display:flex;flex-direction:column;align-items:center;gap:4px;font:600 10px system-ui;color:#eee;width:40px}
#vc-g .tube{position:relative;width:14px;height:150px;border-radius:7px;background:#3a3f48;overflow:hidden}
#vc-g .tube .f{position:absolute;left:0;right:0;bottom:0;background:var(--c);transition:height .3s}
#vc-g .tube .gh{position:absolute;left:0;right:0;background:repeating-linear-gradient(45deg,var(--x) 0 3px,transparent 3px 6px)}
#vc-g .low .f{animation:pulse 1s infinite}
@keyframes pulse{50%{opacity:.35}}
#vc-g .v{font:700 14px system-ui}
#vc-h{position:fixed;bottom:64px;left:50%;transform:translateX(-50%);display:flex;gap:4px;align-items:center;background:rgba(20,22,28,.7);padding:6px 10px;border-radius:10px;font:600 11px system-ui;color:#eee}
#vc-h i{width:26px;height:14px;border-radius:3px;background:#f2efe6}
#vc-h i.spent{background:#4a4f58}
#vc-h i.pv{background:#ff9f1c}
#vc-h button{margin-left:8px;font:11px system-ui;cursor:pointer}
#vc-b .bub{position:fixed;transform:translate(-50%,-100%);background:#fff;border-radius:10px;padding:4px 8px;font:600 12px system-ui;color:#222;box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer;width:max-content;max-width:200px;line-height:1.3;text-align:center;border:2px solid var(--c,#999)}
#vc-b .bub:after{content:'';position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);border:6px solid transparent;border-top-color:var(--c,#999)}
#vc-b .bub.fallout{background:#ffe5e5}
#vc-b .bub:hover{transform:translate(-50%,-100%) scale(1.08)}
#vc-pop{position:fixed;width:270px;background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.5);font:12px system-ui;color:#222;padding:8px}
#vc-pop .t{font-weight:700;margin-bottom:2px}
#vc-pop .w{font-size:11px;color:#666;margin-bottom:6px}
#vc-pop .c{display:flex;justify-content:space-between;gap:6px;padding:5px 6px;border-radius:6px;cursor:pointer}
#vc-pop .c:hover:not(.locked){background:#fff3e0}
#vc-pop .c b{font-size:12px}
#vc-pop .sub{margin-left:14px;border-left:2px solid #eee;border-radius:0 6px 6px 0}
#vc-pop .note{font-size:11px;color:#777}
#vc-pop .x{position:absolute;top:4px;right:8px;cursor:pointer;color:#999}
#vc-empty{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#fff;padding:6px 10px;border-radius:8px;font:12px system-ui}
`;

export function mountC(root: HTMLElement) {
  root.innerHTML = `<style>${CSS}</style><div id="vc-g"></div><div id="vc-h"></div><div id="vc-b"></div><div id="vc-popwrap"></div><div id="vc-emptywrap"></div>`;
  let open: Task | null = null;
  let delegateOpen = false;
  let preview: ChoiceView | null = null;
  let revealing = false;
  const bubbles = root.querySelector<HTMLElement>('#vc-b')!;

  function renderGauges() {
    root.querySelector('#vc-g')!.innerHTML = visiblePressures().map((k) => {
      const v = state.p[k], d = preview?.deltas[k] ?? 0;
      const gh = d ? `<div class="gh" style="--x:${d > 0 ? '#5f5' : '#f55'};bottom:${Math.min(v, v + d) * 10}%;height:${Math.abs(d) * 10}%"></div>` : '';
      return `<div class="g ${v <= 2 ? 'low' : ''} ${revealing && k !== 'performance' && k !== 'sanity' ? 'reveal' : ''}" style="--c:${COLOR[k]}" title="${k}"><div class="v">${v}</div><div class="tube"><div class="f" style="height:${v * 10}%"></div>${gh}</div><div>${SHORT[k]}</div></div>`;
    }).join('');
    revealing = false;
  }
  function renderHours() {
    const from = state.hours - (preview?.hours ?? 0);
    root.querySelector('#vc-h')!.innerHTML = `<span style="margin-right:6px">${state.hours}h</span>` + Array.from({ length: 8 }, (_, i) => `<i class="${i >= state.hours ? 'spent' : i >= from ? 'pv' : ''}"></i>`).join('') + `<button id="vc-break">Break</button>`;
    root.querySelector<HTMLButtonElement>('#vc-break')!.onclick = () => takeBreak();
  }
  // bubbles: one per assigner, stacked if several
  function renderBubbles() {
    const by = new Map<string, Task[]>();
    for (const t of state.inbox) by.set(t.assigner, [...(by.get(t.assigner) ?? []), t]);
    bubbles.innerHTML = [...by.entries()].flatMap(([who, ts]) => ts.map((t, i) => `<div class="bub ${t.fallout ? 'fallout' : ''}" data-id="${t.id}" data-who="${who}" data-i="${i}" style="--c:${t.side && state.goodwillVisible ? COLOR[t.side] : '#999'}">${t.fallout ? '⚠ ' : ''}${esc(t.title)}</div>`)).join('');
    bubbles.querySelectorAll<HTMLElement>('.bub').forEach((el) => (el.onclick = () => { delegateOpen = false; open = state.inbox.find((x) => x.id === Number(el.dataset.id))!; renderPop(); }));
    const ew = root.querySelector('#vc-emptywrap')!;
    ew.innerHTML = state.inbox.length ? '' : `<div id="vc-empty">Nobody wants anything. <button id="vc-end">End the day</button></div>`;
    const end = ew.querySelector<HTMLButtonElement>('#vc-end'); if (end) end.onclick = () => endDay();
    place();
  }
  function place() {
    const stack = new Map<string, number>();
    bubbles.querySelectorAll<HTMLElement>('.bub').forEach((el) => {
      const who = el.dataset.who!;
      const p = screenPos(who as any);
      if (!p) return;
      const lift = stack.get(who) ?? 0;
      el.style.left = p.x + 'px';
      el.style.top = p.y - lift + 'px';
      stack.set(who, lift + el.offsetHeight + 12);
    });
    const pop = root.querySelector<HTMLElement>('#vc-pop');
    if (pop && open) {
      const p = screenPos(open.assigner);
      if (p) { pop.style.left = Math.min(innerWidth - 290, p.x + 30) + 'px'; pop.style.top = Math.max(10, Math.min(innerHeight - pop.offsetHeight - 70, p.y - 80)) + 'px'; }
    }
  }
  onFrame.push(place);

  function renderPop() {
    const wrap = root.querySelector<HTMLElement>('#vc-popwrap')!;
    if (!open || !state.inbox.some((x) => x.id === open!.id)) { wrap.innerHTML = ''; open = null; return; }
    const t = open, gs = grouped(t);
    wrap.innerHTML = `<div id="vc-pop"><span class="x">×</span><div class="t">${esc(t.title)}</div><div class="w">${NAME[t.assigner]} ${sideTag(t)}</div>${gs.map((g, gi) => {
      if (g.key === 'delegate') {
        const allLocked = g.rows.every((r) => r.locked);
        const head = `<div class="c dh ${allLocked ? 'locked' : ''}"><div><b>Delegate it ${delegateOpen ? '▾' : '▸'}</b><div>${allLocked ? `<span class="reason">Nobody will take it</span>` : '<span class="note">Pick a Colleague</span>'}</div></div><span>1h</span></div>`;
        const rows = delegateOpen ? g.rows.map((r, ri) => `<div class="c sub ${r.locked ? 'locked' : ''}" data-g="${gi}" data-r="${ri}"><div><b>${r.label.replace('Delegate to ', '')}</b><div>${r.locked ? `<span class="reason">${esc(r.locked)}</span>` : chips(r.deltas)}</div>${!r.locked && r.note ? `<div class="note">${esc(r.note)}</div>` : ''}</div></div>`).join('') : '';
        return head + rows;
      }
      const r = g.rows[0];
      return `<div class="c ${r.locked ? 'locked' : ''}" data-g="${gi}" data-r="0"><div><b>${g.label}</b><div>${r.locked ? `<span class="reason">${esc(r.locked)}</span>` : chips(r.deltas)}</div></div><span>${r.hours}h</span></div>`;
    }).join('')}</div>`;
    wrap.querySelector<HTMLElement>('.x')!.onclick = () => { open = null; preview = null; renderPop(); renderGauges(); renderHours(); };
    wrap.querySelector<HTMLElement>('.dh')!.onclick = () => { delegateOpen = !delegateOpen; renderPop(); };
    wrap.querySelectorAll<HTMLElement>('[data-g]').forEach((el) => {
      const c = gs[Number(el.dataset.g)].rows[Number(el.dataset.r)];
      el.onmouseenter = () => { preview = c.locked ? null : c; renderGauges(); renderHours(); };
      el.onmouseleave = () => { preview = null; renderGauges(); renderHours(); };
      el.onclick = (e) => { e.stopPropagation(); if (c.locked) return; preview = null; choose(t, c); };
    });
    place();
  }
  const handler = (e: GameEvent) => {
    if (e.type === 'goodwillRevealed') revealing = true; renderGauges(); renderHours(); renderBubbles(); renderPop(); };
  on(handler);
  renderGauges(); renderHours(); renderBubbles();
}

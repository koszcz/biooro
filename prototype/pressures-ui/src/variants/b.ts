// PROTOTYPE, throwaway. Variant B, "Clipboard + wall clock + memo".
// Pressures are 10 pips each on a clipboard, bottom left. Hours are a wall clock, top right:
// the Workday runs 9:00 to 17:00, so hours left read as the time of day.
// The inbox is a stack of paper slips under the clipboard. Clicking one opens a memo
// in the middle of the screen with four big Task choice cards. Locked cards get a stamp.
import { choose, endDay, NAME, on, PRESSURE_LABEL, state, takeBreak, visiblePressures, type GameEvent, type Task } from '../game';
import { chips, COLOR, esc, grouped, sideTag } from '../shared';

const CSS = `
#vb-clip{position:fixed;left:14px;bottom:70px;width:270px;background:#c8a26b;border-radius:10px;padding:26px 10px 10px;box-shadow:0 4px 14px rgba(0,0,0,.4);font:12px Georgia,serif;color:#222}
#vb-clip:before{content:'';position:absolute;top:6px;left:50%;transform:translateX(-50%);width:90px;height:16px;background:#888;border-radius:4px}
#vb-clip .sheet{background:#fffdf6;padding:10px;border-radius:3px}
#vb-clip .pr{margin-bottom:7px}
#vb-clip .pr .lbl{font-weight:700;display:flex;justify-content:space-between}
#vb-clip .pips{display:flex;gap:3px;margin-top:2px}
#vb-clip .pips i{width:18px;height:10px;border:1px solid var(--c);border-radius:2px}
#vb-clip .pips i.on{background:var(--c)}
#vb-clip .low .pips i.on{background:#d22;border-color:#d22}
#vb-slips{margin-top:8px;display:flex;flex-direction:column;gap:4px;max-height:30vh;overflow:auto}
#vb-slips .slip{background:#fffbe0;padding:6px 8px;border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,.3);cursor:pointer;transform:rotate(var(--r))}
#vb-slips .slip:hover{background:#fff4a8}
#vb-slips .slip.fallout{background:#ffe0e0}
#vb-slips .who{font-size:10px;color:#666}
#vb-clip .actions{margin-top:6px;display:flex;gap:6px}
#vb-clip .actions button{font:12px Georgia,serif;cursor:pointer}
#vb-clock{position:fixed;top:14px;right:14px;width:110px;height:110px;border-radius:50%;background:#fff;border:6px solid #333;box-shadow:0 3px 10px rgba(0,0,0,.4)}
#vb-clock .hand{position:absolute;left:50%;top:50%;transform-origin:0 50%;height:4px;margin-top:-2px;background:#222;border-radius:2px;transition:transform .5s}
#vb-clock .h{width:30px}#vb-clock .m{width:42px;height:2px;margin-top:-1px}
#vb-clock .arc{position:absolute;inset:4px;border-radius:50%}
#vb-clock .t{position:absolute;bottom:-26px;left:0;right:0;text-align:center;font:700 13px system-ui;color:#fff;text-shadow:0 1px 3px #000}
#vb-memo-bg{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}
#vb-memo{width:560px;background:#fffdf6;border-radius:4px;padding:18px 20px;font:13px Georgia,serif;color:#222;box-shadow:0 10px 40px rgba(0,0,0,.5)}
#vb-memo h2{margin:0 0 2px;font-size:17px}
#vb-memo .meta{font-size:11px;color:#666;margin-bottom:12px}
#vb-memo .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
#vb-memo .card{position:relative;border:2px solid #333;border-radius:6px;padding:10px;cursor:pointer;min-height:84px}
#vb-memo .card:hover:not(.locked){background:#fff3d6}
#vb-memo .card .n{font:700 15px system-ui}
#vb-memo .card .hh{position:absolute;top:8px;right:10px;font:700 12px system-ui;color:#555}
#vb-memo .card .note{font-size:11px;color:#666;margin-top:3px}
#vb-memo .stamp{position:absolute;inset:auto 8px 8px auto;transform:rotate(-8deg);border:2px solid #c22;color:#c22;font:700 10px system-ui;padding:2px 5px;text-transform:uppercase;max-width:200px;background:rgba(255,255,255,.8)}
#vb-memo .dg{display:flex;flex-direction:column;gap:4px;margin-top:4px}
#vb-memo .dg button{text-align:left;font:12px Georgia,serif;cursor:pointer;padding:3px 6px;border:1px solid #999;border-radius:4px;background:#fff}
#vb-memo .dg button:disabled{opacity:.6;cursor:not-allowed}
#vb-memo .close{float:right;cursor:pointer;border:0;background:none;font-size:18px}
`;

export function mountB(root: HTMLElement) {
  root.innerHTML = `<style>${CSS}</style><div id="vb-clock"></div><div id="vb-clip"><div class="sheet"><div id="vb-ps"></div></div><div id="vb-slips"></div><div class="actions"><button id="vb-break">Take a Break</button></div></div><div id="vb-modal"></div>`;
  let memo: Task | null = null;
  const bumped = new Set<string>();
  let revealing = false;
  root.querySelector<HTMLButtonElement>('#vb-break')!.onclick = () => takeBreak();

  function renderClock() {
    const elapsed = 8 - state.hours;
    const hour = 9 + elapsed;
    const hDeg = ((hour % 12) / 12) * 360 - 90;
    // shade the hours still left in the Workday
    const startDeg = ((hour % 12) / 12) * 360, span = (state.hours / 12) * 360;
    root.querySelector('#vb-clock')!.innerHTML = `<div class="arc" style="background:conic-gradient(from ${startDeg}deg, rgba(255,159,28,.35) 0deg ${span}deg, transparent 0)"></div><div class="hand h" style="transform:rotate(${hDeg}deg)"></div><div class="hand m" style="transform:rotate(-90deg)"></div><div class="t">${hour}:00 · ${state.hours}h left</div>`;
  }
  function renderClip() {
    root.querySelector('#vb-ps')!.innerHTML = visiblePressures().map((k) => {
      const v = state.p[k];
      const pips = Array.from({ length: 10 }, (_, i) => `<i class="${i < v ? 'on' : ''}"></i>`).join('');
      const cls = [v <= 2 ? 'low' : '', bumped.has(k) ? 'bump' : '', revealing && (k === 'launch' || k === 'paper') ? 'reveal' : ''].join(' ');
      return `<div class="pr ${cls}" style="--c:${COLOR[k]}"><div class="lbl"><span>${PRESSURE_LABEL[k]}</span><span>${v}/10</span></div><div class="pips">${pips}</div></div>`;
    }).join('');
    const slips = root.querySelector<HTMLElement>('#vb-slips')!;
    slips.innerHTML = state.inbox.length
      ? state.inbox.map((t, i) => `<div class="slip ${t.fallout ? 'fallout' : ''}" style="--r:${((i * 37) % 5) - 2}deg" data-id="${t.id}">${esc(t.title)}<div class="who">from ${NAME[t.assigner]} ${sideTag(t)}</div></div>`).join('')
      : `<div class="slip" style="--r:0deg">No slips left. <button id="vb-end">Go home</button></div>`;
    slips.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => (el.onclick = () => { memo = state.inbox.find((x) => x.id === Number(el.dataset.id))!; renderMemo(); }));
    const end = slips.querySelector<HTMLButtonElement>('#vb-end'); if (end) end.onclick = () => endDay();
    bumped.clear(); revealing = false;
  }
  function renderMemo() {
    const host = root.querySelector<HTMLElement>('#vb-modal')!;
    if (!memo || !state.inbox.some((x) => x.id === memo!.id)) { host.innerHTML = ''; memo = null; return; }
    const t = memo;
    const gs = grouped(t);
    const cards = gs.map((g, gi) => {
      if (g.key === 'delegate') {
        const allLocked = g.rows.every((r) => r.locked);
        return `<div class="card ${allLocked ? 'locked' : ''}"><div class="n">Delegate it</div><div class="hh">1h</div><div class="dg">${g.rows.map((r, ri) => `<button data-g="${gi}" data-r="${ri}" ${r.locked ? 'disabled' : ''} title="${esc(r.locked ?? r.note ?? '')}">${r.label.replace('Delegate to ', '→ ')} ${r.locked ? `<span class="reason">${esc(r.locked)}</span>` : chips(r.deltas)}</button>`).join('')}</div></div>`;
      }
      const r = g.rows[0];
      return `<div class="card ${r.locked ? 'locked' : ''}" data-g="${gi}" data-r="0"><div class="n">${g.label}</div><div class="hh">${r.hours}h</div><div>${chips(r.deltas, false)}</div>${r.note ? `<div class="note">${esc(r.note)}</div>` : ''}${r.locked ? `<div class="stamp">${esc(r.locked)}</div>` : ''}</div>`;
    }).join('');
    host.innerHTML = `<div id="vb-memo-bg"><div id="vb-memo"><button class="close">×</button><h2>${esc(t.title)}</h2><div class="meta">MEMO from ${NAME[t.assigner]} ${sideTag(t)} ${t.fallout ? '· <b style="color:#c22">FALLOUT</b>' : ''}</div><div class="grid">${cards}</div></div></div>`;
    host.querySelector<HTMLElement>('.close')!.onclick = () => { memo = null; renderMemo(); };
    host.querySelector<HTMLElement>('#vb-memo-bg')!.onclick = (e) => { if (e.target === e.currentTarget) { memo = null; renderMemo(); } };
    host.querySelectorAll<HTMLElement>('[data-g]').forEach((el) => (el.onclick = (e) => {
      e.stopPropagation();
      const c = gs[Number(el.dataset.g)].rows[Number(el.dataset.r)];
      if (c.locked) return;
      if (c.key !== 'sabotage') memo = null;
      choose(t, c);
    }));
  }
  const handler = (e: GameEvent) => {
    if (e.type === 'pressureChanged') bumped.add(e.key);
    if (e.type === 'goodwillRevealed') revealing = true;
    renderClock(); renderClip(); renderMemo();
  };
  on(handler);
  renderClock(); renderClip();
}

// PROTOTYPE, throwaway. Variant A, "Top bar + inbox drawer".
// Pressures are labelled bars across the top. Hours are 8 segments in the same bar.
// The inbox is a drawer on the right; clicking a Task expands its choices inline.
// Hovering a choice ghosts its effect onto the top bars.
import { choose, endDay, NAME, on, PRESSURE_LABEL, state, takeBreak, visiblePressures, type ChoiceView, type GameEvent } from '../game';
import { chips, COLOR, esc, grouped, sideTag } from '../shared';

const CSS = `
#va-top{position:fixed;top:10px;left:50%;transform:translateX(-50%);display:flex;gap:14px;align-items:center;background:rgba(250,248,242,.96);padding:8px 14px;border-radius:10px;box-shadow:0 3px 14px rgba(0,0,0,.35);font:12px system-ui;color:#222}
#va-top .p{width:130px}
#va-top .p .lbl{display:flex;justify-content:space-between;font-weight:600;font-size:11px}
#va-top .bar{position:relative;height:9px;background:#e4e0d6;border-radius:5px;overflow:hidden;margin-top:3px}
#va-top .fill{position:absolute;inset:0 auto 0 0;background:var(--c);transition:width .3s}
#va-top .ghost{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(45deg,var(--g) 0 3px,transparent 3px 6px);transition:all .15s}
#va-top .low .fill{animation:pulse 1s infinite}
@keyframes pulse{50%{opacity:.4}}
#va-top .hours{display:flex;gap:2px;margin-top:3px}
#va-top .hours i{width:11px;height:9px;border-radius:2px;background:#3a3f48}
#va-top .hours i.spent{background:#e4e0d6}
#va-top .hours i.preview{background:#ff9f1c}
#va-drawer{position:fixed;top:70px;right:10px;bottom:70px;width:330px;background:rgba(250,248,242,.97);border-radius:10px;box-shadow:0 3px 14px rgba(0,0,0,.35);font:13px system-ui;color:#222;display:flex;flex-direction:column}
#va-drawer header{padding:10px 12px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between;align-items:center;font-weight:700}
#va-drawer header button{font:12px system-ui;padding:3px 8px;cursor:pointer}
#va-drawer .list{overflow:auto;padding:6px}
#va-drawer .task{border:1px solid #ddd;border-radius:8px;margin-bottom:6px;background:#fff}
#va-drawer .task.fallout{border-color:#d33;background:#fff5f5}
#va-drawer .task .head{padding:8px 10px;cursor:pointer}
#va-drawer .task .who{font-size:11px;color:#666;margin-top:2px}
#va-drawer .task.open .head{border-bottom:1px solid #eee}
#va-drawer .row{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 10px;cursor:pointer;border-top:1px solid #f2f2f2}
#va-drawer .row:hover:not(.locked){background:#fff3e0}
#va-drawer .row .name{font-weight:600}
#va-drawer .row .h{font-size:11px;color:#555;white-space:nowrap}
#va-drawer .row .note{font-size:11px;color:#777}
#va-drawer .sub{padding-left:18px}
#va-drawer .empty{color:#888;padding:20px;text-align:center}
`;

export function mountA(root: HTMLElement) {
  root.innerHTML = `<style>${CSS}</style><div id="va-top"></div><div id="va-drawer"><header><span id="va-title"></span><span><button id="va-break">Break (1h, +2 Sanity)</button></span></header><div class="list" id="va-list"></div></div>`;
  let openId: number | null = null;
  let openDelegate = false;
  let preview: ChoiceView | null = null;
  const bumped = new Set<string>();
  let revealing = false;

  const top = root.querySelector<HTMLElement>('#va-top')!;
  const list = root.querySelector<HTMLElement>('#va-list')!;
  root.querySelector<HTMLButtonElement>('#va-break')!.onclick = () => takeBreak();

  function renderTop() {
    const ps = visiblePressures().map((k) => {
      const v = state.p[k];
      const d = preview?.deltas[k] ?? 0;
      const ghost = d ? `<div class="ghost" style="--g:${d > 0 ? '#2b2' : '#d22'};left:${Math.min(v, v + d) * 10}%;width:${Math.abs(d) * 10}%"></div>` : '';
      const cls = [v <= 2 ? 'low' : '', bumped.has(k) ? 'bump' : '', revealing && (k === 'launch' || k === 'paper') ? 'reveal' : ''].join(' ');
      return `<div class="p ${cls}" style="--c:${COLOR[k]}"><div class="lbl"><span>${PRESSURE_LABEL[k]}</span><span>${v}${d ? ` → ${Math.max(0, Math.min(10, v + d))}` : ''}</span></div><div class="bar"><div class="fill" style="width:${v * 10}%"></div>${ghost}</div></div>`;
    });
    const spendFrom = state.hours - (preview?.hours ?? 0);
    const hours = Array.from({ length: 8 }, (_, i) => `<i class="${i >= state.hours ? 'spent' : i >= spendFrom ? 'preview' : ''}"></i>`).join('');
    top.innerHTML = ps.join('') + `<div class="p" style="width:auto"><div class="lbl"><span>Workday</span><span>${state.hours}h left</span></div><div class="hours">${hours}</div></div>`;
    bumped.clear(); revealing = false;
  }

  function renderList() {
    root.querySelector('#va-title')!.textContent = `Inbox (${state.inbox.length})`;
    if (!state.inbox.length) { list.innerHTML = `<div class="empty">Inbox empty. <button id="va-end">End the day</button></div>`; list.querySelector<HTMLButtonElement>('#va-end')!.onclick = () => endDay(); return; }
    list.innerHTML = state.inbox.map((t) => {
      const open = t.id === openId;
      const gs = grouped(t); const flat = gs.flatMap((g) => g.rows);
      const rows = open ? gs.map((g) => {
        if (g.key === 'delegate') {
          const anyOpen = g.rows.some((r) => !r.locked);
          const head = `<div class="row ${anyOpen ? '' : 'locked'}" data-delegate="1"><div><div class="name">Delegate it ${openDelegate ? '▾' : '▸'}</div>${anyOpen ? '<div class="note">Pick a Colleague</div>' : `<div class="reason">Nobody will take it</div>`}</div><div class="h">1h</div></div>`;
          return head + (openDelegate ? g.rows.map((r) => rowHtml(r, flat.indexOf(r), true)).join('') : '');
        }
        return rowHtml(g.rows[0], flat.indexOf(g.rows[0]), false);
      }).join('') : '';
      return `<div class="task ${open ? 'open' : ''} ${t.fallout ? 'fallout' : ''}" data-id="${t.id}"><div class="head"><div>${esc(t.title)}</div><div class="who">${NAME[t.assigner]} ${sideTag(t)}</div></div>${rows}</div>`;
    }).join('');
    list.querySelectorAll<HTMLElement>('.task').forEach((el) => {
      const t = state.inbox.find((x) => x.id === Number(el.dataset.id))!;
      el.querySelector<HTMLElement>('.head')!.onclick = () => { openId = openId === t.id ? null : t.id; openDelegate = false; renderList(); };
      const views = grouped(t).flatMap((g) => g.rows);
      el.querySelectorAll<HTMLElement>('[data-c]').forEach((r) => {
        const c = views[Number(r.dataset.c)];
        r.onmouseenter = () => { preview = c.locked ? null : c; renderTop(); };
        r.onmouseleave = () => { preview = null; renderTop(); };
        r.onclick = () => { preview = null; choose(t, c); };
      });
      const dh = el.querySelector<HTMLElement>('[data-delegate]');
      if (dh) dh.onclick = () => { openDelegate = !openDelegate; renderList(); };
    });
  }
  function rowHtml(r: ChoiceView, idx: number, sub: boolean) {
    return `<div class="row ${sub ? 'sub' : ''} ${r.locked ? 'locked' : ''}" data-c="${idx}"><div><div class="name">${r.label}</div>${r.locked ? `<div class="reason">${esc(r.locked)}</div>` : `<div>${chips(r.deltas)}</div>${r.note ? `<div class="note">${esc(r.note)}</div>` : ''}`}</div><div class="h">${r.hours}h</div></div>`;
  }
  const handler = (e: GameEvent) => {
    if (e.type === 'pressureChanged') bumped.add(e.key);
    if (e.type === 'goodwillRevealed') revealing = true;
    if (e.type === 'taskResolved' && e.task.id === openId && e.choice !== 'sabotage') openId = null;
    renderTop(); renderList();
  };
  on(handler);
  renderTop(); renderList();
}

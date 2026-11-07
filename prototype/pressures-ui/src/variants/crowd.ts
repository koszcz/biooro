// PROTOTYPE, throwaway. Answers the "Crowded Task bubbles" ticket.
// Variant C ("In the world"), with three answers to "one person has five or more Tasks":
//   pile    (D): 3+ Tasks collapse into a pile. The most urgent bubble shows in full, with card
//                edges and a count behind it. Hover fans the pile out. The popover pages through them.
//   cap     (E): the two most urgent bubbles show in full, then a "+N more" pill. The pill opens
//                a list of all that person's Tasks in the popover.
//   summary (F): 3+ Tasks become one bubble, "Pan Zbigniew wants 6 things". It opens a wide
//                popover: that person's Tasks on the left, the chosen Task's choices on the right.
// All three share the same popover placement: right of the bubbles, flip left at the right edge,
// clamp to the screen, never cover the gauges or the hour blocks, and scroll inside if still too tall.
// Order everywhere: Fallout first, then oldest first.
// The pink "Edge test" button (top right) pins Pan Zbigniew to a screen edge.
import { choose, endDay, NAME, on, state, takeBreak, visiblePressures, type ChoiceView, type GameEvent, type Task } from '../game';
import { onFrame, screenPos, type Who } from '../scene';
import { chips, COLOR, esc, grouped, SHORT, sideTag } from '../shared';

type Mode = 'pile' | 'cap' | 'summary';
const CROWD = 3; // this many Tasks from one person counts as crowded
const BOTTOM_RESERVE = 110; // keep clear of the hour blocks and the switcher

const CSS = `
#vc-g{position:fixed;left:12px;top:50%;transform:translateY(-50%);display:flex;gap:8px;background:rgba(20,22,28,.7);padding:10px;border-radius:12px;z-index:5}
#vc-g .g{display:flex;flex-direction:column;align-items:center;gap:4px;font:600 10px system-ui;color:#eee;width:40px}
#vc-g .tube{position:relative;width:14px;height:150px;border-radius:7px;background:#3a3f48;overflow:hidden}
#vc-g .tube .f{position:absolute;left:0;right:0;bottom:0;background:var(--c);transition:height .3s}
#vc-g .tube .gh{position:absolute;left:0;right:0;background:repeating-linear-gradient(45deg,var(--x) 0 3px,transparent 3px 6px)}
#vc-g .low .f{animation:pulse 1s infinite}
@keyframes pulse{50%{opacity:.35}}
#vc-g .v{font:700 14px system-ui}
#vc-h{position:fixed;bottom:64px;left:50%;transform:translateX(-50%);display:flex;gap:4px;align-items:center;background:rgba(20,22,28,.7);padding:6px 10px;border-radius:10px;font:600 11px system-ui;color:#eee;z-index:5}
#vc-h i{width:26px;height:14px;border-radius:3px;background:#f2efe6}
#vc-h i.spent{background:#4a4f58}
#vc-h i.pv{background:#ff9f1c}
#vc-h button{margin-left:8px;font:11px system-ui;cursor:pointer}
.grp{position:fixed;display:flex;flex-direction:column-reverse;align-items:center;gap:12px;transform:translate(-50%,-100%);padding-top:6px}
.grp.dim{opacity:.35}
.bub{position:relative;background:#fff;border-radius:10px;padding:4px 8px;font:600 12px system-ui;color:#222;box-shadow:0 2px 8px rgba(0,0,0,.4);cursor:pointer;width:max-content;max-width:200px;line-height:1.3;text-align:center;border:2px solid var(--c,#999)}
.bub.fallout{background:#ffe5e5}
.bub:hover{transform:scale(1.06)}
.bub.tail:after{content:'';position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);border:6px solid transparent;border-top-color:var(--c,#999)}
.bub.open{outline:3px solid #ff9f1c}
/* pile */
.grp.pile .rest{display:none}
.grp.pile:hover .rest{display:block}
.grp.pile .top.stacked{box-shadow:0 -7px 0 -3px #f4f4f4,0 -7px 0 -1px #777,0 -14px 0 -6px #e8e8e8,0 -14px 0 -4px #888,0 2px 8px rgba(0,0,0,.4);margin-top:14px}
.grp.pile:hover .top.stacked{box-shadow:0 2px 8px rgba(0,0,0,.4);margin-top:0}
.badge{position:absolute;top:-10px;right:-10px;min-width:20px;height:20px;border-radius:10px;background:#222;color:#fff;font:700 11px/20px system-ui;text-align:center;padding:0 4px}
.badge.hot{background:#d33}
.grp.pile:hover .badge{display:none}
/* cap */
.more{background:#222;color:#fff;border-radius:999px;padding:3px 10px;font:600 11px system-ui;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.more .hot{color:#ff8a8a}
/* summary */
.sum{max-width:220px}
.sum .who{font-weight:700}
.sum .sub{font-weight:500;font-size:11px;color:#555}
.sum .sub .hot{color:#c22;font-weight:700}
#vc-pop{position:fixed;width:270px;background:#fff;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.5);font:12px system-ui;color:#222;padding:8px;overflow:auto;z-index:6}
#vc-pop.wide{width:540px;display:grid;grid-template-columns:220px 1fr;gap:8px}
#vc-pop .t{font-weight:700;margin-bottom:2px;padding-right:14px}
#vc-pop .w{font-size:11px;color:#666;margin-bottom:6px}
#vc-pop .c{display:flex;justify-content:space-between;gap:6px;padding:5px 6px;border-radius:6px;cursor:pointer}
#vc-pop .c:hover:not(.locked){background:#fff3e0}
#vc-pop .c b{font-size:12px}
#vc-pop .sub{margin-left:14px;border-left:2px solid #eee;border-radius:0 6px 6px 0}
#vc-pop .note{font-size:11px;color:#777}
#vc-pop .x{position:absolute;top:4px;right:8px;cursor:pointer;color:#999}
#vc-pop .pager{display:flex;justify-content:space-between;align-items:center;font:600 11px system-ui;color:#555;margin-bottom:6px;padding-right:16px}
#vc-pop .pager button{font:12px system-ui;cursor:pointer;width:26px}
#vc-pop .back{font-size:11px;color:#3b7dd8;cursor:pointer;margin-bottom:6px}
#vc-pop .li{padding:6px;border-radius:6px;cursor:pointer;border-left:4px solid var(--c,#999);margin-bottom:4px;background:#f6f6f6}
#vc-pop .li:hover{background:#fff3e0}
#vc-pop .li.fallout{background:#ffe5e5}
#vc-pop .li.sel{outline:2px solid #ff9f1c}
#vc-pop .list{border-right:1px solid #eee;padding-right:8px}
#vc-empty{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#fff;padding:6px 10px;border-radius:8px;font:12px system-ui}
#vc-edge{position:fixed;top:10px;right:10px;background:#ff2bd6;color:#fff;border:0;border-radius:8px;font:600 11px system-ui;padding:6px 10px;cursor:pointer;z-index:20}
`;

const urgent = (a: Task, b: Task) => Number(b.fallout) - Number(a.fallout) || a.id - b.id;
const EDGES = ['off', 'right', 'left', 'top', 'bottom'] as const;

export function mountCrowd(root: HTMLElement, mode: Mode) {
  root.innerHTML = `<style>${CSS}</style><div id="vc-g"></div><div id="vc-h"></div><div id="vc-b"></div><div id="vc-popwrap"></div><div id="vc-emptywrap"></div><button id="vc-edge"></button>`;
  let openWho: Who | null = null;
  let openId: number | null = null; // null with openWho set = list view (cap mode)
  let delegateOpen = false;
  let preview: ChoiceView | null = null;
  let revealing = false;
  let edge = 0;
  const bubbles = root.querySelector<HTMLElement>('#vc-b')!;
  const edgeBtn = root.querySelector<HTMLButtonElement>('#vc-edge')!;
  const renderEdge = () => (edgeBtn.textContent = `PROTOTYPE edge test: Zbigniew ${EDGES[edge]}`);
  edgeBtn.onclick = () => { edge = (edge + 1) % EDGES.length; renderEdge(); };
  renderEdge();

  function pos(who: Who) {
    const p = screenPos(who);
    if (!p || who !== 'zbigniew' || EDGES[edge] === 'off') return p;
    const e = EDGES[edge];
    if (e === 'right') return { x: innerWidth - 40, y: p.y };
    if (e === 'left') return { x: 120, y: p.y };
    if (e === 'top') return { x: p.x, y: 70 };
    return { x: p.x, y: innerHeight - BOTTOM_RESERVE + 20 };
  }
  const tasksOf = (who: Who) => state.inbox.filter((t) => t.assigner === who).sort(urgent);
  const colorOf = (t: Task) => (t.side && state.goodwillVisible ? COLOR[t.side] : '#999');
  const bub = (t: Task, cls = '') => `<div class="bub ${cls} ${t.fallout ? 'fallout' : ''} ${t.id === openId ? 'open' : ''}" data-id="${t.id}" style="--c:${colorOf(t)}">${t.fallout ? '⚠ ' : ''}${esc(t.title)}</div>`;

  function renderGauges() {
    root.querySelector('#vc-g')!.innerHTML = visiblePressures().map((k) => {
      const v = state.p[k], d = preview?.deltas[k] ?? 0;
      const gh = d ? `<div class="gh" style="--x:${d > 0 ? '#5f5' : '#f55'};bottom:${Math.min(v, v + d) * 10}%;height:${Math.abs(d) * 10}%"></div>` : '';
      return `<div class="g ${v <= 2 ? 'low' : ''} ${revealing && k !== 'performance' && k !== 'sanity' ? 'reveal' : ''}" style="--c:${COLOR[k]}"><div class="v">${v}</div><div class="tube"><div class="f" style="height:${v * 10}%"></div>${gh}</div><div>${SHORT[k]}</div></div>`;
    }).join('');
    revealing = false;
  }
  function renderHours() {
    const from = state.hours - (preview?.hours ?? 0);
    root.querySelector('#vc-h')!.innerHTML = `<span style="margin-right:6px">${state.hours}h</span>` + Array.from({ length: 8 }, (_, i) => `<i class="${i >= state.hours ? 'spent' : i >= from ? 'pv' : ''}"></i>`).join('') + `<button id="vc-break">Break</button>`;
    root.querySelector<HTMLButtonElement>('#vc-break')!.onclick = () => takeBreak();
  }

  // ---------- bubbles ----------
  function groupHtml(who: Who, ts: Task[]) {
    const crowded = ts.length >= CROWD;
    const hot = ts.filter((t) => t.fallout).length;
    let inner = '';
    if (!crowded) inner = ts.map((t, i) => bub(t, i === 0 ? 'tail' : '')).join('');
    else if (mode === 'pile') {
      inner = bub(ts[0], 'tail top stacked').replace('</div>', `<span class="badge ${hot ? 'hot' : ''}">${ts.length}</span></div>`) + ts.slice(1).map((t) => bub(t, 'rest')).join('');
    } else if (mode === 'cap') {
      const rest = ts.length - 2, restHot = ts.slice(2).filter((t) => t.fallout).length;
      inner = bub(ts[0], 'tail') + bub(ts[1]) + `<div class="more" data-list="1">+${rest} more from ${NAME[who]}${restHot ? ` <span class="hot">⚠ ${restHot}</span>` : ''}</div>`;
    } else {
      const sides = new Set(ts.map((t) => t.side));
      const c = sides.size === 1 && ts[0].side && state.goodwillVisible ? COLOR[ts[0].side] : '#999';
      inner = `<div class="bub tail sum ${hot ? 'fallout' : ''} ${openWho === who ? 'open' : ''}" data-list="1" style="--c:${c}"><div class="who">${NAME[who]} wants ${ts.length} things</div><div class="sub">${hot ? `<span class="hot">⚠ ${hot} Fallout</span> · ` : ''}click to see them</div></div>`;
    }
    return `<div class="grp ${mode} ${openWho && openWho !== who ? 'dim' : ''}" data-who="${who}">${inner}</div>`;
  }
  function renderBubbles() {
    const whos = [...new Set(state.inbox.map((t) => t.assigner))];
    bubbles.innerHTML = whos.map((w) => groupHtml(w, tasksOf(w))).join('');
    bubbles.querySelectorAll<HTMLElement>('.grp').forEach((g) => {
      const who = g.dataset.who as Who;
      g.querySelectorAll<HTMLElement>('[data-id]').forEach((el) => (el.onclick = () => openTask(who, Number(el.dataset.id))));
      g.querySelectorAll<HTMLElement>('[data-list]').forEach((el) => (el.onclick = () => openList(who)));
    });
    const ew = root.querySelector('#vc-emptywrap')!;
    ew.innerHTML = state.inbox.length ? '' : `<div id="vc-empty">Nobody wants anything. <button id="vc-end">End the day</button></div>`;
    const end = ew.querySelector<HTMLButtonElement>('#vc-end'); if (end) end.onclick = () => endDay();
    place();
  }
  function openTask(who: Who, id: number) { openWho = who; openId = id; delegateOpen = false; renderBubbles(); renderPop(); }
  function openList(who: Who) {
    openWho = who; delegateOpen = false;
    openId = mode === 'summary' ? tasksOf(who)[0]?.id ?? null : null; // summary shows list + first Task side by side
    renderBubbles(); renderPop();
  }
  function close() { openWho = null; openId = null; preview = null; renderBubbles(); renderPop(); renderGauges(); renderHours(); }

  function place() {
    bubbles.querySelectorAll<HTMLElement>('.grp').forEach((g) => {
      const p = pos(g.dataset.who as Who);
      if (!p) return;
      const w = g.offsetWidth, h = g.offsetHeight;
      g.style.left = Math.max(w / 2 + 8, Math.min(innerWidth - w / 2 - 8, p.x)) + 'px';
      g.style.top = Math.max(h + 8, Math.min(innerHeight - BOTTOM_RESERVE, p.y)) + 'px';
    });
    const pop = root.querySelector<HTMLElement>('#vc-pop');
    const g = openWho && bubbles.querySelector<HTMLElement>(`.grp[data-who="${openWho}"]`);
    if (!pop || !g) return;
    const r = g.getBoundingClientRect();
    const maxH = innerHeight - BOTTOM_RESERVE - 10;
    pop.style.maxHeight = maxH + 'px';
    const pw = pop.offsetWidth, ph = Math.min(pop.scrollHeight, maxH);
    let x = r.right + 12;
    if (x + pw > innerWidth - 8) x = r.left - 12 - pw; // flip to the left side
    const minX = root.querySelector('#vc-g')!.getBoundingClientRect().right + 8; // never cover the gauges: they show the hover preview
    x = Math.max(minX, Math.min(innerWidth - pw - 8, x)); // still too wide: clamp
    const y = Math.max(10, Math.min(innerHeight - BOTTOM_RESERVE - ph, r.bottom - ph / 2 - 20));
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }
  onFrame.push(place);

  // ---------- popover ----------
  function choicesHtml(t: Task) {
    const gs = grouped(t);
    return gs.map((g, gi) => {
      if (g.key === 'delegate') {
        const allLocked = g.rows.every((r) => r.locked);
        const head = `<div class="c dh ${allLocked ? 'locked' : ''}"><div><b>Delegate it ${delegateOpen ? '▾' : '▸'}</b><div>${allLocked ? `<span class="reason">Nobody will take it</span>` : '<span class="note">Pick a Colleague</span>'}</div></div><span>1h</span></div>`;
        const rows = delegateOpen ? g.rows.map((r, ri) => `<div class="c sub ${r.locked ? 'locked' : ''}" data-g="${gi}" data-r="${ri}"><div><b>${r.label.replace('Delegate to ', '')}</b><div>${r.locked ? `<span class="reason">${esc(r.locked)}</span>` : chips(r.deltas)}</div>${!r.locked && r.note ? `<div class="note">${esc(r.note)}</div>` : ''}</div></div>`).join('') : '';
        return head + rows;
      }
      const r = g.rows[0];
      return `<div class="c ${r.locked ? 'locked' : ''}" data-g="${gi}" data-r="0"><div><b>${g.label}</b><div>${r.locked ? `<span class="reason">${esc(r.locked)}</span>` : chips(r.deltas)}</div></div><span>${r.hours}h</span></div>`;
    }).join('');
  }
  const head = (t: Task) => `<div class="t">${t.fallout ? '⚠ ' : ''}${esc(t.title)}</div><div class="w">${NAME[t.assigner]} ${sideTag(t)}</div>`;
  const listHtml = (ts: Task[]) => ts.map((t) => `<div class="li ${t.fallout ? 'fallout' : ''} ${t.id === openId ? 'sel' : ''}" data-pick="${t.id}" style="--c:${colorOf(t)}">${t.fallout ? '⚠ ' : ''}${esc(t.title)}</div>`).join('');

  function renderPop() {
    const wrap = root.querySelector<HTMLElement>('#vc-popwrap')!;
    const ts = openWho ? tasksOf(openWho) : [];
    if (!openWho || !ts.length) { wrap.innerHTML = ''; openWho = null; openId = null; return; }
    if (openId !== null && !ts.some((t) => t.id === openId)) openId = mode === 'cap' && ts.length >= CROWD ? null : ts[0].id; // resolved: move on
    const t = ts.find((x) => x.id === openId);
    const crowded = ts.length >= CROWD;
    let body = '';
    let wide = false;
    if (mode === 'summary' && crowded) {
      wide = true;
      body = `<div class="list"><div class="t">${NAME[openWho]} · ${ts.length} Tasks</div>${listHtml(ts)}</div><div>${t ? head(t) + choicesHtml(t) : ''}</div>`;
    } else if (!t) {
      body = `<div class="t">${NAME[openWho]} · ${ts.length} Tasks</div><div class="w">Most urgent first</div>${listHtml(ts)}`;
    } else {
      const idx = ts.indexOf(t);
      const nav = mode === 'pile' && ts.length > 1 ? `<div class="pager"><button data-step="-1">‹</button>${idx + 1} of ${ts.length} from ${NAME[openWho]}<button data-step="1">›</button></div>` : '';
      const back = mode === 'cap' && crowded ? `<div class="back" data-back="1">← All ${ts.length} from ${NAME[openWho]}</div>` : '';
      body = nav + back + head(t) + choicesHtml(t);
    }
    wrap.innerHTML = `<div id="vc-pop" class="${wide ? 'wide' : ''}"><span class="x">×</span>${body}</div>`;
    wrap.querySelector<HTMLElement>('.x')!.onclick = close;
    wrap.querySelectorAll<HTMLElement>('[data-pick]').forEach((el) => (el.onclick = () => { openId = Number(el.dataset.pick); delegateOpen = false; renderBubbles(); renderPop(); }));
    wrap.querySelectorAll<HTMLElement>('[data-step]').forEach((el) => (el.onclick = () => { const i = ts.indexOf(t!) + Number(el.dataset.step); openId = ts[(i + ts.length) % ts.length].id; delegateOpen = false; renderBubbles(); renderPop(); }));
    const back = wrap.querySelector<HTMLElement>('[data-back]'); if (back) back.onclick = () => { openId = null; renderBubbles(); renderPop(); };
    const dh = wrap.querySelector<HTMLElement>('.dh'); if (dh) dh.onclick = () => { delegateOpen = !delegateOpen; renderPop(); };
    if (t) {
      const gs = grouped(t);
      wrap.querySelectorAll<HTMLElement>('[data-g]').forEach((el) => {
        const c = gs[Number(el.dataset.g)].rows[Number(el.dataset.r)];
        el.onmouseenter = () => { preview = c.locked ? null : c; renderGauges(); renderHours(); };
        el.onmouseleave = () => { preview = null; renderGauges(); renderHours(); };
        el.onclick = (e) => { e.stopPropagation(); if (c.locked) return; preview = null; choose(t, c); };
      });
    }
    place();
  }
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  const handler = (e: GameEvent) => {
    if (e.type === 'goodwillRevealed') revealing = true;
    renderGauges(); renderHours(); renderBubbles(); renderPop();
  };
  on(handler);
  renderGauges(); renderHours(); renderBubbles();
}

// PROTOTYPE, throwaway. Answers the "Conversation interface" ticket.
// Three answers, each on top of variant E (the chosen Task bubbles with a "+N more" pill):
//   world (G): walk to talk. Lines are speech bubbles over the speaker. The speaker's Task bubbles hide.
//              Ink choices are bubbles over the Intern. A dot badge marks who still has a Conversation.
//              Brush-offs are a short bubble with no walk. Scripted scenes add letterbox bars.
//   panel (H): talk from anywhere, no walk. A bottom panel with a portrait, the line, and numbered
//              choices. Name plates over everyone show "can talk" or "talked". Scripted scenes dim the
//              office and show a title card.
//   log   (I): walk to talk. A right-hand column keeps the day's transcript. Choices are reply chips
//              under it. The column header counts Conversations left. Scripted scenes widen it to centre.
// Shared everywhere: 45 chars/s reveal, one blip per 2 chars, click/Space/Enter completes then advances,
// keys 1-3 pick a choice. The pink box (top left) changes speed, Escalation tier, effects, and plays scenes.
import { on, PRESSURE_LABEL, state, type PressureKey } from '../game';
import { faceIntern, hooks, onFrame, screenPos, walkNear, type Who } from '../scene';
import { COLOR, esc, SHORT } from '../shared';
import {
  availability, brushOff, COLLEAGUES, convoFor, FACTION_COLOR, knobs, readLine, run, SCENES, SPEAKER_NAME, talking,
  type Convo, type Line, type Option, type TalkUI,
} from '../talk';
import { mountCrowd } from './crowd';

type Mode = 'world' | 'panel' | 'log';
const PEOPLE: Who[] = ['zbigniew', ...COLLEAGUES];

const CSS = `
#tk-knobs{position:fixed;top:10px;left:10px;background:#ff2bd6;color:#fff;font:11px system-ui;padding:6px 8px;border-radius:8px;z-index:30;max-width:330px}
#tk-knobs button{font:11px system-ui;margin:2px 2px 0 0;cursor:pointer}
#tk-knobs button.on{background:#fff;color:#ff2bd6;font-weight:700}
.tk-say{position:fixed;transform:translate(-50%,-100%);max-width:280px;background:#fff;color:#222;font:15px/1.35 system-ui;padding:9px 12px;border-radius:14px;border:3px solid var(--c);box-shadow:0 4px 14px rgba(0,0,0,.35);z-index:8;pointer-events:none}
.tk-say:after{content:'';position:absolute;left:50%;bottom:-19px;transform:translateX(-50%);border:8px solid transparent;border-top-color:var(--c)}
.tk-say b{display:block;font:700 10px system-ui;text-transform:uppercase;letter-spacing:.05em;color:var(--c)}
.tk-say.brush{font-size:13px;opacity:.95;animation:fade 2.6s forwards}
.tk-say .t.done:after,.tk-pan .t.done:after,.tk-log .cur.done:after{content:' ▸';color:#aaa}
@keyframes fade{0%,75%{opacity:1}100%{opacity:0}}
.tk-opts{position:fixed;transform:translate(-50%,-100%);display:flex;flex-direction:column;gap:6px;z-index:9}
.tk-opts button,.tk-chips button,.tk-pan .opts button{font:14px system-ui;text-align:left;background:#fff8ee;border:2px solid #ff8a1f;border-radius:12px;padding:6px 10px;cursor:pointer;color:#222}
.tk-opts button:hover,.tk-chips button:hover,.tk-pan .opts button:hover{background:#ff8a1f;color:#fff}
.tk-opts button i,.tk-chips button i,.tk-pan .opts button i{font-style:normal;font-weight:700;margin-right:6px;opacity:.6}
.tk-mark{position:fixed;transform:translate(-50%,0);z-index:4;pointer-events:none;font:700 11px system-ui}
.tk-mark.dot{width:22px;height:16px;border-radius:9px;background:#fff;color:#222;text-align:center;line-height:12px;border:2px solid var(--c)}
.tk-mark.dot.used{opacity:.35;border-color:#888}
.tk-hover{position:fixed;transform:translate(-50%,0);z-index:9;pointer-events:none;font:700 12px system-ui;background:#222;color:#fff;padding:3px 8px;border-radius:6px;white-space:nowrap;border-bottom:3px solid var(--c)}
.tk-hover.no{background:#555;color:#ddd;font-weight:500}
.tk-mark.plate{background:rgba(20,22,28,.75);color:#fff;padding:2px 7px;border-radius:6px;border-left:4px solid var(--c);white-space:nowrap}
.tk-mark.plate.used{color:#aaa}
.tk-bars:before,.tk-bars:after{content:'';position:fixed;left:0;right:0;height:9vh;background:#000;z-index:7;animation:bar .4s ease-out}
.tk-bars:before{top:0}.tk-bars:after{bottom:0}
@keyframes bar{from{height:0}}
.tk-title{position:fixed;top:3vh;left:50%;transform:translateX(-50%);color:#fff;font:600 14px system-ui;letter-spacing:.08em;text-transform:uppercase;z-index:12}
.tk-scrim{position:fixed;inset:0;background:rgba(10,12,16,.55);z-index:7}
.tk-pan{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);width:min(760px,92vw);display:flex;gap:14px;background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.5);padding:14px;z-index:10;color:#222;font:16px/1.4 system-ui}
.tk-pan .face{flex:none;width:64px;height:64px;border-radius:50%;background:var(--c);color:#fff;font:700 26px system-ui;display:flex;align-items:center;justify-content:center}
.tk-pan .nm{font:700 11px system-ui;text-transform:uppercase;letter-spacing:.05em;color:var(--c)}
.tk-pan .body{flex:1}
.tk-pan .opts{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.tk-pan .hint{font:11px system-ui;color:#999;margin-top:4px}
.tk-log{position:fixed;top:60px;right:10px;bottom:120px;width:300px;background:rgba(255,255,255,.96);border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.45);z-index:10;display:flex;flex-direction:column;font:14px/1.4 system-ui;color:#222;transition:all .3s}
.tk-log.closed{bottom:auto;height:auto}
.tk-log.closed .scroll,.tk-log.closed .tk-chips{display:none}
.tk-log.stage{left:50%;right:auto;width:560px;transform:translateX(-50%);top:12vh;bottom:18vh}
.tk-log h4{margin:0;padding:8px 10px;font:700 12px system-ui;border-bottom:1px solid #eee;display:flex;justify-content:space-between;cursor:pointer}
.tk-log .roster{font:11px system-ui;padding:4px 10px;border-bottom:1px solid #eee;display:flex;flex-wrap:wrap;gap:4px}
.tk-log .roster span{padding:1px 6px;border-radius:4px;border-left:3px solid var(--c);background:#f3f3f3}
.tk-log .roster span.used{color:#aaa}
.tk-log .scroll{flex:1;overflow:auto;padding:8px 10px}
.tk-log .ln{margin:0 0 6px}.tk-log .ln b{color:var(--c);font-size:11px;text-transform:uppercase;margin-right:4px}
.tk-log .ln.me{text-align:right}.tk-log .ln.brush{color:#999;font-style:italic}
.tk-log .sep{font:10px system-ui;color:#bbb;text-align:center;margin:8px 0}
.tk-chips{display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-top:1px solid #eee}
.tk-float{position:fixed;left:240px;z-index:20;font:700 14px system-ui;padding:3px 8px;border-radius:999px;color:#fff;background:var(--c);animation:rise 1.8s forwards;pointer-events:none}
@keyframes rise{from{transform:translateY(0);opacity:1}to{transform:translateY(-40px);opacity:0}}
`;

export function mountTalk(root: HTMLElement, mode: Mode) {
  mountCrowd(root, 'cap');
  root.insertAdjacentHTML('beforeend', `<style>${CSS}</style><style id="tk-dyn"></style><div id="tk-marks"></div><div id="tk-layer"></div><div id="tk-knobs"></div>`);
  const layer = root.querySelector<HTMLElement>('#tk-layer')!;
  const marks = root.querySelector<HTMLElement>('#tk-marks')!;
  const dyn = root.querySelector<HTMLElement>('#tk-dyn')!;
  const anchored: { el: HTMLElement; who: Who; dy: number }[] = [];
  onFrame.push(() => {
    for (const a of anchored) { const p = screenPos(a.who); if (p) { a.el.style.left = `${p.x}px`; a.el.style.top = `${p.y + a.dy}px`; } }
  });
  const anchor = (el: HTMLElement, who: Who, dy = 0) => { anchored.push({ el, who, dy }); return el; };
  const unanchor = (el: HTMLElement) => { const i = anchored.findIndex((a) => a.el === el); if (i >= 0) anchored.splice(i, 1); el.remove(); };

  /** While talking: hide the partner's Task bubbles, dim the rest, block Task clicks. Scripted: hide the HUD. */
  function setFocus(partner: Who | null, scripted: boolean) {
    dyn.textContent = !talking && !partner && !scripted ? '' : `
      #vc-b{pointer-events:none}#vc-b .grp{opacity:.25}#vc-popwrap{display:none}
      ${partner ? `#vc-b .grp[data-who="${partner}"]{display:none}` : ''}
      ${mode === 'panel' ? '#vc-h{display:none}' : ''}
      ${scripted ? '#vc-b,#vc-g,#vc-h,#tk-marks{display:none}' : ''}`;
  }

  // ---------- availability markers ----------
  const left = () => COLLEAGUES.filter((w) => availability(w) === 'convo').length;
  function renderMarks() {
    for (const a of [...anchored]) if (a.el.parentElement === marks) unanchor(a.el);
    if (mode === 'log') { renderLogHead(); return; }
    for (const w of PEOPLE) {
      const av = availability(w);
      const el = document.createElement('div');
      el.style.setProperty('--c', FACTION_COLOR[w]);
      if (mode === 'world') {
        if (av === 'boss') continue;
        el.className = `tk-mark dot ${av === 'used' ? 'used' : ''}`; el.textContent = '…';
      } else {
        el.className = `tk-mark plate ${av === 'used' ? 'used' : ''}`;
        el.textContent = `${SPEAKER_NAME[w]} · ${av === 'convo' ? '💬 can talk' : av === 'used' ? 'talked today' : 'Boss'}`;
      }
      marks.append(anchor(el, w, 14));
    }
  }

  // ---------- effect float ----------
  function effect(k: PressureKey, d: number) {
    const el = document.createElement('div');
    el.className = 'tk-float'; el.style.setProperty('--c', COLOR[k]);
    el.style.top = `${innerHeight / 2 - 20}px`;
    el.textContent = `${d > 0 ? '+' : '−'}${Math.abs(d)} ${PRESSURE_LABEL[k]}`;
    layer.append(el); setTimeout(() => el.remove(), 1900);
  }
  const optLabel = (o: Option, i: number) => `<i>${i + 1}</i>${esc(o.text)}${knobs.showEffects && o.effect ? ` <span class="chip" style="--c:${COLOR[o.effect[0]]}">${o.effect[1] > 0 ? '+' : '−'}1 ${SHORT[o.effect[0]]}</span>` : ''}`;
  function pick(btns: HTMLButtonElement[]): Promise<number> {
    return new Promise((res) => {
      const key = (e: KeyboardEvent) => { const n = Number(e.key) - 1; if (btns[n]) { e.preventDefault(); done(n); } };
      const done = (n: number) => { removeEventListener('keydown', key, true); res(n); };
      btns.forEach((b, i) => (b.onclick = (e) => { e.stopPropagation(); done(i); }));
      addEventListener('keydown', key, true);
    });
  }

  // ---------- G: world ----------
  function worldUI(): TalkUI {
    let opts: HTMLElement | null = null;
    return {
      begin(c, partner) { setFocus(partner, !!c.scripted); if (c.scripted) layer.insertAdjacentHTML('beforeend', `<div class="tk-bars"></div><div class="tk-title">${esc(c.scripted)}</div>`); },
      async line(l) {
        const who = (l.who === 'headoffice' ? 'zbigniew' : l.who) as Who;
        const el = document.createElement('div');
        el.className = 'tk-say'; el.style.setProperty('--c', FACTION_COLOR[l.who]);
        el.innerHTML = `<b>${esc(SPEAKER_NAME[l.who])}</b><span class="t"></span>`;
        if (l.who === 'headoffice') { el.style.left = '50%'; el.style.top = '22vh'; layer.append(el); }
        else layer.append(anchor(el, who, 0));
        await readLine(el.querySelector('.t')!, l);
        unanchor(el);
      },
      choose(options) {
        opts = document.createElement('div'); opts.className = 'tk-opts';
        opts.innerHTML = options.map((o, i) => `<button>${optLabel(o, i)}</button>`).join('');
        layer.append(anchor(opts, 'intern', 0));
        return pick([...opts.querySelectorAll('button')]).then((n) => { unanchor(opts!); return n; });
      },
      effect,
      end() { layer.querySelectorAll('.tk-bars,.tk-title').forEach((e) => e.remove()); setFocus(null, false); renderMarks(); },
    };
  }
  function worldBrush(w: Who) {
    const l = brushOff(w), el = document.createElement('div');
    el.className = 'tk-say brush'; el.style.setProperty('--c', FACTION_COLOR[w]);
    el.innerHTML = `<b>${esc(SPEAKER_NAME[w])}</b>${esc(l.text)}`;
    layer.append(anchor(el, w, -8)); setTimeout(() => unanchor(el), 2600);
  }

  // ---------- H: panel ----------
  function panelUI(): TalkUI {
    const pan = document.createElement('div'); pan.className = 'tk-pan';
    return {
      begin(c, partner) {
        setFocus(partner, !!c.scripted);
        if (c.scripted) layer.insertAdjacentHTML('beforeend', `<div class="tk-scrim"></div><div class="tk-title">${esc(c.scripted)}</div>`);
        layer.append(pan);
      },
      async line(l) {
        pan.style.setProperty('--c', FACTION_COLOR[l.who]);
        pan.innerHTML = `<div class="face">${SPEAKER_NAME[l.who][0]}</div><div class="body"><div class="nm">${esc(SPEAKER_NAME[l.who])}</div><div class="t"></div><div class="hint">click or Space</div></div>`;
        await readLine(pan.querySelector('.t')!, l);
      },
      choose(options) {
        pan.querySelector('.hint')!.remove();
        pan.querySelector('.body')!.insertAdjacentHTML('beforeend', `<div class="opts">${options.map((o, i) => `<button>${optLabel(o, i)}</button>`).join('')}</div>`);
        return pick([...pan.querySelectorAll<HTMLButtonElement>('.opts button')]);
      },
      effect,
      end() { pan.remove(); layer.querySelectorAll('.tk-scrim,.tk-title').forEach((e) => e.remove()); setFocus(null, false); renderMarks(); },
    };
  }

  // ---------- I: log ----------
  let log: HTMLElement | null = null;
  let logOpen = false;
  function ensureLog() {
    if (log) return log;
    log = document.createElement('div'); log.className = 'tk-log closed';
    log.innerHTML = `<h4></h4><div class="roster"></div><div class="scroll"></div><div class="tk-chips"></div>`;
    log.querySelector('h4')!.onclick = () => { if (!talking) { logOpen = !logOpen; log!.classList.toggle('closed', !logOpen); renderLogHead(); } };
    layer.append(log); return log;
  }
  function renderLogHead() {
    const l = ensureLog();
    l.querySelector('h4')!.innerHTML = `<span>Today's talk · ${left()} of ${COLLEAGUES.length} left</span><span>${talking ? '' : logOpen ? '▴' : '▾'}</span>`;
    l.querySelector('.roster')!.innerHTML = COLLEAGUES.map((w) => `<span class="${availability(w) === 'used' ? 'used' : ''}" style="--c:${FACTION_COLOR[w]}">${SPEAKER_NAME[w]}${availability(w) === 'used' ? ' ✓' : ''}</span>`).join('');
  }
  function logAppend(l: Line, cls = '') {
    const sc = ensureLog().querySelector<HTMLElement>('.scroll')!;
    const p = document.createElement('p');
    p.className = `ln ${l.who === 'intern' ? 'me' : ''} ${cls}`; p.style.setProperty('--c', FACTION_COLOR[l.who]);
    p.innerHTML = `<b>${esc(SPEAKER_NAME[l.who])}</b><span class="cur"></span>`;
    sc.append(p); sc.scrollTop = sc.scrollHeight;
    return p.querySelector<HTMLElement>('.cur')!;
  }
  function logUI(): TalkUI {
    return {
      begin(c, partner) {
        const l = ensureLog(); setFocus(partner, !!c.scripted);
        l.classList.remove('closed'); l.classList.toggle('stage', !!c.scripted);
        if (c.scripted) layer.insertAdjacentHTML('afterbegin', `<div class="tk-scrim"></div><div class="tk-title">${esc(c.scripted)}</div>`);
        l.querySelector('.scroll')!.insertAdjacentHTML('beforeend', `<div class="sep">${esc(c.scripted ?? `${SPEAKER_NAME[partner!]} · ${['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][state.day]}`)}</div>`);
        renderLogHead();
      },
      async line(l) {
        const el = logAppend(l);
        await readLine(el, l);
        el.classList.remove('cur'); el.classList.remove('done');
      },
      choose(options) {
        const ch = ensureLog().querySelector<HTMLElement>('.tk-chips')!;
        ch.innerHTML = options.map((o, i) => `<button>${optLabel(o, i)}</button>`).join('');
        return pick([...ch.querySelectorAll('button')]).then((n) => { ch.innerHTML = ''; return n; });
      },
      effect,
      end() {
        layer.querySelectorAll('.tk-scrim,.tk-title').forEach((e) => e.remove());
        log!.classList.remove('stage'); log!.classList.toggle('closed', !logOpen);
        setFocus(null, false); renderLogHead();
      },
    };
  }
  function logBrush(w: Who) {
    worldBrush(w);
    const l = brushOff(w); const el = logAppend(l, 'brush'); el.textContent = l.text; el.classList.remove('cur');
  }

  // ---------- starting a Conversation ----------
  const ui = () => (mode === 'world' ? worldUI() : mode === 'panel' ? panelUI() : logUI());
  async function start(c: Convo, partner: Who | null, walk: Who | null) {
    if (talking) return;
    hooks.locked = true;
    hooks.onActorHover?.(null);
    if (walk && mode !== 'panel') await walkNear(walk);
    const turnBack = walk && mode !== 'panel' ? faceIntern(walk) : null;
    await run(c, partner, ui());
    turnBack?.();
    hooks.locked = false;
    renderMarks(); renderKnobs();
  }
  hooks.onActorClick = (w) => {
    if (talking || hooks.locked) return;
    const c = convoFor(w);
    if (!c) { mode === 'world' ? worldBrush(w) : mode === 'log' ? logBrush(w) : void run({ lines: [brushOff(w)] }, null, panelUI()); return; }
    void start(c, w, w);
  };

  // ---------- hover cue: what a click on this person will do ----------
  let hoverEl: HTMLElement | null = null;
  hooks.onActorHover = (w) => {
    if (hoverEl) { unanchor(hoverEl); hoverEl = null; }
    if (!w || talking) return;
    const av = availability(w);
    hoverEl = document.createElement('div');
    hoverEl.className = `tk-hover ${av === 'convo' ? '' : 'no'}`;
    hoverEl.style.setProperty('--c', FACTION_COLOR[w]);
    hoverEl.textContent = av === 'convo' ? `💬 Talk to ${SPEAKER_NAME[w]}` : av === 'used' ? `${SPEAKER_NAME[w]} · talked today` : `${SPEAKER_NAME[w]} · busy (Boss)`;
    layer.append(anchor(hoverEl, w, 36));
  };

  // ---------- prototype knobs ----------
  const knobsEl = root.querySelector<HTMLElement>('#tk-knobs')!;
  function renderKnobs() {
    const b = (id: string, label: string, on = false) => `<button data-k="${id}" class="${on ? 'on' : ''}">${label}</button>`;
    knobsEl.innerHTML = `<b>PROTOTYPE talk</b> · click a person to talk<br>
      speed ${[30, 45, 60].map((n) => b(`cps:${n}`, `${n}/s`, knobs.cps === n)).join('')}
      tier ${[1, 2, 3].map((n) => b(`tier:${n}`, `${n}`, knobs.tier === n)).join('')}<br>
      ${b('blips', `blips ${knobs.blips ? 'on' : 'off'}`, knobs.blips)}${b('fx', `effects on choices ${knobs.showEffects ? 'shown' : 'hidden'}`, knobs.showEffects)}<br>
      scene ${b('s:onboarding', 'Mon onboarding')}${b('s:audit', 'Fri audit')}${b('s:firing', 'Firing')}${b('s:survival', 'Survival')}`;
    knobsEl.querySelectorAll<HTMLButtonElement>('button').forEach((el) => (el.onclick = () => {
      const [k, v] = el.dataset.k!.split(':');
      if (k === 'cps') knobs.cps = Number(v);
      if (k === 'tier') knobs.tier = Number(v) as 1 | 2 | 3;
      if (k === 'blips') knobs.blips = !knobs.blips;
      if (k === 'fx') knobs.showEffects = !knobs.showEffects;
      if (k === 's') void start(SCENES[v], null, v === 'onboarding' || v === 'firing' ? 'zbigniew' : null);
      renderKnobs();
    }));
  }
  renderKnobs();
  // markers wait for the scene to load its actors
  const wait = setInterval(() => { if (screenPos('kamil')) { clearInterval(wait); renderMarks(); } }, 200);
  on((e) => { if (e.type === 'dayStarted') renderMarks(); });
}

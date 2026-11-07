// PROTOTYPE, throwaway. Answers the "How Task choices play out" ticket.
// Three answers, each on top of variant G (Task bubbles with "+N more", Conversations in the world):
//   wait  (J): go there and wait it out. The Intern walks to the Task's place and plays a clip.
//              Hour blocks drain one by one while it plays. Pressures change when it finishes.
//              Input is locked, as in a Conversation. Task bubbles dim and cannot be clicked.
//   bg    (K): instant, played out in the background. Hours and Pressures change at the click, as today.
//              Then the Intern walks off and plays the clip as flavour. The player keeps full control:
//              a click on the floor, a person, or another Task drops the flavour. Fakes skip the walk.
//   queue (L): a work queue. Hours are booked at the click. Pressures change when each action finishes.
//              The Intern works through the queue in order. Task bubbles stay live, so the player can
//              queue more. Walking and talking wait until the queue is empty. Queued items can be cancelled.
// Shared everywhere:
//   - Each Task has a place, found from its title. A Task with no clear place happens at the Intern's desk.
//   - Do it: walk there, play the place's clip. Fake it: a shorter go, then a "✨ looks done" sparkle.
//   - Sabotage it: at the place, a kick or a fiddle, with a purple "🤫" tag only the player sees.
//     Nobody turns to look.
//   - Delegate it: the Intern asks the Colleague. The Colleague walks to the place, works, and walks home.
//     Ryszard says yes and does nothing. Kamil takes a Launch Team Task to Pani Halina instead.
// The pink box (top left, under the talk knobs) sets seconds per hour and shows the place of each Task.
import { applyChoice, choiceHook, endDay, NAME, on, spendHours, state, visibleDeltas, PRESSURE_LABEL, type ChoiceView, type Task } from '../game';
import { clip, faceIntern, hooks, internTo, npcTo, onFrame, PLACES, screenPos, walkNear, type PlaceKey, type Who } from '../scene';
import { COLOR, esc } from '../shared';
import { FACTION_COLOR, SPEAKER_NAME } from '../talk';
import { mountTalk } from './talk';

type Mode = 'wait' | 'bg' | 'queue';

// ---------- where each Task happens ----------
const RULES: [RegExp, PlaceKey, string, string][] = [
  // title pattern, place, "do" clip, "sabotage" clip
  [/printer/i, 'printer', 'interact-left', 'attack-kick-right'],
  [/soap/i, 'sink', 'interact-right', 'interact-left'],
  [/plant/i, 'plant', 'pick-up', 'attack-kick-left'],
  [/shred/i, 'shredder', 'crouch', 'attack-melee-right'],
  [/room 4|warm seat|thank the smart seat/i, 'toilet', 'interact-left', 'attack-kick-right'],
  [/folder|evidence/i, 'shelf', 'pick-up', 'interact-right'],
];
function placeOf(t: Task) {
  const r = RULES.find(([re]) => re.test(t.title));
  return r ? { place: r[1], doClip: r[2], sabClip: r[3] } : { place: 'desk' as PlaceKey, doClip: 'sit', sabClip: 'sit' };
}

const CSS = `
#ac-knobs{position:fixed;top:10px;left:350px;background:#ff2bd6;color:#fff;font:11px system-ui;padding:6px 8px;border-radius:8px;z-index:30;max-width:300px}
#ac-knobs button{font:11px system-ui;margin:2px 2px 0 0;cursor:pointer}
#ac-knobs button.on{background:#fff;color:#ff2bd6;font-weight:700}
#ac-knobs ul{margin:4px 0 0;padding-left:14px}
.ac-tag{position:fixed;transform:translate(-50%,-100%);z-index:8;pointer-events:none;font:700 12px system-ui;background:#fff;color:#222;padding:4px 9px;border-radius:999px;border:2px solid var(--c);box-shadow:0 2px 8px rgba(0,0,0,.35);white-space:nowrap}
.ac-tag .bl{display:inline-flex;gap:2px;margin-left:6px;vertical-align:middle}
.ac-tag .bl i{width:9px;height:9px;border-radius:2px;background:var(--c)}
.ac-tag .bl i.gone{background:#ddd}
.ac-tag.sab{background:#3b1f5c;color:#fff;border-color:#b27cff}
.ac-tag.spark{background:#fffbe0;border-color:#e2b500;animation:fade 1.6s forwards}
.ac-float{position:fixed;transform:translate(-50%,-100%);z-index:9;pointer-events:none;font:700 13px system-ui;padding:2px 8px;border-radius:999px;color:#fff;background:var(--c);animation:acrise 1.8s forwards}
@keyframes acrise{from{margin-top:0;opacity:1}to{margin-top:-46px;opacity:0}}
#ac-q{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);display:flex;gap:6px;align-items:center;background:rgba(20,22,28,.8);padding:5px 8px;border-radius:10px;font:600 11px system-ui;color:#eee;z-index:5;max-width:80vw;flex-wrap:wrap}
#ac-q:empty{display:none}
#ac-q .it{background:#fff;color:#222;border-radius:7px;padding:3px 7px;border-left:4px solid var(--c);display:flex;gap:6px;align-items:center}
#ac-q .it.now{outline:2px solid #ff9f1c}
#ac-q .it .x{cursor:pointer;color:#a33;font-weight:700}
`;
const ICON = { do: '🔧', fake: '🎭', delegate: '🤝', sabotage: '🤫' } as const;
const VERB = { do: 'Doing', fake: 'Faking', delegate: 'Asking', sabotage: 'Sabotaging' } as const;
const YES: Record<string, string> = { ryszard: 'Sure. Sure sure sure.', wiola: 'On it! Love this for you.', kamil: 'Oh, I will handle this.' };

export function mountAct(root: HTMLElement, mode: Mode) {
  mountTalk(root, 'world');
  root.insertAdjacentHTML('beforeend', `<style>${CSS}</style><style id="ac-dyn"></style><div id="ac-layer"></div><div id="ac-q"></div><div id="ac-knobs"></div>`);
  const layer = root.querySelector<HTMLElement>('#ac-layer')!;
  const dyn = root.querySelector<HTMLElement>('#ac-dyn')!;
  const qEl = root.querySelector<HTMLElement>('#ac-q')!;
  let secPerHour = 1;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // ---------- anchored labels ----------
  const anchored: { el: HTMLElement; who: Who; dy: number }[] = [];
  onFrame.push(() => { for (const a of anchored) { const p = screenPos(a.who); if (p) { a.el.style.left = `${p.x}px`; a.el.style.top = `${p.y + a.dy}px`; } } });
  const pin = (el: HTMLElement, who: Who, dy: number) => { anchored.push({ el, who, dy }); layer.append(el); return el; };
  const unpin = (el: HTMLElement) => { const i = anchored.findIndex((a) => a.el === el); if (i >= 0) anchored.splice(i, 1); el.remove(); };
  function tag(who: Who, html: string, cls = '', color = '#ff8a1f', ms = 0) {
    const el = document.createElement('div');
    el.className = `ac-tag ${cls}`; el.style.setProperty('--c', color); el.innerHTML = html;
    pin(el, who, -46);
    if (ms) setTimeout(() => unpin(el), ms);
    return el;
  }
  function say(who: Who, text: string, ms = 1800) {
    const el = document.createElement('div');
    el.className = 'tk-say brush'; el.style.setProperty('--c', FACTION_COLOR[who]);
    el.innerHTML = `<b>${esc(SPEAKER_NAME[who])}</b>${esc(text)}`;
    pin(el, who, -8); setTimeout(() => unpin(el), ms);
  }
  /** Floats over the Intern, one per visible Pressure change. */
  function floats(c: ChoiceView) {
    visibleDeltas(c.deltas).forEach(([k, v], i) => setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'ac-float'; el.style.setProperty('--c', COLOR[k]);
      el.textContent = `${v > 0 ? '+' : '−'}${Math.abs(v)} ${PRESSURE_LABEL[k]}`;
      pin(el, 'intern', -70); setTimeout(() => unpin(el), 1900);
    }, i * 250));
  }
  const blocks = (n: number, gone: number) => `<span class="bl">${Array.from({ length: n }, (_, i) => `<i class="${i < gone ? 'gone' : ''}"></i>`).join('')}</span>`;

  // ---------- busy Tasks: dim their bubble, block a second pick ----------
  const busy = new Map<number, string>();
  let lockCss = '';
  function renderDyn() {
    dyn.textContent = lockCss + [...busy].map(([id, label]) => `
      .bub[data-id="${id}"],[data-pick="${id}"]{opacity:.45;pointer-events:none}
      .bub[data-id="${id}"]:before,[data-pick="${id}"]:before{content:'${label} ';font-weight:700}`).join('');
  }
  const closePop = () => dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  function lock(on: boolean, bubblesToo: boolean) {
    hooks.locked = on;
    lockCss = on ? `#vc-h{pointer-events:none}${bubblesToo ? '#vc-b{pointer-events:none;opacity:.35}#vc-popwrap{display:none}' : ''}` : '';
    renderDyn();
  }

  // ---------- one action, played on screen ----------
  // `tick` runs once per in-game hour of the action; `token` lets K drop the flavour mid-way.
  let token = 0;
  let dropFlavour: (() => void) | null = null;
  const bump = () => { token++; dropFlavour?.(); dropFlavour = null; };
  async function perform(t: Task, c: ChoiceView, tick: (i: number) => void, myToken: number) {
    const { place, doClip, sabClip } = placeOf(t);
    const live = () => myToken === token;
    const kind = c.key;
    const color = kind === 'sabotage' ? '#b27cff' : '#ff8a1f';
    const head = (gone: number) => `${ICON[kind]} ${VERB[kind]}${kind === 'delegate' ? ` ${NAME[c.delegateTo!]}` : ''}: ${esc(t.title.slice(0, 34))}${t.title.length > 34 ? '…' : ''}${blocks(c.hours, gone)}`;
    let el: HTMLElement | null = null;
    const show = (gone: number) => { if (el) unpin(el); el = tag('intern', head(gone), kind === 'sabotage' ? 'sab' : '', color); };
    dropFlavour = () => { if (el) unpin(el); el = null; };
    try {
      if (kind === 'delegate') {
        const who = c.delegateTo! as Who;
        show(0);
        if (mode !== 'bg') { await walkNear(who); if (!live()) return; }
        const back = mode !== 'bg' ? faceIntern(who) : null;
        clip(who, 'emote-yes'); say(who, YES[who]);
        for (let i = 0; i < c.hours; i++) { await sleep(secPerHour * 1000); if (!live()) return; tick(i); show(i + 1); }
        back?.();
        void colleagueWorks(who, t);
        return;
      }
      const fakeFromDesk = kind === 'fake' && mode === 'bg';
      show(0);
      await internTo(fakeFromDesk ? 'desk' : place);
      if (!live()) return;
      const name = kind === 'sabotage' ? sabClip : fakeFromDesk || (kind === 'fake' && place === 'desk') ? 'sit' : doClip;
      clip('intern', name);
      for (let i = 0; i < c.hours; i++) { await sleep(secPerHour * 1000); if (!live()) return; tick(i); show(i + 1); }
      if (kind === 'fake') tag('intern', '✨ looks done', 'spark', '#e2b500', 1600);
      if (kind === 'sabotage') tag('intern', '🤫 nobody saw', 'sab spark', '#b27cff', 1600);
      if (place !== 'desk' && !fakeFromDesk) clip('intern', 'idle');
    } finally { if (el) unpin(el); }
  }
  /** After a hand-off: the Colleague's walk runs on its own and costs the Intern nothing. */
  async function colleagueWorks(who: Who, t: Task) {
    const { place, doClip } = placeOf(t);
    if (who === 'ryszard') { await sleep(600); const s = tag(who, '✨ looks done', 'spark', '#e2b500', 1600); void s; return; }
    const target: PlaceKey | Who = who === 'kamil' && t.side === 'launch' ? 'halina' : place === 'desk' ? who : place;
    const work = tag(who, `${target === 'halina' ? '📣 Taking it to Pani Halina' : `🔧 ${esc(t.title.slice(0, 28))}…`}`, '', FACTION_COLOR[who]);
    if (target !== who) await npcTo(who, target);
    clip(who, target === 'halina' ? 'interact-right' : doClip === 'sit' ? 'interact-left' : doClip);
    await sleep(secPerHour * 3000);
    unpin(work);
    await npcTo(who, 'home');
  }

  // ---------- J: go there and wait it out ----------
  async function runWait(t: Task, c: ChoiceView) {
    busy.set(t.id, '⏳'); closePop(); lock(true, true);
    await perform(t, c, () => spendHours(1), token);
    busy.delete(t.id);
    floats(c);
    applyChoice(t, c, { spend: false, endCheck: true });
    lock(false, false);
  }

  // ---------- K: instant, flavour in the background ----------
  function runBg(t: Task, c: ChoiceView) {
    bump(); const my = token;
    floats(c);
    applyChoice(t, c, { spend: true, endCheck: true });
    void perform({ ...t }, c, () => {}, my);
  }
  hooks.onPlayerWalk = () => { if (mode === 'bg') bump(); };

  // ---------- L: a work queue ----------
  const queue: { t: Task; c: ChoiceView }[] = [];
  let running: { t: Task; c: ChoiceView } | null = null;
  function renderQueue() {
    const it = (q: { t: Task; c: ChoiceView }, now: boolean, i: number) => `<span class="it ${now ? 'now' : ''}" style="--c:${q.c.key === 'sabotage' ? '#b27cff' : '#ff8a1f'}">${ICON[q.c.key]} ${esc(q.t.title.slice(0, 26))}… · ${q.c.hours}h${now ? '' : ` <span class="x" data-i="${i}">×</span>`}</span>`;
    qEl.innerHTML = mode !== 'queue' || (!running && !queue.length) ? '' : `${running ? `Now ${it(running, true, -1)}` : ''}${queue.length ? ` Next ${queue.map((q, i) => it(q, false, i)).join('')}` : ''}`;
    qEl.querySelectorAll<HTMLElement>('.x').forEach((x) => (x.onclick = () => {
      const [q] = queue.splice(Number(x.dataset.i), 1);
      busy.delete(q.t.id); renderDyn(); spendHours(-q.c.hours); renderQueue();
    }));
  }
  async function pump() {
    if (running) return;
    lock(true, false);
    while (queue.length && !state.firedBy) {
      running = queue.shift()!; busy.set(running.t.id, '⏳'); renderDyn(); renderQueue();
      await perform(running.t, running.c, () => {}, token);
      busy.delete(running.t.id); renderDyn();
      floats(running.c);
      applyChoice(running.t, running.c, { spend: false, endCheck: false });
      running = null; renderQueue();
    }
    lock(false, false);
    if (state.hours <= 0) endDay();
  }
  function runQueue(t: Task, c: ChoiceView) {
    spendHours(c.hours);
    busy.set(t.id, '🕒 queued'); renderDyn(); closePop();
    queue.push({ t, c }); renderQueue();
    void pump();
  }

  choiceHook.run = (t, c) => {
    if (busy.has(t.id)) return;
    if (mode === 'wait') void runWait(t, c);
    else if (mode === 'bg') runBg(t, c);
    else runQueue(t, c);
  };
  on((e) => { if (e.type === 'dayStarted') { busy.clear(); queue.length = 0; renderDyn(); renderQueue(); renderKnobs(); } if (e.type === 'taskAssigned') renderKnobs(); });

  // ---------- prototype knobs ----------
  const knobsEl = root.querySelector<HTMLElement>('#ac-knobs')!;
  let showPlaces = false;
  function renderKnobs() {
    const b = (k: string, label: string, on: boolean) => `<button data-k="${k}" class="${on ? 'on' : ''}">${label}</button>`;
    knobsEl.innerHTML = `<b>PROTOTYPE Task actions</b> · pick a Task choice<br>
      seconds per hour ${[0.5, 1, 2].map((n) => b(`s:${n}`, `${n}s`, secPerHour === n)).join('')}
      ${b('p', `${showPlaces ? 'hide' : 'show'} places`, showPlaces)}
      ${showPlaces ? `<ul>${state.inbox.map((t) => `<li>${esc(t.title)} → ${PLACES[placeOf(t).place].label}</li>`).join('')}</ul>` : ''}`;
    knobsEl.querySelectorAll<HTMLButtonElement>('button').forEach((el) => (el.onclick = () => {
      const [k, v] = el.dataset.k!.split(':');
      if (k === 's') secPerHour = Number(v);
      if (k === 'p') showPlaces = !showPlaces;
      renderKnobs();
    }));
  }
  renderKnobs();
  on((e) => { if (e.type === 'taskResolved' && showPlaces) renderKnobs(); });
}

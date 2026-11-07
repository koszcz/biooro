// PROTOTYPE, throwaway. Answers the "Pressures and Task inbox UI" ticket.
// Three overlays on the chosen office scene, switchable via ?variant=A|B|C:
//   A Top bar + inbox drawer: labelled bars up top, a Task list on the right, choices expand inline.
//   B Clipboard + wall clock + memo: pips on a clipboard, hours as time of day, a memo modal per Task.
//   C In the world: Task bubbles over whoever assigned them, a popover per Task, slim gauges.
//   D/E/F: variant C with three answers to the 'Crowded Task bubbles' ticket (see variants/crowd.ts).
// The pink controls (top left) are prototype-only: jump days, stress the inbox, show state.
import './scene';
import { BASE_CSS } from './shared';
import { crowdOne, DAY_NAMES, endDay, log, on, reset, startDay, state, stressInbox } from './game';
import { mountA } from './variants/a';
import { mountB } from './variants/b';
import { mountC } from './variants/c';
import { mountCrowd } from './variants/crowd';

const VARIANTS = [
  { key: 'A', name: 'Top bar + inbox drawer', mount: mountA },
  { key: 'B', name: 'Clipboard + wall clock + memo', mount: mountB },
  { key: 'C', name: 'In the world: tall column (baseline)', mount: mountC },
  { key: 'D', name: 'Crowd: pile, hover to fan out', mount: (r: HTMLElement) => mountCrowd(r, 'pile') },
  { key: 'E', name: 'Crowd: two bubbles + "more" pill', mount: (r: HTMLElement) => mountCrowd(r, 'cap') },
  { key: 'F', name: 'Crowd: one bubble per person + inbox popover', mount: (r: HTMLElement) => mountCrowd(r, 'summary') },
];
const params = new URLSearchParams(location.search);
let i = Math.max(0, VARIANTS.findIndex((v) => v.key === (params.get('variant') ?? 'A')));

document.head.insertAdjacentHTML('beforeend', `<style>${BASE_CSS}</style>`);
const ui = document.getElementById('ui')!;
VARIANTS[i].mount(ui);

function go(n: number) {
  i = (n + VARIANTS.length) % VARIANTS.length;
  params.set('variant', VARIANTS[i].key);
  location.search = params.toString(); // reload: variants keep their own listeners
}
document.getElementById('ui-prev')!.onclick = () => go(i - 1);
document.getElementById('ui-next')!.onclick = () => go(i + 1);
document.getElementById('ui-label')!.textContent = `${VARIANTS[i].key} (${VARIANTS[i].name})`;
addEventListener('keydown', (e) => {
  if ((e.target as HTMLElement).matches('input,textarea,[contenteditable]')) return;
  if (e.key === 'ArrowRight') go(i + 1);
  if (e.key === 'ArrowLeft') go(i - 1);
});

// ---------- prototype controls + state dump ----------
const ctl = document.getElementById('ctl')!;
let showState = false;
let toast = '';
function renderCtl() {
  const s = { ...state, helpedToday: [...state.helpedToday], inbox: state.inbox.map((t) => `${t.id} ${t.assigner}/${t.side ?? '-'}${t.fallout ? ' FALLOUT' : ''}`) };
  ctl.innerHTML = `<b>PROTOTYPE controls</b> · ${DAY_NAMES[state.day]} (Day ${state.day})
    <div><button id="c-next" ${state.day >= 5 ? 'disabled' : ''}>End day → next morning</button><button id="c-stress">Flood inbox</button><button id="c-crowd">Crowd Zbigniew (6)</button><button id="c-reset">Reset</button><button id="c-state">${showState ? 'Hide' : 'Show'} state</button></div>
    ${state.firedBy ? `<div class="fired">FIRED: ${state.firedBy} hit 0</div>` : ''}${toast ? `<div class="toast">${toast}</div>` : ''}
    ${showState ? `<pre>${JSON.stringify(s, null, 1)}\n\nlast events:\n${log.map((e) => JSON.stringify(e).slice(0, 90)).join('\n')}</pre>` : ''}`;
  ctl.querySelector<HTMLButtonElement>('#c-next')!.onclick = () => { endDay(); startDay(state.day + 1); };
  ctl.querySelector<HTMLButtonElement>('#c-stress')!.onclick = () => stressInbox();
  ctl.querySelector<HTMLButtonElement>('#c-crowd')!.onclick = () => crowdOne();
  ctl.querySelector<HTMLButtonElement>('#c-reset')!.onclick = () => reset();
  ctl.querySelector<HTMLButtonElement>('#c-state')!.onclick = () => { showState = !showState; renderCtl(); };
}
on((e) => {
  if (e.type === 'goodwillRevealed') toast = 'Day 2: you notice the Factions. Both goodwill Pressures appear.';
  if (e.type === 'dayEnded') toast = `${DAY_NAMES[e.day]} is over.`;
  if (e.type === 'dayStarted' && e.day === 1) toast = '';
  renderCtl();
});
reset();

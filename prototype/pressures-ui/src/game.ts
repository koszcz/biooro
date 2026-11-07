// PROTOTYPE, throwaway. A rough, in-memory copy of the rules from the
// "Pressures and Task choices" and "The week" tickets, just enough to drive the UI variants.
// It emits typed events the way the locked tech plan describes.

import type { Who } from './scene';

export type PressureKey = 'performance' | 'launch' | 'paper' | 'sanity';
export type Side = 'launch' | 'paper' | null;
export type ChoiceKey = 'do' | 'fake' | 'delegate' | 'sabotage';
export type DelegateTo = 'ryszard' | 'wiola' | 'kamil';

export const PRESSURE_LABEL: Record<PressureKey, string> = {
  performance: 'Performance',
  launch: 'Launch Team goodwill',
  paper: 'Paper Trail goodwill',
  sanity: 'Sanity',
};
export const SIDE_LABEL = { launch: 'Launch Team', paper: 'Paper Trail' } as const;
export const NAME: Record<Who, string> = {
  intern: 'Anyone', zbigniew: 'Pan Zbigniew', ryszard: 'Ryszard', halina: 'Pani Halina', wiola: 'Wiola', kamil: 'Kamil',
};
export const CHOICE_LABEL: Record<ChoiceKey, string> = { do: 'Do it', fake: 'Fake it', delegate: 'Delegate it', sabotage: 'Sabotage it' };
const FACTION_OF: Record<DelegateTo, 'launch' | 'paper'> = { ryszard: 'launch', wiola: 'launch', kamil: 'paper' };

export type Task = { id: number; title: string; assigner: Who; side: Side; fallout: boolean; hours?: number };

export type Deltas = Partial<Record<PressureKey, number>>;
export type ChoiceView = {
  key: ChoiceKey;
  label: string;
  hours: number;
  deltas: Deltas;
  locked: string | null; // reason, or null when available
  note?: string;
  delegateTo?: DelegateTo;
};

export type GameEvent =
  | { type: 'pressureChanged'; key: PressureKey; from: number; to: number }
  | { type: 'hoursChanged'; from: number; to: number }
  | { type: 'taskAssigned'; task: Task }
  | { type: 'taskResolved'; task: Task; choice: ChoiceKey }
  | { type: 'goodwillRevealed' }
  | { type: 'dayStarted'; day: number }
  | { type: 'dayEnded'; day: number }
  | { type: 'fired'; key: PressureKey };

type Listener = (e: GameEvent) => void;
const listeners: Listener[] = [];
export const on = (l: Listener) => listeners.push(l);
const emit = (e: GameEvent) => { log.unshift(e); log.length = Math.min(log.length, 12); listeners.forEach((l) => l(e)); };
export const log: GameEvent[] = [];

export const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS: [Who, Side, string][][] = [
  [],
  [['zbigniew', 'launch', 'Summarise the week of complaints in one upbeat line'], ['intern', null, 'Unjam the printer (again)']],
  [['halina', 'paper', 'Log every Smart seat complaint in triplicate'], ['zbigniew', 'launch', 'Reword "it listened to me" as "user delight"'], ['intern', null, 'Refill the hand soap nobody admits to using']],
  [['kamil', 'paper', 'Forward the seat that emailed a customer'], ['wiola', 'launch', 'Make a slide: "Data is a hug"'], ['ryszard', 'launch', 'Close 40 tickets as "resolved by itself"']],
  [['halina', 'paper', 'Find out who shredded the shredder log'], ['zbigniew', 'launch', 'Thank the Smart seat for its feedback'], ['kamil', 'paper', 'Photograph the warm seat in Room 4'], ['intern', null, 'Water the plant that is now a sensor']],
  [['zbigniew', 'launch', 'Prepare a calm face for Head office'], ['halina', 'paper', 'Bind the evidence folder'], ['wiola', 'launch', 'Rehearse the word "anomaly"'], ['ryszard', 'launch', 'Delete the folder Pani Halina bound']],
];

export const state = {
  day: 1,
  hours: 8,
  p: { performance: 6, launch: 6, paper: 6, sanity: 6 } as Record<PressureKey, number>,
  goodwillVisible: false,
  inbox: [] as Task[],
  pendingFallout: [] as { due: number; task: Task }[],
  helpedToday: new Set<'launch' | 'paper'>(),
  finishedToday: 0,
  firedBy: null as PressureKey | null,
  dayOver: false,
};
let nextId = 1;

function setP(key: PressureKey, to: number) {
  const from = state.p[key];
  to = Math.max(0, Math.min(10, to));
  if (to === from) return;
  state.p[key] = to;
  emit({ type: 'pressureChanged', key, from, to });
  if (to === 0 && !state.firedBy) { state.firedBy = key; emit({ type: 'fired', key }); }
}
function setHours(to: number) { const from = state.hours; state.hours = to; emit({ type: 'hoursChanged', from, to }); }
function assign(t: Omit<Task, 'id'>) { const task = { ...t, id: nextId++ }; state.inbox.push(task); emit({ type: 'taskAssigned', task }); }

export function rival(side: 'launch' | 'paper') { return side === 'launch' ? 'paper' : 'launch'; }

/** Every Task choice for a Task, always all four, with a lock reason where needed. */
export function choicesFor(t: Task): ChoiceView[] {
  const perfGain = t.side === 'paper' ? 0 : 1;
  const out: ChoiceView[] = [];
  const doHours = t.fallout ? 4 : 3;
  const add = (c: ChoiceView) => {
    if (!c.locked && c.hours > state.hours) c.locked = `Needs ${c.hours}h, you have ${state.hours}h left`;
    out.push(c);
  };
  const doD: Deltas = { performance: perfGain, sanity: -1 };
  if (t.side) doD[t.side] = 1;
  add({ key: 'do', label: 'Do it', hours: doHours, deltas: doD, locked: null });
  add({ key: 'fake', label: 'Fake it', hours: 1, deltas: { performance: perfGain }, locked: t.fallout ? 'Fallout cannot be faked again' : null, note: 'Comes back as Fallout in 2 days' });
  // delegate: one entry per Colleague
  for (const who of ['ryszard', 'wiola', 'kamil'] as DelegateTo[]) {
    const f = FACTION_OF[who];
    const d: Deltas = { performance: perfGain, [f]: -1 };
    let note = '';
    if (who === 'ryszard') note = 'He fakes it. Fallout in 2 days.';
    if (who === 'wiola') { note = 'She does it properly.'; if (t.side) d[t.side] = (d[t.side] ?? 0) + 1; }
    if (who === 'kamil') { note = t.side === 'launch' ? 'He escalates it to the Paper Trail.' : 'He does it, loudly.'; if (t.side === 'launch') { d.performance = 0; d.launch = -1; } }
    let locked: string | null = null;
    if (state.p[f] < 5) locked = state.goodwillVisible ? `${NAME[who]} won't: ${SIDE_LABEL[f]} goodwill is ${state.p[f]}, needs 5` : `${NAME[who]} doesn't trust you yet`;
    add({ key: 'delegate', label: `Delegate to ${NAME[who]}`, hours: 1, deltas: d, locked, note, delegateTo: who });
  }
  const sab: Deltas = { performance: -1, sanity: 1 };
  if (t.side) { sab[t.side] = -2; sab[rival(t.side)] = 1; }
  add({ key: 'sabotage', label: 'Sabotage it', hours: 2, deltas: sab, locked: null, note: 'The Task stays in your inbox' });
  return out;
}

export function choose(t: Task, c: ChoiceView) {
  if (c.locked || state.firedBy || state.dayOver) return;
  setHours(state.hours - c.hours);
  for (const [k, v] of Object.entries(c.deltas) as [PressureKey, number][]) if (v) setP(k, state.p[k] + v);
  if (state.firedBy) return;
  if (c.key === 'sabotage') { if (t.side) state.helpedToday.add(rival(t.side)); }
  else {
    state.inbox = state.inbox.filter((x) => x.id !== t.id);
    state.finishedToday++;
    const helped = c.delegateTo === 'kamil' && t.side === 'launch' ? 'paper' : t.side;
    if (helped && c.key !== 'fake') state.helpedToday.add(helped);
    if (c.key === 'fake' || c.delegateTo === 'ryszard') state.pendingFallout.push({ due: state.day + 2, task: { ...t, fallout: true, title: `Fallout: ${t.title}` } });
  }
  emit({ type: 'taskResolved', task: t, choice: c.key });
  if (state.hours <= 0) endDay();
}

export function takeBreak() {
  if (state.hours < 1 || state.firedBy || state.dayOver) return;
  setHours(state.hours - 1);
  setP('sanity', state.p.sanity + 2);
  if (state.hours <= 0) endDay();
}

export function endDay() {
  if (state.dayOver) return;
  state.dayOver = true;
  emit({ type: 'dayEnded', day: state.day });
  if (state.day >= 2) for (const f of ['launch', 'paper'] as const) if (!state.helpedToday.has(f)) setP(f, state.p[f] - 1);
  for (const t of state.inbox) setP('performance', state.p.performance - 1);
}

export function startDay(day: number) {
  if (state.firedBy) return;
  const finished = state.finishedToday;
  state.day = day;
  state.dayOver = false;
  state.helpedToday.clear();
  state.finishedToday = 0;
  setHours(8);
  if (day >= 2) setP('sanity', state.p.sanity - 1);
  if (day >= 2 && !state.goodwillVisible) { state.goodwillVisible = true; emit({ type: 'goodwillRevealed' }); }
  emit({ type: 'dayStarted', day });
  const count = day === 1 ? 2 : 2 + Math.floor(finished / 2);
  for (const [assigner, side, title] of SLOTS[day].slice(0, count)) assign({ assigner, side, title, fallout: false });
  for (const f of state.pendingFallout.filter((x) => x.due === day)) assign({ ...f.task });
  state.pendingFallout = state.pendingFallout.filter((x) => x.due !== day);
}

export function reset() {
  Object.assign(state, { day: 1, hours: 8, goodwillVisible: false, inbox: [], pendingFallout: [], finishedToday: 0, firedBy: null, dayOver: false });
  state.p = { performance: 6, launch: 6, paper: 6, sanity: 6 };
  state.helpedToday = new Set();
  log.length = 0;
  emit({ type: 'dayStarted', day: 1 });
  for (const [assigner, side, title] of SLOTS[1]) assign({ assigner, side, title, fallout: false });
}

/** Debug: skip straight to a day with a pile of Tasks, to judge crowding. */
export function stressInbox() {
  for (let d = 2; d <= 5; d++) for (const [assigner, side, title] of SLOTS[d].slice(0, 2)) assign({ assigner, side, title, fallout: false });
}

/** Pressures the player can see right now. */
export function visiblePressures(): PressureKey[] {
  return state.goodwillVisible ? ['performance', 'launch', 'paper', 'sanity'] : ['performance', 'sanity'];
}
/** Hide deltas for Pressures the player cannot see yet. */
export function visibleDeltas(d: Deltas): [PressureKey, number][] {
  const vis = visiblePressures();
  return (Object.entries(d) as [PressureKey, number][]).filter(([k, v]) => v && vis.includes(k));
}

/** Debug: give Pan Zbigniew six open Tasks, two of them Fallout, like a bad Thursday. */
export function crowdOne() {
  const lines = ['Thank the Smart seat for its feedback', 'Prepare a calm face for Head office', 'Reword "it listened to me" as "user delight"', 'Summarise the week of complaints in one upbeat line'];
  for (const title of lines) assign({ assigner: 'zbigniew', side: 'launch', title, fallout: false });
  assign({ assigner: 'zbigniew', side: 'launch', title: 'Fallout: Close 40 tickets as "resolved by itself"', fallout: true });
  assign({ assigner: 'zbigniew', side: 'launch', title: 'Fallout: Make a slide: "Data is a hug"', fallout: true });
}

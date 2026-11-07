// PROTOTYPE, throwaway. Answers the "Conversation interface" ticket.
// Shared by variants G, H and I: stand-in Ink content, the conversation runner, the text reveal,
// and the per-character blips. No inkjs here: a Conversation is a few lines, one choice, a reply.
// Rules from "How often the Intern can talk": one Conversation per Colleague per day, none for Bosses,
// at most one non-Performance Pressure changes by 1 (never below 1), then a tier-varied brush-off.
import { nudge, state, talkedToday, type PressureKey } from './game';
import type { Who } from './scene';

export type Speaker = Who | 'headoffice';
export type Line = { who: Speaker; text: string };
export type Option = { text: string; effect?: [PressureKey, number]; reply: Line[] };
export type Convo = { lines: Line[]; options?: Option[]; scripted?: string };

export const BOSSES: Who[] = ['zbigniew'];
export const COLLEAGUES: Who[] = ['ryszard', 'wiola', 'halina', 'kamil'];
export const SPEAKER_NAME: Record<Speaker, string> = {
  intern: 'You', zbigniew: 'Pan Zbigniew', ryszard: 'Ryszard', wiola: 'Wiola', halina: 'Pani Halina', kamil: 'Kamil', headoffice: 'Head office',
};
export const FACTION_COLOR: Record<Speaker, string> = {
  intern: '#ff8a1f', zbigniew: '#2a9d8f', ryszard: '#2a9d8f', wiola: '#2a9d8f', halina: '#c9a35b', kamil: '#c9a35b', headoffice: '#555',
};

const CONVOS: Partial<Record<Who, Convo>> = {
  ryszard: {
    lines: [{ who: 'ryszard', text: 'You look like someone who closes tickets.' }, { who: 'ryszard', text: "Trick is, a complaint is just a compliment that hasn't calmed down yet." }],
    options: [
      { text: 'Teach me.', effect: ['launch', 1], reply: [{ who: 'ryszard', text: "Mark it 'resolved by itself'. It usually is." }] },
      { text: 'That sounds like lying.', effect: ['sanity', 1], reply: [{ who: 'ryszard', text: "Lying is a strong word. I prefer 'closing'." }] },
      { text: 'Say nothing.', reply: [{ who: 'ryszard', text: 'Good. You are learning already.' }] },
    ],
  },
  wiola: {
    lines: [{ who: 'wiola', text: 'Do you ever feel like the seats are... listening?' }, { who: 'wiola', text: 'In a supportive way, I mean.' }],
    options: [
      { text: 'Very supportive.', effect: ['launch', 1], reply: [{ who: 'wiola', text: 'Exactly! Data is a hug.' }] },
      { text: 'Listening how?', effect: ['sanity', -1], reply: [{ who: 'wiola', text: 'Forget I said anything. Please.' }] },
    ],
  },
  halina: {
    lines: [{ who: 'halina', text: 'Sit. Not there. That chair reports to Marketing.' }, { who: 'halina', text: 'Have you kept copies of what you closed today?' }],
    options: [
      { text: 'Yes. In triplicate.', effect: ['paper', 1], reply: [{ who: 'halina', text: 'Good. Copies outlive people.' }] },
      { text: 'Copies of what?', effect: ['sanity', 1], reply: [{ who: 'halina', text: 'Then you sleep well. Enjoy it while it lasts.' }] },
    ],
  },
  kamil: {
    lines: [{ who: 'kamil', text: 'Psst. Room 4. The seat is warm.' }, { who: 'kamil', text: 'Nobody has sat on it since March.' }],
    options: [
      { text: "I'll take a photo.", effect: ['paper', 1], reply: [{ who: 'kamil', text: 'Use the flash. It hates the flash.' }] },
      { text: "I didn't hear that.", effect: ['sanity', 1], reply: [{ who: 'kamil', text: 'Lucky you.' }] },
    ],
  },
};

const BRUSH: Record<Who, [string, string, string]> = {
  intern: ['', '', ''],
  zbigniew: ["Not now. I'm being strategic.", 'My door is always open. This is not my door.', 'Walk with purpose. Away from me.'],
  ryszard: ['Later, kid. Tickets.', "We talked. That's my quota.", "Don't look at the seats when you say my name."],
  wiola: ['Busy making a slide!', 'Not today. Today is an anomaly.', 'Please stop asking me things.'],
  halina: ['I have said what I will say today.', 'Write it down. Then go away.', 'Not here. The walls are on the Smart range.'],
  kamil: ['Shh. Tomorrow.', "Can't. Someone's watching the printer.", 'If I vanish, check Room 4.'],
};

export const SCENES: Record<string, Convo> = {
  onboarding: {
    scripted: 'Monday 9:00 · Onboarding',
    lines: [
      { who: 'zbigniew', text: 'Welcome to Biooro. We make toilets. And, increasingly, memories.' },
      { who: 'zbigniew', text: 'Ryszard will show you the complaints queue. Complaints are opportunities wearing a frown.' },
      { who: 'ryszard', text: "Hi. Don't touch the Smart range tickets. Touch everything else." },
    ],
    options: [
      { text: 'Happy to be here!', reply: [{ who: 'zbigniew', text: 'Wonderful. Keep that face. Head office loves that face.' }] },
      { text: 'Memories?', reply: [{ who: 'zbigniew', text: 'Customer memories. Of good service. Next question.' }] },
    ],
  },
  audit: {
    scripted: 'Friday 16:00 · Head office audit',
    lines: [
      { who: 'headoffice', text: 'Head office has reviewed the complaints queue for this week.' },
      { who: 'zbigniew', text: 'As you can see, the customers are delighted. Some are delighted in triplicate.' },
      { who: 'halina', text: 'Some are bound in a folder. Page one.' },
    ],
  },
  firing: {
    scripted: 'Fired · Performance hit 0',
    lines: [
      { who: 'zbigniew', text: "We're letting you go. Not fired. Released, like a product." },
      { who: 'zbigniew', text: 'Please leave your lanyard with the seat in Room 4. It will know.' },
    ],
  },
  survival: {
    scripted: 'Friday 17:00 · You survived the week',
    lines: [
      { who: 'zbigniew', text: "You're still here. Nobody expected that. Least of all the seats." },
      { who: 'zbigniew', text: 'See you Monday. We will.' },
    ],
  },
};

// ---------- prototype knobs ----------
export const knobs = { cps: 45, tier: 1 as 1 | 2 | 3, blips: true, showEffects: false };

// ---------- availability ----------
export type Availability = 'convo' | 'used' | 'boss';
export function availability(who: Who): Availability {
  if (BOSSES.includes(who)) return 'boss';
  return talkedToday.has(who) ? 'used' : 'convo';
}
export function brushOff(who: Who): Line { return { who, text: BRUSH[who][knobs.tier - 1] }; }
export function convoFor(who: Who): Convo | null { return availability(who) === 'convo' ? CONVOS[who] ?? null : null; }

// ---------- runner ----------
/** What a variant must provide. Each call resolves when the player has read the line or picked. */
export type TalkUI = {
  begin(c: Convo, partner: Who | null): Promise<void> | void;
  line(l: Line): Promise<void>;
  choose(options: Option[]): Promise<number>;
  effect(key: PressureKey, d: number): void;
  end(): void;
};
export let talking = false;
export async function run(c: Convo, partner: Who | null, ui: TalkUI) {
  talking = true;
  await ui.begin(c, partner);
  for (const l of c.lines) await ui.line(l);
  if (c.options?.length) {
    const o = c.options[await ui.choose(c.options)];
    await ui.line({ who: 'intern', text: o.text });
    if (o.effect) { const before = state.p[o.effect[0]]; nudge(...o.effect); if (state.p[o.effect[0]] !== before) ui.effect(...o.effect); }
    for (const l of o.reply) await ui.line(l);
  }
  if (partner && !c.scripted) talkedToday.add(partner);
  talking = false;
  ui.end();
}

// ---------- reveal + blips ----------
const PITCH: Record<Speaker, number> = { intern: 520, zbigniew: 140, ryszard: 230, wiola: 660, halina: 330, kamil: 440, headoffice: 110 };
let ac: AudioContext | null = null;
function blip(who: Speaker) {
  if (!knobs.blips) return;
  ac ??= new AudioContext();
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'square'; o.frequency.value = PITCH[who] * (0.9 + Math.random() * 0.2);
  g.gain.setValueAtTime(0.04, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.05);
  o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.06);
}
/** Reveal `text` into `el`. One blip per two revealed characters. `skip()` completes the line. */
export function reveal(el: HTMLElement, l: Line, onDone: () => void) {
  let n = 0, done = false;
  const t = setInterval(() => {
    n++; el.textContent = l.text.slice(0, n);
    if (n % 2 === 1 && l.text[n - 1] !== ' ') blip(l.who);
    if (n >= l.text.length) finish();
  }, 1000 / knobs.cps);
  function finish() { if (done) return; done = true; clearInterval(t); el.textContent = l.text; onDone(); }
  return { skip: finish, get done() { return done; } };
}
/** Show a line, wait for click / Space / Enter: the first press completes the line, the next one advances. */
export function readLine(el: HTMLElement, l: Line, clickTarget: HTMLElement | Window = window): Promise<void> {
  return new Promise((res) => {
    const r = reveal(el, l, () => el.classList.add('done'));
    el.classList.remove('done');
    const press = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== ' ' && e.key !== 'Enter') return;
      if (e instanceof KeyboardEvent && (e.target as HTMLElement).matches('input,textarea,[contenteditable]')) return;
      if ((e.target as HTMLElement).closest?.('#ctl,#ui-switcher,#tk-knobs')) return; // prototype controls stay usable
      e.preventDefault(); e.stopPropagation();
      if (!r.done) { r.skip(); return; }
      clickTarget.removeEventListener('pointerdown', press, true); removeEventListener('keydown', press, true);
      res();
    };
    // defer so the click that opened the line doesn't skip it
    setTimeout(() => { clickTarget.addEventListener('pointerdown', press, true); addEventListener('keydown', press, true); });
  });
}

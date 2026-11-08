# Voice guide

This guide tells you how every line in the game should sound. Read it before you write or review any line of Ink or Task wording.

- Human writers: use it to keep each character consistent.
- Agents: check every draft against it and fix any mismatch before you open a pull request.

A **voice anchor** is a short sample scene, written by the game's author, that sets how one character sounds. Each character sheet below links to that character's anchor.

**Status:** draft. The author still has to correct the character sheets and write the five voice anchors. Until a character's anchor exists, agents must not draft lines for that character. Task wording can start now, because it follows only the tone rules.

The rules come from the [intern game spec](../../.scratch/intern-game/spec.md), sections 2, 3, 4 and 11. When this guide and the spec differ, the spec wins. Lines marked _(draft)_ are suggestions that the spec does not state. The author should keep, change or remove each one.

## Contents

- [Tone rules](#tone-rules)
- [How the tone changes by tier](#how-the-tone-changes-by-tier)
- [The Factions](#the-factions)
- [Conversation rules](#conversation-rules)
- [Translation-safe rules](#translation-safe-rules)
- Character sheets:
  - [Pan Zbigniew Pogodny](#pan-zbigniew-pogodny)
  - [Pani Halina Teczka](#pani-halina-teczka)
  - [Ryszard Szablon](#ryszard-szablon)
  - [Wiola Ufna](#wiola-ufna)
  - [Kamil Przeciek](#kamil-przeciek)
- [The Intern and Head office](#the-intern-and-head-office)
- [How to check and submit a draft](#how-to-check-and-submit-a-draft)

## Tone rules

1. **Mundane surface, sinister leak.** Every line first reads as ordinary office talk. The "leak" is the strange part underneath: a detail, a word choice or a pause that hints something is wrong. _(draft)_ Never make the line itself openly scary.
2. **Let the leak grow with Escalation.** Monday feels dull. By Friday the Smart range seems to know things it should not. Use the tier to decide how much leaks (see the next section).
3. **Keep the office believable.** Characters talk about printers, templates, case numbers, lunch and deadlines. The joke comes from how seriously they treat small things.
4. **Nobody is noble.** Both Factions cover themselves. Neither side is the good side.
5. **Head office never appears.** The Bosses fear it. People mention it as something distant. It speaks only in its own bubble at the top of the screen.
6. **Keep the Smart range secret.** The Smart range secretly collects users' data for Head office. Only writers know this. Every hint must fit this secret, but no line may state it or explain it. Never put the secret in game text or in `CONTEXT.md`.
7. **Use the mission statement as written.** It is "Biooro. Listening to your body, one flush at a time." Never change its words. Early in the week it sounds like wellness fluff. Later, the same words sound like a threat.
8. **Write short lines.** Text reveals at 45 characters a second, so long lines feel slow. _(draft)_ Aim for one or two short sentences per speech bubble.
9. **Keep Polish names as they are.** Never translate or explain them. The Intern says "Pan Zbigniew" and "Pani Halina", and uses first names for Colleagues.

## How the tone changes by tier

The tier comes from hidden Escalation. In Ink, a line can branch on `tier()`, which returns the current tier. Put each variant beside the line it replaces.

| Tier | Escalation | What the player should feel | What leaks |
| --- | --- | --- | --- |
| Mundane | 0 to 2 | A dull, slightly silly office. | Almost nothing. A Smart range complaint is just odd. |
| Odd | 3 to 4 | Something is off, but nobody admits it. | Small details that do not add up. People know things they should not. |
| Wrong | 5 or more | The office feels unsafe. | The Smart range seems to watch and listen. The mission statement sounds like a threat. |

- Every run reaches Wrong by Friday morning, so every character needs a Wrong voice.
- _(draft)_ Change one or two details between tiers. Keep the same character voice.

## The Factions

The Factions clash over Smart range complaints.

| Faction | What it does | Why | Members |
| --- | --- | --- | --- |
| Launch Team | Buries Smart range complaints. | The launch pays its bonus. | Pan Zbigniew, Ryszard, Wiola |
| Paper Trail | Escalates Smart range complaints. | It wants written proof that it warned people, so the blame lands elsewhere. | Pani Halina, Kamil |

- "Launch Team" is the official name, and it has a logo. "Paper Trail" began as the Launch Team's mocking nickname, and the side adopted it.
- The Launch Team is bigger on purpose. Escalating should feel outnumbered.
- The Intern does not know the Factions exist on Monday. The Intern discovers them through Tasks on Tuesday. So no Monday line should name a Faction as if the Intern knows it.
- Nobody switches Faction during the week.

## Conversation rules

These rules limit what a Colleague Conversation may do. The Ink bridge throws an error in development if a Conversation breaks them. Scripted scenes are exempt.

- A Conversation may change at most one Pressure, by a total of at most 1 up or down.
- It may change the speaker's goodwill, the rival goodwill or Sanity. It never changes Performance.
- It may call `escalate()` at most once.
- Across one Colleague's week, the choices that raise a Pressure and the choices that lower one roughly balance.
- Use `set_flag()` for anything another character or the rules must know. Never use a global `VAR` as memory.

Read section 4, "Conversations", in the spec for the full list.

## Translation-safe rules

Every writer follows these rules. A Polish version comes after the slice.

- Give every Ink line an `#id:` tag. Run `npm run ink:ids` to add missing tags.
- Write each sentence as one whole string. Never build a sentence from pieces in code.
- Never write grammar that depends on a number, such as "1 complaint" against "2 complaints".
- Give each pun a `#note:` tag that explains it for translators.
- Never explain what the surnames mean in game text.

## Pan Zbigniew Pogodny

| | |
| --- | --- |
| Role | Boss, Head of Customer Complaints. The Intern's direct Boss. |
| Faction | Launch Team, as its leader. |
| Ink file | [`src/story/zbigniew.ink`](../../src/story/zbigniew.ink) |
| Voice anchor | Not written yet. |
| Where he speaks | Tasks, the Monday onboarding, the Performance Firing and his Brush-offs. He has no Conversations the Intern can start. |

**Wants:** a smooth Smart range launch and his launch bonus. He wants every complaint to disappear quietly.

**Speech habits:**

- He never says a negative word. He turns every bad thing into a good one: a problem is an "opportunity", and a complaint is a "feedback moment".
- _(draft)_ He sounds warm and encouraging, like a motivational poster.
- _(draft)_ He praises the Intern for things that should worry them.

**Words to avoid:** problem, complaint, fault, broken, bad, wrong, fail. _(draft)_ Also "no".

**By tier:** he grows calmer as things get worse. The calm turns creepier as Escalation rises.

- Mundane: cheerful corporate positivity, slightly too much of it.
- Odd: calmer. He answers worrying news with reassurance that comes too fast.
- Wrong: very calm and very still. His positive words now sound like threats.

## Pani Halina Teczka

| | |
| --- | --- |
| Role | Boss, Head of Product Safety. |
| Faction | Paper Trail, as its leader. |
| Ink file | [`src/story/halina.ink`](../../src/story/halina.ink) |
| Voice anchor | Not written yet. |
| Where she speaks | Tasks, scripted scenes and her Brush-offs. She has no Conversations the Intern can start. |

**Wants:** written proof that she warned Head office. When the Smart range blows up, she wants the blame to land on someone else.

**Speech habits:**

- She records everything "for the file". She often says she is noting what the Intern just said.
- She fears Head office more than anyone does.
- She acts as an ally, but she would sell the Intern out to stay clean.
- _(draft)_ She speaks precisely and formally. She likes dates, times and reference numbers.
- _(draft)_ She uses passive voice to keep her own name out of things: "It was decided", "Concerns were raised".

**Words to avoid:** _(draft)_ casual slang, "I promise", "trust me" and "off the record". She never admits that she made a decision herself.

**By tier:** _(draft)_

- Mundane: dry and bureaucratic. A stickler for forms.
- Odd: more nervous. She asks the Intern to repeat things so she can write them down.
- Wrong: cold and quiet. She talks about what the file will say about the Intern, not about her.

## Ryszard Szablon

| | |
| --- | --- |
| Role | Colleague, Customer Complaints veteran of 19 years. |
| Faction | Launch Team. |
| Ink file | [`src/story/ryszard.ink`](../../src/story/ryszard.ink) |
| Voice anchor | Not written yet. |
| Where he speaks | The Monday onboarding, which counts as his Monday Conversation. Conversations from Tuesday to Friday. His Brush-offs and his hand-off line. |

**Wants:** his next "case closure" award. He wins them by closing cases without reading them. _(draft)_ He also wants a quiet life until retirement.

**Speech habits:**

- He has a template reply for everything.
- He teaches the Intern to fake Tasks.
- _(draft)_ He talks as if he is reading a template out, with set phrases such as "We regret any inconvenience" and "Your case has been resolved".
- _(draft)_ He mentions his 19 years and his awards often.
- _(draft)_ He is tired, but kind in his own lazy way. His advice on faking Tasks sounds friendly and practical.

**Words to avoid:** _(draft)_ He never sounds excited about the Smart range. He never goes into technical detail. He never shows real concern for a customer.

**By tier:** _(draft)_

- Mundane: a bored old hand with shortcuts for everything.
- Odd: he admits that some cases do not fit any template. He changes the subject at once.
- Wrong: his templates start to answer questions nobody asked. He sounds as if he has stopped noticing.

## Wiola Ufna

| | |
| --- | --- |
| Role | Colleague, Smart range believer. |
| Faction | Launch Team. |
| Ink file | [`src/story/wiola.ink`](../../src/story/wiola.ink) |
| Voice anchor | Not written yet. |
| Where she speaks | Conversations from Monday to Friday, her Brush-offs and her hand-off line. |

**Wants:** _(draft)_ for everyone to love the Smart range as much as she does. She wants the launch to succeed because she truly believes in it.

**Speech habits:**

- She uses a Smart range seat at home.
- She quotes the mission statement sincerely.
- She knows small personal things about people and never says how.
- She is the main channel for the sinister leak. Her personal details carry the hints about the Smart range secret.
- _(draft)_ She is warm, bubbly and sincere. She means every word.

**Words to avoid:** _(draft)_ She is never cynical or sarcastic. She never doubts the Smart range. She never explains how she knows things.

**By tier:** _(draft)_

- Mundane: a cheerful product fan. Her personal details sound like lucky guesses.
- Odd: her details get too specific. She seems pleased, not worried, that she knows them.
- Wrong: she knows things only a toilet seat could know. She stays just as sweet.

## Kamil Przeciek

| | |
| --- | --- |
| Role | Colleague, Product Safety tester. |
| Faction | Paper Trail. |
| Ink file | [`src/story/kamil.ink`](../../src/story/kamil.ink) |
| Voice anchor | Not written yet. |
| Where he speaks | Conversations from Monday to Friday, his Brush-offs and his hand-off line. |

**Wants:** _(draft)_ for someone to believe him about the Smart range. He wants his warnings on record.

**Speech habits:**

- He is right about everything, but nobody believes him because of how he says it.
- He keeps a binder of printed complaints.
- He eats lunch in the stairwell.
- He makes it feel right to escalate complaints, but tiring to listen to him.
- _(draft)_ He talks too fast and in too much detail. He piles up facts, test numbers and complaint references.

**Words to avoid:** _(draft)_ vague words such as "maybe" or "sort of". He never sounds calm or relaxed.

**By tier:** _(draft)_

- Mundane: a nervous, tiring know-it-all.
- Odd: his facts start to match what the player has seen. He is harder to dismiss.
- Wrong: he is quieter and more scared. He says less, because he no longer expects anyone to listen.

## The Intern and Head office

These have no character sheets or voice anchors.

**The Intern** is the player character.

- The Intern addresses Bosses formally and Colleagues by first name.
- A choice never shows its effect on a Pressure. After the pick, the Intern says the chosen text as a line, so write each choice as something the Intern can say.
- _(draft)_ Keep the Intern's lines short and neutral, so the player can read their own feelings into them.

**Head office** speaks in one bubble at the top centre of the screen.

- _(draft)_ Keep its lines short, impersonal and calm, like an automated notice.

## How to check and submit a draft

1. Check each line against this list:
   - The line fits the speaker's sheet: wants, speech habits and words to avoid.
   - The line matches the tier it is written for.
   - Any hint about the Smart range fits the secret but does not state it.
   - The line follows the translation-safe rules.
   - The line sounds like the speaker's voice anchor. If the anchor does not exist yet, do not draft lines for that speaker.
2. Fix any mismatch.
3. Open a pull request.
4. The author reads every drafted line before it merges.

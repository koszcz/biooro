# Spec: Intern game vertical slice

This spec tells you how to build the vertical slice of the Biooro intern game. Each section gives the decisions you need and links to the ticket that holds the full detail. When this spec and a ticket differ, this spec wins. The section "Fixes made in this spec" lists every place where it differs.

The spec is final. Every decision is made, and you can build the whole slice from it.

Terms in capitals, such as Task, Pressure and Escalation, are defined in [CONTEXT.md](../../CONTEXT.md).

## 1. Scope

The slice covers one in-game week, from Monday to Friday, on one office floor. It has two Bosses and three Colleagues. It runs in the browser only and ships in English, with all text ready for translation.

These are out of scope:

- anything after Friday evening
- desktop builds and a commercial release
- a Polish translation
- Colleagues switching Faction

## 2. Company and tone

Source: [Company identity](issues/01-company-identity.md).

- Biooro is a mid-size regional toilet firm. Head office is distant, never appears, and the Bosses fear it.
- The Intern joins Customer Complaints.
- The tone is mundane on the surface, with sinister things leaking through. The leak grows with Escalation.
- The Smart range is a line of toilet seats that measure things. Its complaints grow stranger each day.
- The mission statement is "Biooro. Listening to your body, one flush at a time."
- The Smart range secretly harvests user data for Head office. Only writers know this. Keep every hint consistent with it, and never reveal it in game text or in `CONTEXT.md`.

## 3. Cast and Factions

Source: [Cast](issues/06-cast.md).

| Person | Role | Faction | Quirk |
| --- | --- | --- | --- |
| Pan Zbigniew Pogodny | Boss, Head of Customer Complaints | Launch Team | Never says a negative word. Grows calmer, then creepier, as things get worse. |
| Pani Halina Teczka | Boss, Head of Product Safety | Paper Trail | Records everything "for the file". Would sell the Intern out to stay clean. |
| Ryszard Szablon | Colleague, 19-year veteran | Launch Team | Has a template for everything. Teaches the Intern to fake Tasks. |
| Wiola Ufna | Colleague, Smart range believer | Launch Team | Knows small personal things about people. Main channel for the sinister leak. |
| Kamil Przeciek | Colleague, Product Safety tester | Paper Trail | Right about everything, but nobody believes him. |

- The Launch Team buries Smart range complaints to protect the launch bonus.
- The Paper Trail escalates them to have proof that it warned people.
- The Intern discovers the Factions through Tasks on Tuesday.
- Names stay Polish and are never translated or explained. The Intern says "Pan Zbigniew" and "Pani Halina", and uses first names for Colleagues.

## 4. Game rules

Sources: [Pressures and Task choices](issues/07-pressures-and-task-choices.md), with amendments from [The week](issues/08-the-week.md), [What sabotage does to a Task](issues/19-what-sabotage-does-to-a-task.md), [Task choices on a Fallout Task](issues/20-task-choices-on-a-fallout-task.md), [What helps a Faction](issues/21-what-helps-a-faction.md), [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md), [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md) and [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md).

### Pressures

- There are four Pressures: Performance, Launch Team goodwill, Paper Trail goodwill and Sanity.
- Each one is a whole number from 0 to 10. Each starts at 6, never goes above 10 and never goes below 0.
- If any Pressure reaches 0, the Intern is fired.
- All outcomes are deterministic. Use no randomness anywhere in the rules.
- Both goodwill Pressures change from Monday but appear on screen only from Tuesday morning.
- Sanity drops by 1 every morning from Tuesday. It does not drop on Monday.

### The Workday

- Each day has 8 hours. Only Task choices and Breaks spend hours.
- Walking and talking are free. The clock never ticks in real time.
- A Break costs 1 hour and raises Sanity by 2.
- On Friday the audit takes the last 3 hours, so the Intern has 5 hours for Tasks and Breaks.
- A Task choice or Break that costs more hours than are left is locked. Its reason is "Not enough hours left today."
- The day ends when the hours run out or when the Intern goes home. Going home loses the leftover hours.

### Task choices

A Task's side is the Faction of whoever assigned it. Some Tasks have no side. For a Task whose side is Faction X, with rival Faction Y:

| Task choice | Hours | Performance | X goodwill | Y goodwill | Sanity |
| --- | --- | --- | --- | --- | --- |
| Do it | 3 | +1 | +1 | 0 | −1 |
| Fake it | 1 | +1 | 0 | 0 | 0 |
| Delegate it | 1 | see "Delegating" | see "Delegating" | see "Delegating" | 0 |
| Sabotage it | 2 | −1 | −2 | +1 | +1 |

- For a Task with no side, ignore both goodwill columns.
- A Paper Trail Task never raises Performance. Sabotaging one still costs Performance 1.
- Every Task choice handles the Task, and a handled Task closes for good.
- Doing, faking and delegating also finish the Task. Sabotage handles it without finishing it, so a sabotaged Task never rolls over and never returns.
- All four Task choices always appear. A locked one says why.

### Delegating

- The Intern picks a Colleague. That Colleague's Faction must have goodwill of 5 or more. Otherwise the reason is "<Colleague> doesn't trust you yet".
- Delegating costs that Colleague's Faction 1 goodwill. That cost is already in the tables below.
- Ryszard fakes the Task, so it causes Fallout in 2 days. Wiola does it properly. Kamil escalates it: a Launch Team Task or a Task with no side flips to the Paper Trail, and he does a Paper Trail Task properly.

Net effects of delegating:

| Task side | Delegate to | Performance | Launch Team goodwill | Paper Trail goodwill | Escalation | Fallout |
| --- | --- | --- | --- | --- | --- | --- |
| Launch Team | Ryszard | +1 | −1 | 0 | 0 | Yes |
| Launch Team | Wiola | +1 | 0 (−1 cost, +1 done) | 0 | 0 | No |
| Launch Team | Kamil | 0 | −1 (the flip) | −1 (the cost) | +1 | No |
| Paper Trail | Ryszard | 0 | −1 | 0 | 0 | Yes |
| Paper Trail | Wiola | 0 | −1 | +1 | +1 | No |
| Paper Trail | Kamil | 0 | 0 | 0 (−1 cost, +1 done) | +1 | No |
| No side | Ryszard | +1 | −1 | 0 | 0 | Yes |
| No side | Wiola | +1 | −1 | 0 | 0 | No |
| No side | Kamil | 0 | 0 | −1 | +1 | No |

### Helping a Faction

A Task choice helps whichever Faction the real work ends up serving. "Helps" feeds two rules: the neutrality cost and Escalation.

| Task choice | Task side X | Task with no side |
| --- | --- | --- |
| Do it | Helps X | Helps nobody |
| Fake it | Helps nobody | Helps nobody |
| Sabotage it | Helps Y | Helps nobody |
| Delegate to Ryszard | Helps nobody | Helps nobody |
| Delegate to Wiola | Helps X | Helps nobody |
| Delegate to Kamil | Helps the Paper Trail | Helps the Paper Trail |

- Conversations, the Friday audit and expired Fallout never help a Faction.

### Fallout

- Each faked Task returns two days later as a Fallout Task with the same Task side. This includes Tasks Ryszard fakes.
- Fallout that would arrive after Friday never arrives. So faking on Thursday and Friday is free. This is an intended late-week release.
- The first Fallout can land on Wednesday, from a Task faked on Monday.
- A Fallout Task offers all four Task choices, with these limits:

| Task choice | On a Fallout Task |
| --- | --- |
| Do it | 4 hours. The other effects follow the "Do it" row. |
| Fake it | Locked: "You already faked this once." |
| Delegate it | Normal delegation, except Ryszard is locked: "Ryszard already faked this once." |
| Sabotage it | The normal sabotage row. |

- So no Fallout Task ever creates more Fallout.
- A Fallout Task is ignored when it is still unhandled at the end of the day it arrived. An ignored Fallout Task costs Performance 3, adds 1 Escalation and expires. It does not also pay the normal unhandled cost.
- An expired Task closes for good. It is neither handled nor finished.

### Neutrality

- From Tuesday, at the end of each day, each Faction the Intern did not help that day loses 1 goodwill.

### Task growth

- Each morning, 2 new Tasks arrive, plus 1 more for every 2 Tasks the Intern finished the day before. Fallout Tasks that were done or delegated count as finished.
- New Tasks never exceed the number of slots that day (see "Task slots"). Extra Tasks are dropped.
- Fallout Tasks arrive on top of the new Tasks and are not capped.
- At the end of each day, each unhandled Task that is not Fallout costs Performance 1 and rolls over.

### Escalation

Source: [The week](issues/08-the-week.md).

- Escalation is a hidden whole number. It starts at 0, and each morning adds 1, so Monday starts at 1.
- These add 1 Escalation: sabotaging any Task, any Task choice that helps the Paper Trail, an ignored Fallout Task, and `escalate()` from Ink.
- One Task choice adds at most 1 Escalation. Sabotaging a Launch Team Task helps the Paper Trail but still adds only 1.

| Tier | Escalation |
| --- | --- |
| Mundane | 0 to 2 |
| Odd | 3 to 4 |
| Wrong | 5 or more |

- The tier changes the moment Escalation crosses a boundary, even mid-day. The game emits `tierChanged` when it does.
- The tier picks dialogue lines, office details, the palette and the music.
- Every run reaches Wrong by Friday morning.

### Conversations

Source: [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md).

- Each Colleague offers one Conversation per day. After the Intern holds it, that Colleague has none left that day.
- A skipped Conversation is lost. It never comes back on a later day.
- The Monday onboarding counts as Ryszard's Monday Conversation. So the week has 14 Colleague Conversations.
- Bosses have no Conversations the Intern can start. They speak only through Tasks and scripted scenes.
- A Conversation may change at most one Pressure, by a total of at most 1 up or down. It may change the speaker's goodwill, the rival goodwill or Sanity, never Performance.
- A Conversation may call `escalate()` at most once.
- `adjust()` from a Conversation never takes a Pressure below 1. So a Conversation never causes a Firing.
- Clicking a Colleague after their Conversation, or any Boss, shows a brush-off. A brush-off changes nothing.
- Scripted scenes are not Colleague Conversations. The caps above do not apply to them. Only the Monday onboarding uses up a daily Conversation.

### Balance

Source: [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md). The simulator is [sim/week_sim.py](sim/week_sim.py), and the retry check is [sim/retry_check.py](sim/retry_check.py).

The week is tight but survivable. These policies use no Conversations and no delegation:

| Policy | Result |
| --- | --- |
| Always "Do it", no Breaks | Fired on Wednesday morning (Sanity) |
| Always "Do it", Breaks with leftover hours | Survives at Performance 1 |
| Fake first, then Fallout, then Breaks | Fired on Friday night (Performance) |
| Fallout first, then fake, then Breaks | Fired on Thursday night (Performance) |
| Mixed: help both Factions each day, fake the rest | Survives at Performance 6, Launch Team 9, Paper Trail 8, Sanity 1 |

- Every morning Firing in 60,000 random weeks had a surviving line of play from the previous day. So "Retry yesterday" is not a trap.

## 5. The week

Sources: [The week](issues/08-the-week.md) and [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md).

| Day | Tier at start | What the day does |
| --- | --- | --- |
| Monday | Mundane | Dull onboarding. Ryszard teaches the Intern to fake Tasks. |
| Tuesday | Mundane | The Intern discovers the Factions. Both goodwill gauges appear. |
| Wednesday | Odd | The first truly strange Smart range complaint arrives. Monday's Fallout can land. |
| Thursday | Odd | Tuesday's Fallout lands. Both Bosses demand loyalty. |
| Friday | Wrong | Head office audits the Smart range in the last 3 hours. |

### Morning steps

1. The day number goes up by 1.
2. Escalation goes up by 1. If it crosses a tier boundary, `tierChanged` fires.
3. From Tuesday, Sanity drops by 1.
4. The Firing check runs. If a Pressure is at 0, the Firing scene plays and the morning stops here.
5. On Tuesday only, `goodwillRevealed` fires.
6. Fallout Tasks due today arrive. Each one fires `falloutArrived`.
7. New Tasks arrive from today's Task slots. The strange Task swap uses the tier from step 2. Each Task fires `taskAssigned`.
8. The game takes the day-start snapshot and autosaves.
9. `dayStarted` fires.
10. On Monday only, the onboarding scene plays.

### End-of-day steps

1. Each ignored Fallout Task costs Performance 3, adds 1 Escalation and expires.
2. Each other unhandled Task costs Performance 1 and rolls over.
3. From Tuesday, each Faction the Intern did not help today loses 1 goodwill.
4. The Firing check runs once. If any Pressure is at 0, the Firing scene plays.
5. The game autosaves, then `dayEnded` fires.
6. The next day's morning steps run.

During the day, a Firing happens straight after the Task choice or Ink choice that drops a Pressure to 0. The end-of-day steps are not choices, so they share one check.

### Friday

1. The 5 Task hours run out, or the Intern goes home.
2. End-of-day steps 1 to 3 run.
3. The Firing check runs.
4. The Friday audit scene plays, and its answer applies its effect.
5. The Firing check runs again.
6. If the Intern is not fired, the game autosaves, `dayEnded` fires, then `weekSurvived` fires, and the survival scene plays.

### Task slots

Each morning, take as many slots as new Tasks arrive, in this order:

| Day | Slots in order |
| --- | --- |
| Monday | Pan Zbigniew (Launch Team); anyone (no side) |
| Tuesday | Pani Halina (Paper Trail); Pan Zbigniew (Launch Team); anyone (no side) |
| Wednesday | Kamil (Paper Trail); Wiola (Launch Team); Ryszard (Launch Team) |
| Thursday | Pani Halina (Paper Trail); Pan Zbigniew (Launch Team); Kamil (Paper Trail); anyone (no side) |
| Friday | Pan Zbigniew (Launch Team); Pani Halina (Paper Trail); Wiola (Launch Team); Ryszard (Launch Team) |

- Each slot and each strange Task names its Task place and its clips in the content (see "How Task choices play out").
- "Oldest" means the order in the open list: rolled-over Tasks first, then Fallout in arrival order, then new Tasks in slot order.

### Strange Task swaps

- Tuesday, Wednesday and Thursday each have one strange Task.
- At morning step 7, if the tier is above that day's starting tier, the strange Task replaces the last slot used that day. It keeps that slot's assigner and Task side.

### The Friday audit

- An unseen Head office auditor phones in, and Pani Halina hovers nearby.
- The auditor asks one question about Smart range complaints.

| Answer | Effect |
| --- | --- |
| Bury | Launch Team goodwill +2 |
| Escalate | Paper Trail goodwill +2 |
| Deflect | Sanity −2 |

- The answer can cause a Firing.
- The player sees the final Pressures before answering, because the end-of-day steps have already run.

### Firings

| Priority | Pressure at 0 | Firing scene |
| --- | --- | --- |
| 1 | Performance | Pan Zbigniew fires the Intern serenely. |
| 2 | Launch Team goodwill | Ryszard hands the Intern a template dismissal letter. |
| 3 | Paper Trail goodwill | Pani Halina files the Intern away. |
| 4 | Sanity | The Intern walks out. |

- When two or more Pressures reach 0 in the same step, the highest priority picks the scene. The `fired` event carries only that Pressure.
- After a Firing scene, the game offers a retry and "Start over" (see "Save and load").

### Surviving the week

- If the Intern is not fired by the end of Friday, one Friday-evening scene plays.
- It has three variants: Launch Team goodwill higher, Paper Trail goodwill higher, or both equal.

## 6. Screen and interface

Sources: [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md), [Crowded Task bubbles](issues/12-crowded-task-bubbles.md), [Conversation interface](issues/24-conversation-interface.md) and [How Task choices play out](issues/27-how-task-choices-play-out.md). The prototype is in `prototype/pressures-ui` on `main`. Run `pnpm --dir prototype/pressures-ui dev`, then open `?variant=C` or `?variant=E` for Tasks, `?variant=G` for Conversations, or `?variant=J` for Task actions.

### Task bubbles

- Each open Task is a speech bubble over its assigner's head. "Anyone" Tasks float over the Intern.
- A bubble shows the full Task text at once, wrapped at 200 pixels. It has no letter-by-letter reveal and plays no blips.
- The border shows the Task side colour from Tuesday. It is grey on Monday and for Tasks with no side.
- A Fallout bubble has a pink fill and a warning sign.
- A person with 3 or more open Tasks shows their two most urgent Tasks in full, plus a pill saying "+N more from <name>". The pill adds "⚠ N" if any hidden Task is Fallout.
- Most urgent means Fallout first, then oldest first. Use this order everywhere.
- A bubble group slides inward near a screen edge.

### The Task choice popover

- Clicking a bubble opens a popover beside the assigner, with the Task text, assigner, side and all four Task choices. It opens from anywhere: the Intern does not walk first.
- Each Task choice shows its hours and effect chips, such as "+1 Perf". A locked one shows its reason in red.
- On Monday the chips leave out goodwill.
- "Delegate it" starts collapsed. It opens one row per Colleague, with that Colleague's effects and one line on what they will do. If all three are locked, it says "Nobody will take it".
- Hovering a Task choice previews it: striped sections on the gauges and orange hour blocks.
- Clicking an available Task choice starts it at once, with no confirmation.
- Clicking the pill opens a list of that person's Tasks. After a Task choice finishes, the popover returns to the list, and it closes when the list is empty.
- While a popover is open, other people's bubbles fade to 35% opacity. Escape or × closes it.
- The popover opens to the right and flips left at the edge. It never covers the gauges or hour blocks, and it scrolls if too tall.

### How Task choices play out

Every Task has one Task place, written in the content with its clips. The slice has seven Task places:

| Task place | "Do it" clip | Sabotage clip |
| --- | --- | --- |
| The Intern's desk (the default) | `sit` | `sit` |
| The printer | `interact-left` | `attack-kick-right` |
| The sink | `interact-right` | `interact-left` |
| The plant | `pick-up` | `attack-kick-left` |
| The shredder | `crouch` | `attack-melee-right` |
| Room 4 (the Smart toilet) | `interact-left` | `attack-kick-right` |
| The evidence shelf | `pick-up` | `interact-right` |

| Task choice | On screen |
| --- | --- |
| Do it | The Intern walks to the Task place and plays its "Do it" clip. |
| Fake it | The same walk, place and clip. It ends with a "✨ looks done" sparkle. |
| Sabotage it | The same walk and place, with the sabotage clip. A purple "🤫" tag over the Intern shows only to the player. Nobody reacts. |
| Delegate it | The Intern walks to the Colleague. The Colleague nods (`emote-yes`) and says their hand-off line in a speech bubble. The hour drains there. |

After a hand-off, the Colleague acts on their own, at no cost to the Intern:

- Wiola walks to the Task place, works for about 3 hours of screen time, then walks home. For a desk Task, she works where she stands.
- Kamil does the same for a Paper Trail Task or a Task with no side. With a Launch Team Task, he walks to Pani Halina instead.
- Ryszard stays where he is and shows "✨ looks done".

While a Task choice plays out:

- One hour block empties for each hour the Task choice costs. Start at 1 second per hour and tune it in the build.
- Input is locked. Clicks on the office are ignored. All Task bubbles dim and cannot be clicked. Any open popover closes. Break and "Go home" are disabled.
- The Task shows "⏳" before its title. A tag over the Intern names the Task choice, the Task and the hours left as small blocks.
- Pressures change on screen when the action finishes. Each visible change rises from the Intern's head as a coloured float, such as "+1 Performance".
- A Firing or the end of the day waits until the action finishes.

A Break plays no walk. Its hour block empties at once, and "+2 Sanity" floats up.

### Pressures and hours

- The Pressures are slim vertical gauges on the left edge, labelled Perf, Launch, Paper and Sanity.
- A gauge pulses at 2 or lower.
- On Monday only Perf and Sanity show. The goodwill gauges pop in on Tuesday morning.
- The Workday is 8 blocks at the bottom centre, with the hours left as a number. The Break button and then the "Go home" button sit at the end.
- "Go home" asks for confirmation if open Tasks remain. If none remain, it ends the day at once.
- When no Tasks are open, a prompt at the top says "Nobody wants anything". Its "Go home" button ends the day at once.

### Conversations

Starting one:

- Hovering a person changes the cursor to a pointer and shows a dark label under their head:
  - "💬 Talk to <name>" when that Colleague still has a Conversation today
  - "<name> · talked today", greyed, after it is used
  - "<name> · busy (Boss)" for a Boss
- Clicking a Colleague with a Conversation walks the Intern to the first free cell beside them. The Intern faces them, and they turn to face the Intern. The Conversation starts on arrival.
- When the Conversation ends, the partner turns back to where they faced before.
- From the click until the Conversation ends, clicks on the office do nothing. The player cannot move, pick a Task choice, take a Break or go home.

Text and choices:

- Each line is a large white speech bubble over the speaker's head. Its border and tail use the speaker's Faction colour, and a small heading shows their name. The Intern's lines appear over the Intern.
- Head office lines appear in one bubble at the top centre of the screen.
- During a Conversation, the partner's Task bubbles hide. Everyone else's fade to 25% and cannot be clicked. Any open popover closes. The gauges and hour blocks stay visible.
- Text reveals at 45 characters a second. A click, Space or Enter completes the line. A "▸" then appears at its end, and the next press moves on.
- Choices appear as stacked, numbered bubbles over the Intern, with an orange border. The player clicks one or presses its number key.
- Choices never show their Pressure effect. After the pick, the Intern says the chosen text as a line. Then the gauge moves, and a label such as "+1 Sanity" floats up beside the gauges.
- A change to a hidden gauge (goodwill on Monday) still happens, but no label floats.

The daily limit and brush-offs:

- A small white "…" badge sits over each Colleague who still has a Conversation today. Its border uses their Faction colour.
- After that Conversation, the badge fades to 35% for the rest of the day. Bosses never have a badge. Ryszard's badge is faded on Monday after the onboarding.
- Clicking a used-up Colleague or any Boss shows a brush-off. The Intern does not walk.
- A brush-off is a smaller speech bubble over that person, with one line for the current tier and no choices. It fades out after about 2.6 seconds.

Scripted scenes:

- These are the Monday onboarding, the Friday audit, the four Firings and the survival scene. The game starts them.
- Black letterbox bars slide in at the top and bottom. A title card sits in the top bar, such as "Monday 9:00 · Onboarding" or "Fired · Performance hit 0".
- The gauges, hour blocks, Task bubbles and "…" badges hide until the scene ends.
- Lines and choices use the same bubbles, reveal and keys as a Conversation.
- If the main speaker is in the room (Pan Zbigniew at the onboarding and at the Performance Firing), the Intern first walks beside them, and the two face each other.

### After a Firing

- After the Firing scene, the screen offers a retry button and "Start over".
- The retry button reads "Retry this day" after a Firing during the day, at the end of the day or at the Friday audit.
- It reads "Retry yesterday" after a morning Firing.

## 7. Look and art

Sources: [Isometric office look](issues/02-isometric-office-look.md) and [Character and art direction](issues/13-character-and-art-direction.md). The prototypes are in `prototype/office-look` on `main`. Run `pnpm --dir prototype/office-look dev`, then open `?variant=A|B|C` or `/art.html`. Before you build or restyle any 3D asset, read [docs/art/making-assets.md](../../docs/art/making-assets.md).

### Camera and movement

- Use an orthographic camera at the true isometric angle: 35.264° down, 45° around. The player cannot rotate it.
- The mouse wheel zooms between half and three times the default framing.
- The player clicks the floor to walk. The Intern walks 2.4 tiles per second on a grid with 8 directions and no corner cutting. A ring marks the target.
- Clicking a chair walks the Intern there to sit.

### The floor

- One floor is 21 by 11 tiles. One tile is one unit.
- Three rooms sit side by side: Customer Complaints, Product Safety and the Showroom. A two-tile corridor runs along the near side.
- Each room has a one-tile doorway to the corridor. Neighbouring rooms join through one-tile doorways.
- The back and west walls are full height. Inner walls are 0.5-unit stubs, and near outer walls are 0.2-unit stubs.
- Launch Team desks stand on a teal rug, and Paper Trail desks on a manila rug. The Launch Team turf is larger.
- The middle Showroom toilet is the Smart range, with a red LED and a glowing sign.
- The office grid marks each of the seven Task places.
- Centre each Kenney piece on its cell, because Kenney origins sit at a corner.

### People

- Use Kenney Mini Characters at native size. Lift seated characters 0.13 units. Bosses are 12% taller.
- Each cast member uses a different base model and wears a box vest: teal (`#18b6c8`) with a lanyard for the Launch Team, manila (`#c9ab6b`) with a folder for the Paper Trail.
- Pogodny wears a dark teal tie. Teczka wears reading glasses and a blinking red recording light.
- Przeciek wears sunglasses and sits on the corridor bench by the stairwell. Ufna stands by the Smart toilet.
- The Intern is the only saturated orange (`#ff7a1a`), with a white stripe, an orange ring underfoot and a bobbing arrow overhead.

### Palette by tier

| Tier | Palette | Smart toilet LED |
| --- | --- | --- |
| Mundane | Bright, warm and boring | Off |
| Odd | Slightly greyer and greener | Faint glow |
| Wrong | Greyer, dimmer and sickly green | Pulsing red |

- The palette follows the tier, not the day, because choices can bring a tier early.
- Lighting stays steady. Do not flicker it.

## 8. Audio

Source: [Audio](issues/14-audio.md).

- One quiet muzak loop plays, with three pre-made variants: clean (Mundane), detuned (Odd) and thin (Wrong). A tier change crossfades to its variant.
- A looping office hum plays under the music. Firing scenes cut the music to silence.
- These get a sound: a Task bubble appearing, each of the four Task choices, a Pressure drop, a Firing and the end of a day.
- Each character has a gibberish blip at its own pitch, made from one sample. One blip plays per two revealed characters of speech-bubble text in Conversations, scripted scenes, brush-offs and hand-off lines. Spaces make no blip.
- Use CC0 files only, such as the Kenney audio packs. Generate nothing in code.
- There is one mute button and no volume sliders.
- Use raw Web Audio in `src/audio/`. List every file in one typed manifest, and keep the files in `public/audio/`.

## 9. Save and load

Sources: [Save and load](issues/15-save-and-load.md), [Retry after a morning Firing](issues/17-retry-after-a-morning-firing.md) and [Ink state across saves](issues/18-ink-state-across-saves.md).

### What the save holds

- One `localStorage` key holds the save record: `GameState`, Ink's state JSON from `story.state.toJson()`, the day-start snapshot and a `version` number.
- The day-start snapshot holds a copy of `GameState` and the Ink state JSON from morning step 8.
- A second key holds the settings record, such as mute.

### When it saves

- The game autosaves after every Task choice, every Break, the end of every Conversation or scripted scene, morning step 8 and end-of-day step 5. There is no save button.
- It never saves inside a Conversation. If the player reloads midway, the Conversation replays from its start, and its effects apply once.
- A Firing ends any Conversation, and the game saves at that point.
- The save after a Task choice holds the finished result. Reloading during the action skips the rest of the animation.

### Slots and loading

- There is one slot. The title screen offers Continue and New game. New game asks for confirmation, then overwrites the slot.
- A finished week removes Continue.
- If the `version` differs, the JSON fails to parse or `story.state.LoadJson()` throws, the game discards the save.
- Developers bump the save `version` whenever they change a `.ink` file. `npm run check` does not enforce this.
- If the player closes the tab on the Firing screen, Continue reopens the retry and "Start over" choice.
- If the save has 0 hours left in a Workday, Continue runs the end-of-day steps.

### Retry

- Retry restores the day-start snapshot, both `GameState` and Ink state. The morning steps do not run again.
- The game keeps only one snapshot. Each new one replaces the last.
- A morning Firing happens before that day's snapshot exists. So its retry restores the previous day, and the button reads "Retry yesterday".
- The earliest morning Firing is on Tuesday. Its retry restores Monday.

## 10. Tech plan

Sources: [Lock the tech plan](issues/09-lock-the-tech-plan.md), [Three.js stack](issues/04-threejs-stack.md), [Branching dialogue tool](issues/03-branching-dialogue-tool.md), [Ink state across saves](issues/18-ink-state-across-saves.md), [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md), [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md) and [How Task choices play out](issues/27-how-task-choices-play-out.md).

### Stack

- Vanilla Three.js with Vite and TypeScript. Use npm as the package manager.
- `easystarjs` for grid A* pathfinding.
- All UI as plain DOM overlays in TypeScript, with no UI library.
- Ink for dialogue, run by inkjs. A small Vite plugin compiles Ink with `inkjs/compiler`.
- Host on GitHub Pages. GitHub Actions builds the site and runs `npm run check`.

### Boot

- A loading screen loads every GLB and audio file at boot.
- When loading finishes, the loading screen becomes the title screen with Continue and New game.
- Pressing either button unlocks browser audio. There is no separate Start button.

### Game state

- TypeScript owns all state in one plain, serialisable `GameState` object. Ink holds no Pressures and no story flags.
- `GameState` holds:
  - the four Pressures, the day, the hours left and Escalation
  - open Tasks in open-list order, and pending Fallout with due days
  - the Tasks finished today, and the Factions helped today
  - the Colleagues who held their Conversation today
  - the phase: Workday, fired (with the winning Pressure and the retry kind), or week survived
  - every story flag
- Pure rule functions take the state and return `{ state, events }`, for example `applyTaskChoice(state, task, choice)`.
- `applyTaskChoice` applies the whole Task choice in one step, at the click. Do not split it into steps, as the prototype does.
- Ink never applies a Task choice. The Task popover runs Task choices through the rule functions.

### Store commands

The UI, scene and dialogue folders change state only through these store commands:

| Command | Called by | What it does |
| --- | --- | --- |
| `chooseTask(task, choice, colleague?)` | UI | Applies the Task choice and autosaves. Emits `taskActionStarted` at once, and holds the result's other events. |
| `finishTaskAction()` | scene | Emits the held events and `taskActionFinished`. Then it runs any Firing, or the end-of-day steps if 0 hours are left. |
| `takeBreak()` | UI | Applies the Break and autosaves. |
| `goHome()` | UI | Sets the hours left to 0 and runs the end-of-day steps. |
| `startConversation(person, scripted)` | dialogue | Emits `conversationStarted`. |
| `endConversation(inkStateJson)` | dialogue | Marks the Colleague as talked today, stores the Ink state JSON, autosaves and emits `conversationEnded`. |
| `retry()`, `startOver()` | UI | Restore the snapshot, or start a new game. |

- A click on a person goes to `src/scene/`. The scene walks the Intern there, then asks `src/dialogue/` to start the Conversation.

### Events

The store applies each rule result, then emits its events. Every subscriber reacts to these events and never re-reads state each frame.

| Event | Payload | Emitted when | Used by |
| --- | --- | --- | --- |
| `dayStarted` | day | A new day begins, after the morning steps | UI, scene, dialogue |
| `hoursChanged` | hours left | A Task choice or Break spends hours, or the Intern goes home | UI |
| `pressureChanged` | Pressure, old value, new value | Any Pressure changes | UI, audio |
| `goodwillRevealed` | none | Tuesday morning | UI |
| `tierChanged` | tier | Escalation crosses a tier boundary | scene, audio |
| `taskAssigned` | Task | A new Task arrives | UI, audio |
| `falloutArrived` | Task | A Fallout Task arrives | UI, audio |
| `taskActionStarted` | Task, Task choice, Colleague if delegated, hours | A Task choice is clicked | scene, UI |
| `taskResolved` | Task, Task choice, Colleague if delegated | A Task choice's action finishes | UI, audio, scene |
| `taskActionFinished` | Task | The scene finishes the action | UI |
| `conversationStarted` | person, scripted or not | A Conversation or scripted scene starts | UI, scene |
| `conversationEnded` | person | A Conversation or scripted scene ends | UI, scene |
| `dayEnded` | day | The end-of-day steps finish | UI, audio |
| `fired` | winning Pressure, retry kind | The Firing check finds a Pressure at 0 | UI, audio, dialogue |
| `weekSurvived` | survival variant | Friday ends without a Firing | dialogue, store |

- `taskActionStarted` locks input and starts the walk, clip and hour drain. `taskActionFinished` unlocks input.
- `conversationStarted` locks input. `conversationEnded` unlocks it.

### The Ink bridge

Ink calls only these game functions, bound as inkjs external functions:

| Kind | Functions |
| --- | --- |
| Read | `pressure(name)`, `tier()`, `flag(name)`, `day()` |
| Write | `adjust(pressure, delta)`, `set_flag(name)`, `escalate()` |

- Each write runs through the same rule functions and events as the Task popover. It applies at once, so gauges move during a Conversation.
- The game checks for a Firing after each Ink choice.
- Ink runs Colleague Conversations, brush-offs, hand-off lines, the onboarding, the four Firing scenes, the Friday audit and the three survival scenes.
- In a Colleague Conversation, `adjust()` never takes a Pressure below 1. The bridge tracks each Conversation's totals. In development and tests, it throws if a Conversation changes Performance, changes more than one Pressure, changes one by more than 1 in total, or calls `escalate()` twice.
- Writers may use visit counts, once-only choices (`*`), sequences, cycles, shuffles and `temp` variables. They must not use a global `VAR` as memory between Conversations. Anything another character or the rules must know goes through `set_flag()`.

### Content data

- Typed TypeScript files in `src/content/` hold Tasks, Task slots, strange swap Tasks, Colleagues and the office layout.
- Each Task slot and strange swap Task names its Task place. The place sets the "Do it" and sabotage clips (see "How Task choices play out").
- The office layout is a hand-authored tile grid that marks walkable cells, furniture, Colleague spots and the seven Task places.

### Code layout

| Folder | Holds |
| --- | --- |
| `src/rules/` | Pure state and rule functions. No Three.js and no DOM. |
| `src/content/` | Typed data for Tasks, slots, Task places, Colleagues and the office grid. |
| `src/store/` | The state store, its commands and event emitter, autosave and the day-start snapshot. |
| `src/dialogue/` | The inkjs bridge. |
| `src/story/` | Ink files, with `main.ink` as the root. |
| `src/scene/` | Three.js, the camera, pathfinding and Task actions. |
| `src/ui/` | DOM overlays. |
| `src/audio/` | Web Audio and the audio manifest. |
| `src/locales/` | String tables. |

- `src/rules/` imports only `src/content/`.
- `src/store/` imports `src/rules/` and `src/content/`. The scene, UI, audio and dialogue folders subscribe to the store.
- `src/rules/` and `src/store/` never import the scene, UI, audio or dialogue folders.
- Folders import each other only through their `index.ts`. Each `index.ts` opens with a one-line comment on what the folder does.
- A root `AGENTS.md` maps each folder in one line.
- Tests sit beside their code as `foo.test.ts`.

### Checks

`npm run check` runs all of these. CI runs the same command. Agents run it before calling work done.

- Biome lints and formats, with `noExcessiveCognitiveComplexity` at 15.
- TypeScript type-checks the project.
- Vitest runs the tests, including the three scripted weeks below.
- The Ink compile fails on any Ink error.
- The line ID check fails on a missing or repeated `#id:` tag.
- The file size check warns at 200 lines and fails at 300 for `.ts` and `.ink` files. Files in `src/content/` fail at 500.
- `dependency-cruiser` fails on imports that break the folder rules, skip `index.ts`, or form a cycle.
- The audio check fails if a manifest entry has no file.

### The scripted weeks

Each scripted week holds no Conversations, never delegates and never sabotages. Each asserts exact results, so any rule change that moves them fails on purpose. Rerun [sim/week_sim.py](sim/week_sim.py) and update the numbers only when the change is intended.

**1. The mixed week.** Each day, repeat these steps until the policy goes home:

1. If an open Fallout Task exists and "Do it" fits in the hours left, do the oldest one.
2. Otherwise, for each Faction not yet helped today, do its oldest open Task that is not Fallout, if "Do it" fits. Check the Factions in the order their Tasks appear in the open list.
3. Otherwise, fake the oldest open Task that can be faked, if 1 hour is left.
4. Otherwise, take a Break if an hour is left and Sanity is below 10.
5. Otherwise, go home.

Before any "Do it" at Sanity 1, take a Break first. At the audit, answer "Bury" if Launch Team goodwill is lower or equal, and "Escalate" otherwise.

Assert after the audit: survived, Performance 6, Launch Team goodwill 9, Paper Trail goodwill 8, Sanity 1, Escalation 7.

**2. Always "Do it", no Breaks.** Handle the oldest Task first, do each one that fits, then go home. Assert a Sanity Firing on Wednesday morning, with "Retry yesterday".

**3. Fake first, with Breaks.** Fake the oldest Task that can be faked while 1 hour is left. Then do the oldest Fallout Task that fits. Then take Breaks below Sanity 10, then go home. Assert a Performance Firing on Friday night. This week guards the ignored Fallout cost.

### Debug panel

- A dev-only panel edits Pressures, jumps to any day and sets flags. Production builds leave it out.

## 11. Writing

Sources: [Writing workflow](issues/10-writing-workflow.md), [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md) and [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md).

### Who writes what

- The user writes one voice anchor scene per character and all four Firing scenes.
- Agents draft everything else in "Content to write".
- An agent drafts lines for a character only after that character's voice anchor exists. Task wording can start at once.
- The voice guide lives in `docs/writing/voice.md`. It holds the tone rules, one sheet per character and links to the voice anchors.

### Review

1. The agent checks its draft against the voice guide and fixes any mismatch.
2. The agent opens a pull request.
3. The user reads every drafted line before it merges.

### Files

- Ink files live in `src/story/`. `main.ink` pulls in the others with `INCLUDE`.
- Each character has one file, such as `src/story/halina.ink`. It holds that character's Conversations, brush-offs and hand-off line. `onboarding.ink`, `firings.ink`, `audit.ink` and `survival.ink` have their own files.
- A character file over 300 lines becomes a folder with one file per day, such as `src/story/halina/day1.ink`.
- Each Conversation is one knot. Tier variants branch on `tier()` beside the line they replace.
- Task wording lives in `src/locales/en/tasks.ts`, typed by Task ID. The type checker fails if a Task has no wording.

### Conversation rules

- Follow the caps in "Conversations" (section 4). The Ink bridge throws in development if a Conversation breaks them.
- Across one Colleague's Conversations in the week, the choices that raise a Pressure and the choices that lower one roughly balance. Talking shifts Pressures between goodwills and Sanity. It does not feed them for free.

### Translation-safe rules

- Every Ink line carries an `#id:` tag. A script adds missing tags.
- Never build a sentence from fragments in code.
- Never write grammar that depends on a variable, such as "1 complaint" against "2 complaints".
- Each pun carries a `#note:` tag for translators.
- Never translate Polish names.

### Content to write

| Content | Count | Writer |
| --- | --- | --- |
| Voice anchor scenes | 5, one per cast member | User |
| Firing scenes | 4 | User |
| Monday onboarding scene | 1, with Pan Zbigniew and Ryszard | Agent |
| Task wording for slots | 16, each with a Task place | Agent |
| Strange swap Tasks | 3, each with a Task place | Agent |
| Fallout wording | 11, one per Task that can return (Monday to Wednesday slots plus the 3 swaps) | Agent |
| Colleague Conversations | 14: Ryszard Tuesday to Friday, Wiola and Kamil Monday to Friday | Agent |
| Brush-offs | 15, one per cast member per tier | Agent |
| Hand-off lines | 3, one per Colleague | Agent |
| Friday audit scene | 1, with 3 answers | Agent |
| Survival scenes | 3 | Agent |

Key Fallout wording as `<taskId>.fallout` in `src/locales/en/tasks.ts`.

## 12. Assets

Sources: [Free low-poly office assets](issues/05-free-office-assets.md), [Isometric office look](issues/02-isometric-office-look.md) and [How Task choices play out](issues/27-how-task-choices-play-out.md).

- Use the Kenney Furniture Kit for office and bathroom furniture. Its GLB files are in `Models/GLTF format`.
- Use Kenney Mini Characters for people. Its GLB files are in `Models/GLB format` and need `Textures/colormap.png` beside them.
- Fill gaps with Quaternius Ultimate House Interior.
- All three are CC0, so no credits are required.
- Mini Characters has the clips the slice needs: `walk`, `sit`, `idle`, `crouch`, `interact-left`, `interact-right`, `pick-up`, `emote-yes`, `attack-kick-left`, `attack-kick-right` and `attack-melee-right`.
- The kits have no printer, so build one in code from chamfered boxes. Copy `makePrinter()` in `prototype/pressures-ui/src/scene.ts`: a floor-standing copier with two paper drawers and a sheet half out of the output slot. It uses the kit's `metal`, `metalMedium`, `metalDark` and `carpetWhite` colours, roughness 1 and no glowing lights. It is about 0.38 wide, 0.45 tall and 0.32 deep, and faces the camera. The build can keep it as code or export it once to GLB.

The full research findings are on unmerged branches:

- `research/dialogue-tool`, in `research/dialogue-tool.md`
- `research/threejs-stack`, in `research/threejs-stack.md`
- `research/office-assets`, in `research/office-assets.md`

## 13. Fixes made in this spec

These small gaps or contradictions between tickets are resolved here. Each fix overrides its source ticket.

| Fix | What this spec decides | Sources |
| --- | --- | --- |
| Friday can need more Tasks than it has slots | New Tasks never exceed the day's slot count. Fallout is not capped. The old "at most 2, 3, 3, 4 and 4" claim is replaced by this rule. | [Pressures and Task choices](issues/07-pressures-and-task-choices.md), [The week](issues/08-the-week.md) |
| No event carries the tier | Add `tierChanged`. The tier can change mid-day. | [Audio](issues/14-audio.md), [Character and art direction](issues/13-character-and-art-direction.md) |
| The event lists differ | One event table in "Events" lists all events. `taskResolved` drives the Task choice sounds. `weekSurvived` is new and starts the survival scene. | [Lock the tech plan](issues/09-lock-the-tech-plan.md), [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md), [Audio](issues/14-audio.md) |
| The palette is tied to days | Monday's look is Mundane, Wednesday's is Odd and Friday's is Wrong. The palette follows the tier. | [Character and art direction](issues/13-character-and-art-direction.md) |
| The code layout is incomplete | Add `src/story/`, `src/audio/` and `src/store/`. Save code lives in `src/store/`. | [Lock the tech plan](issues/09-lock-the-tech-plan.md), [Writing workflow](issues/10-writing-workflow.md), [Audio](issues/14-audio.md), [Save and load](issues/15-save-and-load.md) |
| Text reveal is undefined | Task bubbles show full text at once with no blips. Speech-bubble text reveals at 45 characters a second with blips. | [Audio](issues/14-audio.md), [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md), [Conversation interface](issues/24-conversation-interface.md) |
| The package manager differs | The game uses npm. The throwaway prototypes keep pnpm. | [Lock the tech plan](issues/09-lock-the-tech-plan.md) |
| Delegation effects are scattered | The "Delegating" table gives the net effects for every Task side and Colleague. | [Pressures and Task choices](issues/07-pressures-and-task-choices.md), [What helps a Faction](issues/21-what-helps-a-faction.md) |
| The first Fallout lands Wednesday, not Thursday | Monday fakes return on Wednesday. Thursday is when Tuesday's Faction Fallout lands. | [The week](issues/08-the-week.md) |
| The loading screen and title screen overlap | The loading screen becomes the title screen. Continue or New game unlocks audio. | [Audio](issues/14-audio.md), [Save and load](issues/15-save-and-load.md) |
| Fallout needs wording | Each Task that can return needs Fallout wording, keyed `<taskId>.fallout`. That is 11 strings. | [Writing workflow](issues/10-writing-workflow.md), [The week](issues/08-the-week.md) |
| The prototype branches were unmerged | Both prototypes are now on `main`. Only the three research branches stay unmerged. | [Isometric office look](issues/02-isometric-office-look.md), [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md) |
| Ignored Fallout costs Performance 2 | It costs Performance 3, everywhere. | [Task choices on a Fallout Task](issues/20-task-choices-on-a-fallout-task.md), [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md), [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md) |
| Wiola's tier variant can never vary | Escalation is always at least 5 on Friday morning, so the tier is always Wrong. The survival scenes drop the tier variant. | [The week](issues/08-the-week.md), [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md) |
| The onboarding is two things at once | The Monday onboarding is a scripted scene. It is the one scripted scene that uses up a daily Conversation: Ryszard's on Monday. | [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md), [Conversation interface](issues/24-conversation-interface.md) |
| "End the day" and "Go home" overlap | One "Go home" button ends the day. The "Nobody wants anything" prompt reuses it with no confirmation. | [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md), [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md) |
| Breaks have no on-screen action | A Break plays no walk. Its hour empties at once, and "+2 Sanity" floats up. | [How Task choices play out](issues/27-how-task-choices-play-out.md) |
| The Task action needs events and a store hand-off | The store applies a Task choice at the click and autosaves. It emits `taskActionStarted` and holds the other events until the scene calls `finishTaskAction()`. | [Lock the tech plan](issues/09-lock-the-tech-plan.md), [How Task choices play out](issues/27-how-task-choices-play-out.md) |
| Saving between Conversations needs a hook | The dialogue folder calls `endConversation(inkStateJson)`, and the store saves there. `conversationStarted` and `conversationEnded` lock and unlock input. | [Ink state across saves](issues/18-ink-state-across-saves.md), [Conversation interface](issues/24-conversation-interface.md) |
| A reload between the end of the day and the next morning | The game also autosaves at end-of-day step 5. A save with 0 hours left resumes by running the end-of-day steps. | [Save and load](issues/15-save-and-load.md), [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md) |
| Hand-off and brush-off lines have no home | Both live in each character's Ink file. The content table counts 3 hand-off lines and 15 brush-offs. | [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md), [How Task choices play out](issues/27-how-task-choices-play-out.md) |
| Sabotage clips were not chosen | The Task place table fixes one sabotage clip per place, taken from the prototype. | [How Task choices play out](issues/27-how-task-choices-play-out.md) |

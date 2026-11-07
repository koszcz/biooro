# Spec: Intern game vertical slice

This spec tells you how to build the vertical slice of the Biooro intern game. Each section gives the decisions you need and links to the ticket that holds the full detail. When this spec and a ticket differ, this spec wins. The section "Fixes made in this spec" lists every place where it differs.

The spec is not final yet. Nine rule and interface decisions are still open. The section "Open decisions" lists them, and each one has its own ticket. Do not build the parts those tickets cover until they are resolved and folded in here.

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

Source: [Pressures and Task choices](issues/07-pressures-and-task-choices.md), with amendments from [The week](issues/08-the-week.md).

### Pressures

- There are four Pressures: Performance, Launch Team goodwill, Paper Trail goodwill and Sanity.
- Each one is a whole number from 0 to 10. Each starts at 6 and never goes above 10.
- If any Pressure reaches 0, the Intern is fired.
- All outcomes are deterministic. Use no randomness anywhere in the rules.
- Both goodwill Pressures change from Monday but appear on screen only from Tuesday morning.
- Sanity drops by 1 every morning from Tuesday. It does not drop on Monday.

### The Workday

- Each day has 8 hours. Only Task choices and Breaks spend hours.
- Walking and talking are free. The clock never ticks in real time.
- A Break costs 1 hour and raises Sanity by 2.
- On Friday the audit takes the last 3 hours, so the Intern has 5 hours for Tasks and Breaks.
- When the hours run out, the day ends.

### Task choices

A Task's side is the Faction of whoever assigned it. Some Tasks have no side. For a Task whose side is Faction X, with rival Faction Y:

| Task choice | Hours | Performance | X goodwill | Y goodwill | Sanity |
| --- | --- | --- | --- | --- | --- |
| Do it | 3 | +1 | +1 | 0 | −1 |
| Fake it | 1 | +1 | 0 | 0 | 0 |
| Delegate it | 1 | +1 | see "Delegating" | see "Delegating" | 0 |
| Sabotage it | 2 | −1 | −2 | +1 | +1 |

- For a Task with no side, ignore both goodwill columns.
- A Paper Trail Task never raises Performance. Sabotaging one still costs Performance 1.
- Doing, faking and delegating finish the Task. What sabotage does to the Task is still open (see "Open decisions").
- All four Task choices always appear. A locked one says why.

### Delegating

- The Intern picks a Colleague. That Colleague's Faction must have goodwill of 5 or more.
- Delegating costs that Colleague's Faction 1 goodwill.

Net effects for a Launch Team Task:

| Delegate to | Unlocks at | Performance | Launch Team goodwill | Paper Trail goodwill | Other effects |
| --- | --- | --- | --- | --- | --- |
| Ryszard | Launch Team 5+ | +1 | −1 | 0 | He fakes it. Fallout arrives in 2 days. |
| Wiola | Launch Team 5+ | +1 | 0 (−1 cost, +1 done properly) | 0 | None. |
| Kamil | Paper Trail 5+ | 0 | −1 (the flip) | −1 (the cost) | The Task flips to the Paper Trail. Escalation +1. Counts as helping the Paper Trail. |

For other Task sides, Wiola gives the Task side Faction 1 goodwill, and Ryszard always causes Fallout. What Kamil does with a Paper Trail Task or a Task with no side depends on the open decision about what "helps a Faction" means.

### Fallout

- Each faked Task returns two days later as a Fallout Task with the same Task side.
- A Fallout Task takes 4 hours. Its other effects follow the "Do it" row.
- Ignoring a Fallout Task costs Performance 2 and adds 1 Escalation.
- Fallout that would arrive after Friday never arrives.
- The first Fallout can land on Wednesday, from a Task faked on Monday.
- Which Task choices a Fallout Task offers is still open (see "Open decisions").

### Neutrality

- From Tuesday, at the end of each day, each Faction the Intern did not help that day loses 1 goodwill.
- The Intern helps a Faction by doing one of its Tasks or by sabotaging one of its rival's Tasks. Whether faking or delegating also helps is still open.

### Task growth

- Each morning, 2 new Tasks arrive, plus 1 more for every 2 Tasks the Intern finished the day before.
- New Tasks never exceed the number of slots that day (see "Task slots"). Extra Tasks are dropped.
- Fallout Tasks arrive on top of the new Tasks and are not capped.
- Unhandled Tasks roll over. At the end of each day, each unhandled Task costs Performance 1.

### Escalation

Source: [The week](issues/08-the-week.md).

- Escalation is a hidden whole number. It starts at 0, and each morning adds 1, so Monday starts at 1.
- These add 1 Escalation: sabotaging any Task, any Task choice that helps the Paper Trail, and ignoring a Fallout Task.
- One Task choice adds at most 1 Escalation.

| Tier | Escalation |
| --- | --- |
| Mundane | 0 to 2 |
| Odd | 3 to 4 |
| Wrong | 5 or more |

- The tier changes the moment Escalation crosses a boundary, even mid-day. The game emits `tierChanged` when it does.
- The tier picks dialogue lines, office details, the palette and the music.
- Every run reaches Wrong by Friday morning.

## 5. The week

Source: [The week](issues/08-the-week.md).

| Day | Tier at start | What the day does |
| --- | --- | --- |
| Monday | Mundane | Dull onboarding. Ryszard teaches the Intern to fake Tasks. |
| Tuesday | Mundane | The Intern discovers the Factions. Both goodwill gauges appear. |
| Wednesday | Odd | The first truly strange Smart range complaint arrives. Monday's Fallout can land. |
| Thursday | Odd | Tuesday's Fallout lands. Both Bosses demand loyalty. |
| Friday | Wrong | Head office audits the Smart range in the last 3 hours. |

### Task slots

Each morning, take as many slots as new Tasks arrive, in this order:

| Day | Slots in order |
| --- | --- |
| Monday | Pan Zbigniew (Launch Team); anyone (no side) |
| Tuesday | Pani Halina (Paper Trail); Pan Zbigniew (Launch Team); anyone (no side) |
| Wednesday | Kamil (Paper Trail); Wiola (Launch Team); Ryszard (Launch Team) |
| Thursday | Pani Halina (Paper Trail); Pan Zbigniew (Launch Team); Kamil (Paper Trail); anyone (no side) |
| Friday | Pan Zbigniew (Launch Team); Pani Halina (Paper Trail); Wiola (Launch Team); Ryszard (Launch Team) |

### Strange Task swaps

- Tuesday, Wednesday and Thursday each have one strange Task.
- At morning assignment, if the tier is above that day's starting tier, the strange Task replaces the last slot used that day. It keeps that slot's assigner and Task side.

### The Friday audit

- An unseen Head office auditor phones in, and Pani Halina hovers nearby.
- The auditor asks one question about Smart range complaints.

| Answer | Effect |
| --- | --- |
| Bury | Launch Team goodwill +2 |
| Escalate | Paper Trail goodwill +2 |
| Deflect | Sanity −2 |

- The answer can cause a Firing.

### Firings

- A Firing happens straight after the choice that drops a Pressure to 0.
- The morning Sanity drop can also fire the Intern before the day starts.

| Pressure at 0 | Firing scene |
| --- | --- |
| Performance | Pan Zbigniew fires the Intern serenely. |
| Launch Team goodwill | Ryszard hands the Intern a template dismissal letter. |
| Paper Trail goodwill | Pani Halina files the Intern away. |
| Sanity | The Intern walks out. |

The order of end-of-day steps and which scene wins when two Pressures hit 0 together are still open.

### Surviving the week

- If the Intern is not fired by the end of Friday, one Friday-evening scene plays.
- It has three variants: Launch Team goodwill higher, Paper Trail goodwill higher, or both equal.
- The Escalation tier changes Wiola's final line.

## 6. Screen and interface

Sources: [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md) and [Crowded Task bubbles](issues/12-crowded-task-bubbles.md). The prototype is in `prototype/pressures-ui` on `main`. Run `pnpm --dir prototype/pressures-ui dev`, then open `?variant=C` or `?variant=E`.

### Task bubbles

- Each open Task is a speech bubble over its assigner's head. "Anyone" Tasks float over the Intern.
- A bubble shows the full Task text at once, wrapped at 200 pixels. It has no letter-by-letter reveal and plays no blips.
- The border shows the Task side colour from Tuesday. It is grey on Monday and for Tasks with no side.
- A Fallout bubble has a pink fill and a warning sign.
- A person with 3 or more open Tasks shows their two most urgent Tasks in full, plus a pill saying "+N more from <name>". The pill adds "⚠ N" if any hidden Task is Fallout.
- Most urgent means Fallout first, then oldest first. Use this order everywhere.
- A bubble group slides inward near a screen edge.

### The Task choice popover

- Clicking a bubble opens a popover beside the assigner, with the Task text, assigner, side and all four Task choices.
- Each Task choice shows its hours and effect chips, such as "+1 Perf". A locked one shows its reason in red.
- On Monday the chips leave out goodwill. A locked delegation says "<Colleague> doesn't trust you yet".
- "Delegate it" starts collapsed. It opens one row per Colleague, with that Colleague's effects and one line on what they will do. If all three are locked, it says "Nobody will take it".
- Hovering a Task choice previews it: striped sections on the gauges and orange hour blocks.
- Clicking an available Task choice applies it at once, with no confirmation.
- Clicking the pill opens a list of that person's Tasks. After a Task choice, the popover returns to the list, and it closes when the list is empty.
- While a popover is open, other people's bubbles fade to 35% opacity. Escape or × closes it.
- The popover opens to the right and flips left at the edge. It never covers the gauges or hour blocks, and it scrolls if too tall.

### Pressures and hours

- The Pressures are slim vertical gauges on the left edge, labelled Perf, Launch, Paper and Sanity.
- A gauge pulses at 2 or lower.
- On Monday only Perf and Sanity show. The goodwill gauges pop in on Tuesday morning.
- The Workday is 8 blocks at the bottom centre, with the hours left as a number. The Break button sits at the end.
- When no Tasks are open, a prompt at the top says "Nobody wants anything" with an "End the day" button.

### Conversations

How conversations look, start and offer choices is still open (see "Open decisions").

## 7. Look and art

Sources: [Isometric office look](issues/02-isometric-office-look.md) and [Character and art direction](issues/13-character-and-art-direction.md). The prototypes are in `prototype/office-look` on `main`. Run `pnpm --dir prototype/office-look dev`, then open `?variant=A|B|C` or `/art.html`.

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
- Each character has a gibberish blip at its own pitch, made from one sample. One blip plays per two revealed characters of conversation text.
- Use CC0 files only, such as the Kenney audio packs. Generate nothing in code.
- There is one mute button and no volume sliders.
- Use raw Web Audio in `src/audio/`. List every file in one typed manifest, and keep the files in `public/audio/`.

## 9. Save and load

Source: [Save and load](issues/15-save-and-load.md).

- Save the full `GameState` and a separate settings record, such as mute, in two `localStorage` keys.
- Autosave after every Task choice, Break and Ink choice. There is no save button.
- There is one slot. The title screen offers Continue and New game. New game asks for confirmation, then overwrites the slot.
- Take a snapshot of `GameState` at the start of each day. After a Firing scene, offer "Retry this day" or "Start over".
- A finished week removes Continue.
- The save carries a `version` number. If it differs or the JSON fails to parse, discard the save.
- Two save questions are still open: the retry loop and Ink state (see "Open decisions").

## 10. Tech plan

Sources: [Lock the tech plan](issues/09-lock-the-tech-plan.md), [Three.js stack](issues/04-threejs-stack.md) and [Branching dialogue tool](issues/03-branching-dialogue-tool.md).

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
- `GameState` holds the four Pressures, the day, the hours left, Escalation, open Tasks, pending Fallout with due days, the Factions helped today, and every story flag.
- Pure rule functions take the state and return `{ state, events }`, for example `applyTaskChoice(state, task, choice)`.
- Ink never applies a Task choice. The Task popover runs Task choices through the rule functions.

### Events

The store applies each rule result, emits its events, then autosaves when the result spent hours or ran an Ink choice. Every subscriber reacts to these events and never re-reads state each frame.

| Event | Payload | Emitted when | Used by |
| --- | --- | --- | --- |
| `dayStarted` | day | A new day begins, after the morning steps | UI, scene |
| `hoursChanged` | hours left | A Task choice or Break spends hours | UI |
| `pressureChanged` | Pressure, old value, new value | Any Pressure changes | UI, audio |
| `goodwillRevealed` | none | Tuesday morning | UI |
| `tierChanged` | tier | Escalation crosses a tier boundary | scene, audio |
| `taskAssigned` | Task | A new Task arrives | UI, audio |
| `falloutArrived` | Task | A Fallout Task arrives | UI, audio |
| `taskResolved` | Task, Task choice, Colleague if delegated | A Task choice is applied | UI, audio, scene |
| `dayEnded` | day | The end-of-day steps finish | UI, audio |
| `fired` | Pressure | A Pressure reaches 0 | UI, audio, dialogue |
| `weekSurvived` | survival variant | Friday ends without a Firing | dialogue, store |

### The Ink bridge

Ink calls only these game functions, bound as inkjs external functions:

| Kind | Functions |
| --- | --- |
| Read | `pressure(name)`, `tier()`, `flag(name)`, `day()` |
| Write | `adjust(pressure, delta)`, `set_flag(name)`, `escalate()` |

- Each write runs through the same rule functions and events as the Task popover.
- The game checks for a Firing after each Ink choice.
- Ink runs conversations, the four Firing scenes, the Friday audit and the three survival scenes.

### Content data

- Typed TypeScript files in `src/content/` hold Tasks, Task slots, strange swap Tasks, Colleagues and the office layout.
- The office layout is a hand-authored tile grid that marks walkable cells, furniture and Colleague spots.

### Code layout

| Folder | Holds |
| --- | --- |
| `src/rules/` | Pure state and rule functions. No Three.js and no DOM. |
| `src/content/` | Typed data for Tasks, slots, Colleagues and the office grid. |
| `src/store/` | The state store, its event emitter, autosave and the day-start snapshot. |
| `src/dialogue/` | The inkjs bridge. |
| `src/story/` | Ink files, with `main.ink` as the root. |
| `src/scene/` | Three.js, the camera and pathfinding. |
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
- Vitest runs the tests, including a scripted week. The scripted week's policy is still open (see "Open decisions").
- The Ink compile fails on any Ink error.
- The line ID check fails on a missing or repeated `#id:` tag.
- The file size check warns at 200 lines and fails at 300 for `.ts` and `.ink` files. Files in `src/content/` fail at 500.
- `dependency-cruiser` fails on imports that break the folder rules, skip `index.ts`, or form a cycle.
- The audio check fails if a manifest entry has no file.

### Debug panel

- A dev-only panel edits Pressures, jumps to any day and sets flags. Production builds leave it out.

## 11. Writing

Source: [Writing workflow](issues/10-writing-workflow.md).

### Who writes what

- The user writes one voice anchor scene per character and all four Firing scenes.
- Agents draft Task wording, tier lines and Colleague conversations.
- An agent drafts lines for a character only after that character's voice anchor exists. Task wording can start at once.
- The voice guide lives in `docs/writing/voice.md`. It holds the tone rules, one sheet per character and links to the voice anchors.

### Review

1. The agent checks its draft against the voice guide and fixes any mismatch.
2. The agent opens a pull request.
3. The user reads every drafted line before it merges.

### Files

- Ink files live in `src/story/`. `main.ink` pulls in the others with `INCLUDE`.
- Each character has one file, such as `src/story/halina.ink`. `firings.ink`, `audit.ink` and `survival.ink` have their own files.
- A character file over 300 lines becomes a folder with one file per day, such as `src/story/halina/day1.ink`.
- Each conversation is one knot. Tier variants branch on `tier()` beside the line they replace.
- Task wording lives in `src/locales/en/tasks.ts`, typed by Task ID. The type checker fails if a Task has no wording.

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
| Task wording for slots | 16 | Agent |
| Strange swap Tasks | 3 | Agent |
| Fallout wording | 11, one per Task that can return (Monday to Wednesday slots plus the 3 swaps) | Agent |
| Friday audit scene | 1, with 3 answers | Agent |
| Survival scenes | 3, plus a tier variant of Wiola's final line | Agent |
| Colleague conversations | Depends on the open conversation decisions | Agent |

Key Fallout wording as `<taskId>.fallout` in `src/locales/en/tasks.ts`.

## 12. Assets

Sources: [Free low-poly office assets](issues/05-free-office-assets.md) and [Isometric office look](issues/02-isometric-office-look.md).

- Use the Kenney Furniture Kit for office and bathroom furniture. Its GLB files are in `Models/GLTF format`.
- Use Kenney Mini Characters for people. Its GLB files are in `Models/GLB format` and need `Textures/colormap.png` beside them.
- Fill gaps with Quaternius Ultimate House Interior.
- All three are CC0, so no credits are required.
- Mini Characters has a `sit` clip. Clips for Task choices include `interact-left`, `interact-right`, `pick-up`, `emote-yes`, `emote-no` and the `holding-*` set.

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
| Text reveal is undefined | Task bubbles show full text at once with no blips. Blips belong to conversation text only. How conversation text reveals is part of the open conversation interface decision. | [Audio](issues/14-audio.md), [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md) |
| The package manager differs | The game uses npm. The throwaway prototypes keep pnpm. | [Lock the tech plan](issues/09-lock-the-tech-plan.md) |
| Kamil's delegation effects are scattered | The "Delegating" table gives the net effects for a Launch Team Task. | [Pressures and Task choices](issues/07-pressures-and-task-choices.md) |
| The first Fallout lands Wednesday, not Thursday | Monday fakes return on Wednesday. Thursday is when Tuesday's Faction Fallout lands. | [The week](issues/08-the-week.md) |
| The loading screen and title screen overlap | The loading screen becomes the title screen. Continue or New game unlocks audio. | [Audio](issues/14-audio.md), [Save and load](issues/15-save-and-load.md) |
| Fallout needs wording | Each Task that can return needs Fallout wording, keyed `<taskId>.fallout`. That is 11 strings. | [Writing workflow](issues/10-writing-workflow.md), [The week](issues/08-the-week.md) |
| The prototype branches were unmerged | Both prototypes are now on `main`. Only the three research branches stay unmerged. | [Isometric office look](issues/02-isometric-office-look.md), [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md) |

One gap is noted here but not fixed. Faking a Task on Thursday or Friday has no cost, because its Fallout would arrive after Friday. Treat this as an intended late-week release unless [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md) finds that it breaks the balance.

## 14. Open decisions

Each of these needs a decision before the part it covers can be built. Each one has a ticket.

| Ticket | What it decides | Blocks |
| --- | --- | --- |
| [Retry after a morning Firing](issues/17-retry-after-a-morning-firing.md) | What "Retry this day" restores when the morning Sanity drop fires the Intern, so retry cannot loop. | Save and load |
| [Ink state across saves](issues/18-ink-state-across-saves.md) | How a reload avoids applying Ink effects twice, and whether Ink's own state is saved. | Save and load, the Ink bridge |
| [What sabotage does to a Task](issues/19-what-sabotage-does-to-a-task.md) | Whether a sabotaged Task closes or rolls over. | Task choices |
| [Task choices on a Fallout Task](issues/20-task-choices-on-a-fallout-task.md) | Which Task choices a Fallout Task offers, and what "ignoring" one means and costs. | Fallout |
| [What helps a Faction](issues/21-what-helps-a-faction.md) | Whether faking or delegating counts as helping a Faction, for neutrality and Escalation. | Neutrality, Escalation, delegating to Kamil |
| [End-of-day order and Firing priority](issues/22-end-of-day-order-and-firing-priority.md) | The order of end-of-day steps, the Friday audit and survival scene order, and which Firing plays when two Pressures hit 0. | The day loop, Firings |
| [How often the Intern can talk](issues/23-how-often-the-intern-can-talk.md) | A limit on conversations, so nobody farms Pressures through Ink. | Conversations |
| [Conversation interface](issues/24-conversation-interface.md) | How conversations appear, start and offer choices, how text reveals, and whether walking matters. | Conversations, text reveal |
| [Survivability and the scripted week](issues/25-survivability-and-the-scripted-week.md) | A correct survivability check, the policy the scripted Vitest week follows, and any balance changes. | Balance, the scripted week test |

When all nine are resolved, [Fold the open decisions into the spec](issues/26-fold-the-open-decisions-into-the-spec.md) updates this file.

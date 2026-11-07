# Map: Intern game vertical slice

Label: wayfinder:map

## Destination

A spec for the vertical slice plus a locked tech plan. The slice covers one in-game week on one office floor, with one or two Bosses and two or three Colleagues. Someone can build it from the spec without asking anything.

## Notes

- Domain: a story-driven, absurd office satire game. The Intern works at a toilet equipment company and tries not to get fired. See `CONTEXT.md` for terms.
- Builders: the user and AI agents together. Write decisions sharply enough for an agent to act on.
- Purpose: a hobby or portfolio piece. There is no deadline.
- Settled during charting:
  - The game is isometric low-poly 3D with an orthographic camera, like a dollhouse cutaway. It uses Three.js.
  - The player moves by point-and-click.
  - It runs in the browser only.
  - Several visible Pressures exist. If any Pressure runs out, the Intern is fired.
  - Tasks have no minigames. Each Task is a Task choice: do it, fake it, delegate it, or sabotage it.
  - Colleagues belong to Factions. Joining one Faction angers another.
  - Escalation rises each day and rises further with the Intern's choices.
- Skills: for grilling tickets, use `grilling` and `domain-modeling`. Keep `CONTEXT.md` up to date.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->

- [Three.js stack](issues/04-threejs-stack.md): vanilla Three.js with Vite and TypeScript, HTML overlays, and grid A* pathfinding.
- [Branching dialogue tool](issues/03-branching-dialogue-tool.md): Ink through inkjs. It is TypeScript-native, MIT-licensed, and maintained. It needs a small compile step in the build.
- [Free low-poly office assets](issues/05-free-office-assets.md): the Kenney Furniture Kit for the office and bathroom, and Kenney Mini Characters for people. Both are CC0 GLB files. Quaternius Ultimate House Interior fills any gaps.
- [Company identity](issues/01-company-identity.md): Biooro, a mid-size toilet firm. Mundane tone with a sinister leak. The Intern joins Customer Complaints. The Smart range secretly harvests data, which only writers know.
- [Isometric office look](issues/02-isometric-office-look.md): a fixed true-isometric camera with clamped wheel zoom and low near-wall stubs. The Kenney kits match at native scale, and Mini Characters has a `sit` clip.
- [Cast](issues/06-cast.md): the Launch Team (Pan Zbigniew Pogodny, Ryszard Szablon, Wiola Ufna) buries Smart range complaints. The Paper Trail (Pani Halina Teczka, Kamil Przeciek) escalates them. Polish speaking names, English text.
- [Pressures and Task choices](issues/07-pressures-and-task-choices.md): four Pressures from 0 to 10 (Performance, two Faction goodwills, Sanity). An 8-hour Workday. Deterministic costs per Task choice, two-day Fallout for fakes, and a daily goodwill drain for neutrality.
- [The week](issues/08-the-week.md): five fixed day beats ending in a Friday Head office audit. Hidden Escalation with three tiers, fixed Task slots per day, four Firing scenes, and three survival variants.
- [Lock the tech plan](issues/09-lock-the-tech-plan.md): TypeScript owns one pure `GameState`. Ink reads and writes it through seven game functions. Typed events drive the scene and DOM overlays. One `npm run check` enforces file sizes, folder boundaries, and Ink line IDs.
- [Writing workflow](issues/10-writing-workflow.md): the user writes one voice anchor per character and the Firings. Agents draft the rest against `docs/writing/voice.md`, and the user reads every line. Ink lives in `src/story/` with one file per character, and translation-safe writing rules apply.
- [Pressures and Task inbox UI](issues/11-pressures-and-inbox-ui.md): Tasks are full-text speech bubbles over whoever assigned them. A popover beside them lists the four Task choices, with "Delegate it" collapsed. Pressures are slim gauges on the left, and hours are 8 blocks at the bottom.
- [Crowded Task bubbles](issues/12-crowded-task-bubbles.md): with 3 or more Tasks, a person shows their two most urgent bubbles and a "+N more" pill that opens a list. The popover flips sides at the edge and never covers the gauges or hours.
- [Character and art direction](issues/13-character-and-art-direction.md): faction-coloured vests plus one prop each (teal Launch Team, manila Paper Trail), an orange Intern with ring and marker, three rooms off one corridor with low inner walls, and a palette that greys with Escalation.
- [Audio](issues/14-audio.md): one muzak loop with three Escalation variants, a few CC0 effects, per-character gibberish blips, one mute button, and a raw Web Audio module in `src/audio/` that listens to the typed events.
- [Save and load](issues/15-save-and-load.md): one `localStorage` slot plus a settings record. It autosaves after every Task choice, Break, and Ink choice. A Firing offers "Retry this day" or "Start over". A version mismatch discards the save.
- [Assemble the spec](issues/16-assemble-the-spec.md): the draft [spec](spec.md) covers tickets 01 to 15 and resolves 12 small fixes. Nine rule and interface gaps became new tickets, and a final ticket folds them into the spec.
- [Retry after a morning Firing](issues/17-retry-after-a-morning-firing.md): retry restores the latest snapshot, taken after the morning steps. A morning Firing therefore offers "Retry yesterday", and the snapshot lives in the save record.

## Not yet specified

- Nothing. Every known gap is a ticket. The last one, [Fold the open decisions into the spec](issues/26-fold-the-open-decisions-into-the-spec.md), finishes the spec.

## Out of scope

- Anything past one in-game week. The slice stops at the end of the first week.
- Desktop builds and a commercial release.
- Building the game. The map ends at the spec and tech plan.
- A Polish translation. The slice ships in English only, with text ready for translation.
- Colleagues switching Faction. Factions stay fixed in the slice.

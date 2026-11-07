# Lock the tech plan

Type: grilling
Status: resolved
Blocked by: 02, 03, 04

## Question

What is the final tech plan? Choose the Three.js stack and the dialogue tool. Decide how game state is modelled: Pressures, Faction standing, Escalation, Tasks, and story flags. Decide how the dialogue tool and the 3D scene share that state.

The dialogue research leaves one question for this ticket. Should Ink own the Pressures, or should Ink call game functions that change them? The research recommends game functions.

## Answer

### Stack

- Use vanilla Three.js with Vite and TypeScript.
- Use `easystarjs` for grid A* pathfinding.
- Draw all UI as plain DOM overlays written in TypeScript. Use no UI library. Revisit this only if [Pressures and Task inbox UI](11-pressures-and-inbox-ui.md) shows a real need.
- Load every GLB file at boot, behind a loading screen. The slice has one floor, so streaming is not needed.
- Host on GitHub Pages. GitHub Actions builds the site and runs `npm run check` (see "Checks").

### Dialogue

- Use Ink, run in the browser by inkjs.
- Compile Ink with the bundled `inkjs/compiler` inside a small Vite plugin. No `inklecate` binary is needed.
- Write one Ink story, split into files with `INCLUDE`. Each scene is one knot.
- Ink runs conversations, the four Firing scenes, the Friday audit, and the three survival scenes.
- Ink never applies a Task choice. The HTML Task inbox runs Task choices through the TypeScript rules.

### Game state

- TypeScript owns all game state. Ink holds no Pressures and no story flags.
- The state is one plain, serialisable `GameState` object. It holds:
  - the four Pressures, as whole numbers from 0 to 10
  - the day and the Workday hours left
  - Escalation, as a hidden whole number
  - open Tasks, and pending Fallout Tasks with their due day
  - which Factions the Intern helped today
  - every story flag
- Pure rule functions change the state. Each one returns `{ state, events }`, for example `applyTaskChoice(state, task, choice)`.
- Rules use no randomness. The same input always gives the same output.
- Only Task choices and Breaks spend Workday hours. Walking and talking are free. The clock never ticks in real time.

### Events

- Rule functions return typed events, such as `pressureChanged`, `taskAssigned`, `falloutArrived`, `fired`, and `dayEnded`.
- A small state store applies each result and emits its events.
- The 3D scene and the DOM overlays subscribe to these events. Nothing re-reads state every frame.

### How Ink and the game share state

Ink calls a fixed set of game functions, bound with inkjs external functions. Nothing else crosses this bridge.

| Kind | Functions |
| --- | --- |
| Read | `pressure(name)`, `tier()`, `flag(name)`, `day()` |
| Write | `adjust(pressure, delta)`, `set_flag(name)`, `escalate()` |

- Each write goes through the same rule functions and events as the inbox.
- The game checks for a Firing after each Ink choice.

### Content data

- Typed TypeScript data files hold Tasks, Task slots, strange swap Tasks, Colleagues, and the office layout.
- The office layout is a hand-authored tile grid. It marks walkable cells, furniture, and Colleague spots. The scene and `easystarjs` both read it.

### Translation

- Every Ink line carries an `#id:` tag. A per-language string table replaces the English text by ID.
- UI text and Task wording use keyed string tables. Task wording is keyed by Task ID.
- A script adds missing `#id:` tags, so writers never type IDs by hand.
- The build fails if any Ink line lacks an ID or if two lines share one.

### Code layout

| Folder | Holds |
| --- | --- |
| `src/rules/` | Pure state and rule functions. No Three.js and no DOM. |
| `src/content/` | Typed data for Tasks, slots, Colleagues, and the office grid. |
| `src/dialogue/` | The inkjs bridge. |
| `src/scene/` | Three.js, the camera, and pathfinding. |
| `src/ui/` | DOM overlays. |
| `src/locales/` | String tables. |

- `rules/` imports only `content/`.
- Folders import each other only through their `index.ts`.
- Each `index.ts` opens with a short comment that says what the folder does.
- A root `AGENTS.md` maps each folder in one line.
- Tests sit beside the code they test, as `foo.test.ts`.
- [Writing workflow](10-writing-workflow.md) decides where the Ink files live.

### Checks

`npm run check` runs every check below. CI runs the same command. Agents run it before they call work done.

- **Biome** lints and formats. Its `noExcessiveCognitiveComplexity` rule is on, with the default threshold of 15.
- **TypeScript** type-checks the project.
- **Vitest** runs the tests. They include a scripted week where the Intern always picks "Do it", which guards the survivability check from [The week](08-the-week.md).
- **Ink compile** fails on any Ink error.
- **Line IDs** fail on missing or repeated `#id:` tags.
- **File size** is checked by a small script. A `.ts` or `.ink` file warns at 200 lines and fails at 300. Files in `src/content/` fail at 500.
- **Folder boundaries** are checked by `dependency-cruiser`. It fails on imports that break the rules above, imports that skip `index.ts`, and circular imports.

### Debug panel

- A dev-only panel can edit Pressures, jump to any day, and set flags.
- It is left out of production builds.

## Comments

- From [Cast](06-cast.md): the slice ships in English only, but all text must be ready for translation into Polish later. The tech plan must say how game text and Ink scripts support a second language.
- From [Pressures and Task choices](07-pressures-and-task-choices.md): the game state is small whole numbers, and every outcome is deterministic. The state must also track pending Fallout Tasks with their due day, and which Factions the Intern helped today.
- From [The week](08-the-week.md): model Escalation as a hidden whole number with three tiers. Model each day's Task slots as ordered data, plus one strange swap Task for Tuesday to Thursday.

# Biooro

Biooro is a story-driven office satire game for the browser. You play an intern at a toilet equipment company, and you try not to get fired.

The project is in the design stage. This repository holds the design work and two throwaway prototypes. It does not hold a playable game yet.

## What the game is about

- You join the Customer Complaints department at Biooro, a mid-size regional toilet firm.
- Bosses and colleagues hand you tasks. The more tasks you finish, the more you get.
- Two factions fight over complaints about the company's "Smart" toilet seats. Siding with one angers the other.
- The tone is mundane on the surface, with something sinister leaking through.

The first goal is a vertical slice: one in-game week, Monday to Friday, on one office floor.

## What is in this repository

| Path | What it holds |
| --- | --- |
| `CONTEXT.md` | The glossary of game terms, such as Task, Faction and Fallout. |
| `.scratch/intern-game/spec.md` | The spec for the vertical slice. |
| `.scratch/intern-game/map.md` | The map of design tickets and their status. |
| `.scratch/intern-game/issues/` | One markdown file per design ticket. |
| `.scratch/intern-game/sim/` | Python scripts that simulate a game week to test the rules. |
| `prototype/` | Throwaway Vite and Three.js prototypes. See `prototype/README.md`. |
| `docs/agents/` | Notes for AI coding agents on how this repository is organised. |

Spoiler warning: the spec and some tickets reveal story secrets.

## Run a prototype

You need Node.js and pnpm.

1. Go to a prototype folder:

   ```bash
   cd prototype/pressures-ui
   ```

2. Install the dependencies:

   ```bash
   pnpm install
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Open the address that Vite prints.

The `office-look` prototype works the same way. It serves on port 5174, and `pressures-ui` serves on port 5175.

## Credits

The 3D furniture and character models come from [Kenney](https://kenney.nl), released under the CC0 licence.

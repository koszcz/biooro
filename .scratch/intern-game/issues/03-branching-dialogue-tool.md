# Branching dialogue tool

Type: research
Status: resolved
Blocked by:

## Question

Which tool should run the branching dialogue in a browser Three.js game? Compare Ink (inkjs), Yarn Spinner (JavaScript ports), and a custom JSON format. For each one, find out:

- How the game reads and changes story state, such as Pressures, Faction standing, and Escalation.
- How well it works with TypeScript and Vite.
- How easy it is for people and AI agents to write in.
- Its licence and whether it is still maintained.

## Answer

Use Ink, run in the browser by inkjs. inkjs is written in TypeScript and ships types and ES modules, so it fits a TypeScript and Vite project. The game can read, write, and watch Ink variables, and Ink scripts can call game functions to change Pressures, Faction standing, and Escalation. Ink is plain text with a free editor and a compiler that catches errors, so people and AI agents can both write it safely. Ink and inkjs use the MIT licence and both had releases in 2026, while Yarn Spinner has no official JavaScript runtime and its ports are old or unproven. Full findings are in `research/dialogue-tool.md` on branch `research/dialogue-tool`, in the worktree at `/Users/hito/code/biooro-research-dialogue-tool`.

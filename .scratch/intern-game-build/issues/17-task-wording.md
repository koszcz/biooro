# Task wording

Status: ready-for-agent
Blocked by: 04

## What to build

Write the Task text, and give each Task its Task place. The spec says Task wording can start before the voice anchors exist.

- Wording for the 16 slot Tasks and the 3 strange swap Tasks.
- A Task place for each of them, from the seven places in the spec. Use the Intern's desk only when no place fits.
- The 11 Fallout wordings, keyed `<taskId>.fallout`.

Follow the tone in "Company and tone" and the translation-safe rules. Wording in Monday's Tasks stays dull. The strange swap Tasks show the sinister leak, but never reveal the Smart range secret.

## Acceptance criteria

- [ ] `src/locales/en/tasks.ts` has no placeholder wording left.
- [ ] The scripted-week tests still pass.
- [ ] You open a pull request, and the user reads every line before it merges.

## Spec

- [11. Writing](../../intern-game/spec.md#11-writing): "Content to write" and "Translation-safe rules".
- [2. Company and tone](../../intern-game/spec.md#2-company-and-tone).
- [6. Screen and interface](../../intern-game/spec.md#6-screen-and-interface): "How Task choices play out".

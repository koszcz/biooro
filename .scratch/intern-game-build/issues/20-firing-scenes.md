# Firing scenes

Status: resolved
Blocked by: 13

## What to do

You write the four Firing scenes in `src/story/firings.ink`, replacing the placeholder knots.

1. Pan Zbigniew fires the Intern serenely (Performance).
2. Ryszard hands the Intern a template dismissal letter (Launch Team goodwill).
3. Pani Halina files the Intern away (Paper Trail goodwill).
4. The Intern walks out (Sanity).

Run the script that adds `#id:` tags when you finish.

## Done when

- [x] All four scenes play from the debug panel and compile with `#id:` tags.

## Decisions

The user settled these on 9 November 2026.

### How the work runs

1. The agent drafts all four scenes. The user rewrites lines and approves them, as with the voice anchors.
2. The agent runs `npm run ink:ids` and `npm run check`.
3. The agent commits to `main` only after the user approves.

### Rules for every scene

- Each scene has 4 to 8 bubbles.
- Each scene has one choice near the end. It gives the Intern a last word, and both options lead to the same ending.
- No line or choice changes a Pressure.
- One or two lines per scene branch on `tier()`. No line branches on `day()` or on flags.
- Only the main person, the Intern and Head office speak.

### Pan Zbigniew (Performance)

- He never says "fired" or any negative word. He calls the Firing a "growth opportunity outside Biooro" and thanks the Intern for their "journey".
- At Wrong tier, his last line is the mission statement, word for word.
- He is the only person who fires the Intern outright.

### Ryszard (Launch Team goodwill)

- Ryszard cannot fire anyone. He reads aloud a letter he did not write, from an old template.
- He reads "Dear [EMPLOYEE NAME]" as written. He does not swap in a name.
- At Odd tier, he notices the letter has no blank to fill.
- At Wrong tier, the letter is already dated today and signed. He does not remember printing it.

### Pani Halina (Paper Trail goodwill)

- Pani Halina is not the Intern's Boss. She does not fire the Intern. She documents them out, and the file decides.
- She dictates the Intern's last entry in passive voice, with dates and a reference number.
- At Wrong tier, she reads what the file says about the Intern. It sounds as if the file knew before she did.
- Her last action is closing the folder.

### The Intern (Sanity)

- The Intern walks out. The game still calls this a Firing, and the title card stays "Fired · Sanity hit 0".
- The scene has three or four short, deadpan Intern lines, such as "I'm going to get a coffee." and "From a different building."
- The choice is between two exit lines.
- Head office closes the scene with one calm, automated notice, such as "Access card deactivated."

### The last-word choices

- In the Pan Zbigniew, Ryszard and Pani Halina scenes, one option complies politely and the other is flat and dry.
- Neither option is defiant or heroic.

## Spec

- [5. The week](../../intern-game/spec.md#5-the-week): "Firings".
- [11. Writing](../../intern-game/spec.md#11-writing): "Who writes what".

## Comments

- 2026-11-09, agent: I drafted all four scenes in `src/story/firings.ink`, and the user approved them. `src/dialogue/firingScenes.test.ts` plays both choices of each scene at every tier through the bridge. It checks that every line has an `#id:` tag and that no Pressure changes. The Performance Firing played in the browser. The other three played only in the test.
- 2026-11-09, agent: At Odd and Wrong tier, Ryszard's letter reads "Dear Intern" instead of "Dear [EMPLOYEE NAME]", so he can notice that it has no blank. The user approved this.

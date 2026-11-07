# Writing workflow

Type: grilling
Status: resolved
Blocked by: 03

## Question

Who writes the dialogue, and how? Decide what the user writes, what AI agents draft, how drafts are reviewed for tone, and where the script files live.

## Answer

### Who writes what

- The user writes one voice anchor scene for each character. A voice anchor is a short sample scene that sets how that character sounds.
- The user writes all four Firing scenes.
- AI agents draft everything else: Task wording, Escalation tier lines, and Colleague conversations.
- An agent must not draft lines for a character until that character's voice anchor exists.
- Agents may draft Task wording right away, because it follows only the tone rules.

### Voice guide

The voice guide lives in `docs/writing/voice.md`. It holds:

- the tone rules, starting with "mundane surface, sinister leak"
- one sheet per character, covering speech habits, wants, and banned words
- a link to each character's voice anchor scene

### Review

1. The agent checks its draft against the voice guide and fixes any mismatch.
2. The agent opens a pull request.
3. The user reads every drafted line in the pull request before it merges.

### Where the Ink files live

- All Ink files live in `src/story/`. The root file is `src/story/main.ink`, which pulls in the others with `INCLUDE`.
- Each character has one file, for example `src/story/halina.ink`.
- These scenes have their own files: `firings.ink`, `audit.ink`, and `survival.ink`.
- When a character's file passes the 300-line cap, it becomes a folder with one file per day, for example `src/story/halina/day1.ink`.

### Escalation tier lines

- Each conversation is one knot.
- Tier variants sit inside that knot and branch on `tier()`. Each variant stays next to the line it replaces.

### Task wording

- Task wording lives in a TypeScript string table typed by Task ID, at `src/locales/en/tasks.ts`.
- The type checker fails if a Task has no wording.

### Rules for translation-safe writing

Every writer, human or agent, follows these rules:

- Never build a sentence from fragments in code. Each sentence is one whole string.
- Never write grammar that depends on a variable, such as "1 complaint" against "2 complaints".
- Puns are allowed. Each pun carries a `#note:` tag that explains it for translators.
- Polish names are never translated.

## Comments

- From [Cast](06-cast.md): the slice ships in English only, but all text must be ready for translation into Polish later. Decide here how scripts keep text translatable.
- From [The week](08-the-week.md): the slice needs Task wording for 16 slots and 3 strange swap Tasks, four Firing scenes, the Friday audit, three survival variants, and dialogue lines for each Escalation tier.
- From [Lock the tech plan](09-lock-the-tech-plan.md): every Ink line carries an `#id:` tag, added by a script. Task wording lives in string tables keyed by Task ID, not in Ink. Ink files are capped at 300 lines, so split scenes across files with `INCLUDE`. Decide here where the Ink files live.

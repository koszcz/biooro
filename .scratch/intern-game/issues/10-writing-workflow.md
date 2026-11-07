# Writing workflow

Type: grilling
Status: open
Blocked by: 03

## Question

Who writes the dialogue, and how? Decide what the user writes, what AI agents draft, how drafts are reviewed for tone, and where the script files live.

## Comments

- From [Cast](06-cast.md): the slice ships in English only, but all text must be ready for translation into Polish later. Decide here how scripts keep text translatable.
- From [The week](08-the-week.md): the slice needs Task wording for 16 slots and 3 strange swap Tasks, four Firing scenes, the Friday audit, three survival variants, and dialogue lines for each Escalation tier.
- From [Lock the tech plan](09-lock-the-tech-plan.md): every Ink line carries an `#id:` tag, added by a script. Task wording lives in string tables keyed by Task ID, not in Ink. Ink files are capped at 300 lines, so split scenes across files with `INCLUDE`. Decide here where the Ink files live.

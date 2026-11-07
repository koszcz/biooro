# Save and load

Type: grilling
Status: resolved
Blocked by:

## Question

How does the slice save and load progress? Decide:
- What persists: the full `GameState` only, or also settings such as mute.
- Where it persists: browser `localStorage` or another store. The game is browser-only.
- When it saves: autosave at each Workday boundary, after every Task choice, or on demand.
- How many slots: one slot or several. Say whether a new game overwrites the slot.
- What happens on a Firing: keep a save, restart the week, or offer a retry from the start of that day.
- How it fits the pure `GameState` and the typed events from the tech plan, including save versioning if the state shape changes.

## Answer

### What persists

- The full `GameState`.
- A separate settings record, such as mute. Settings survive a new game.

### Where

- Browser `localStorage`, with two keys: one for the save and one for settings.

### When it saves

- The game autosaves after every Task choice, every Break, and every Ink choice.
- There is no save button.
- Walking and talking are free, so they cause no save.
- The game does not save the position inside a conversation. A reload replays that conversation from its start.

### Slots

- One slot.
- The title screen offers Continue and New game.
- New game asks for confirmation, then overwrites the slot.

### After a Firing

- The game takes a snapshot of `GameState` at the start of each day.
- After the Firing scene, the player picks "Retry this day" (restores the snapshot) or "Start over".
- A finished week removes the Continue entry.

### Versioning

- The save carries a `version` number.
- If the version differs or the JSON fails to parse, the game discards the save and shows only New game.
- There are no migrations. The slice is one week long.

### Fit with the tech plan

- `GameState` is already plain and serialisable, so a save is `JSON.stringify` of it. No new state is needed.
- The state store saves after it applies a rule result that spent hours or ran an Ink choice. Save code lives in the store's folder boundary, not in `src/rules/`.

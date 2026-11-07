# Save and load

Type: grilling
Status: open
Blocked by:

## Question

How does the slice save and load progress? Decide:
- What persists: the full `GameState` only, or also settings such as mute.
- Where it persists: browser `localStorage` or another store. The game is browser-only.
- When it saves: autosave at each Workday boundary, after every Task choice, or on demand.
- How many slots: one slot or several. Say whether a new game overwrites the slot.
- What happens on a Firing: keep a save, restart the week, or offer a retry from the start of that day.
- How it fits the pure `GameState` and the typed events from the tech plan, including save versioning if the state shape changes.

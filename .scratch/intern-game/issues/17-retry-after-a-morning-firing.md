# Retry after a morning Firing

Type: grilling
Status: resolved
Blocked by:

## Question

What does "Retry this day" restore when the morning Sanity drop fires the Intern?

The game snapshots `GameState` at the start of each day. The morning Sanity drop runs before the day starts and can fire the Intern. If the snapshot is taken before the drop, a retry replays the same drop and fires the Intern again. Retry then loops forever.

Decide one of these, or something better:

- Retry restores the previous day's snapshot instead.
- The snapshot is taken after the drop, and a morning Firing offers only "Start over".
- The morning drop cannot take Sanity below 1.

Also say when exactly the snapshot is taken relative to the other morning steps: the Sanity drop, Escalation, Task arrival and Fallout arrival.

Sources: [Save and load](15-save-and-load.md), [The week](08-the-week.md).

## Answer

Retry always restores the latest day-start snapshot. A morning Firing happens before that day's snapshot exists, so its retry restores the previous day. Retry cannot loop.

### When the snapshot is taken

- The game takes the snapshot after all morning steps, at the moment `dayStarted` fires.
- The morning steps are Escalation, the Sanity drop, Fallout arrival, and new Tasks. Their exact order belongs to [End-of-day order and Firing priority](22-end-of-day-order-and-firing-priority.md).
- The game keeps only one snapshot. Each new snapshot replaces the last one.
- Retry lands on a playable day. The morning steps do not run again.

### What retry restores

- After a Firing during the day, "Retry this day" restores that day's snapshot.
- After a morning Firing, the button reads "Retry yesterday" and restores the previous day's snapshot. The player replays that whole day and can, for example, take a Break to keep Sanity up.
- Monday has no morning Sanity drop, so the earliest morning Firing is on Tuesday. Its retry restores Monday's snapshot.
- "Start over" is offered after every Firing, as before.

### Where the snapshot lives

- The save record holds the snapshot next to `GameState`, in the same `localStorage` key. The save `version` covers both.
- If the player closes the tab on the Firing screen, Continue reopens the choice between retry and "Start over".

### Rejected options

- Offering only "Start over" after a morning Firing. It throws away the whole week for a mistake made the day before.
- Stopping the morning drop at Sanity 1. It removes a Firing that [The week](08-the-week.md) already promises.

### Open risk

- Replaying yesterday may not always be survivable. [Survivability and the scripted week](25-survivability-and-the-scripted-week.md) should check this.

# Retry after a morning Firing

Type: grilling
Status: open
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

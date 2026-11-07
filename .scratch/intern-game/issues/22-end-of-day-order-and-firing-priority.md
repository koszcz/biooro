# End-of-day order and Firing priority

Type: grilling
Status: resolved
Blocked by:

## Question

In what order do the end-of-day and morning steps run, and which Firing scene plays when two Pressures reach 0 at once?

Decide:

- The order of the end-of-day steps: the unhandled-Task penalty, the ignored-Fallout penalty, the neutrality drain, and the Firing check.
- Whether the Firing check runs after each step or once at the end.
- The order of the morning steps: Escalation, the Sanity drop, Fallout arrival, new Tasks, strange swaps, and `goodwillRevealed` on Tuesday.
- On Friday, where the audit and the survival scene sit relative to the end-of-day steps. For example, can the neutrality drain fire the Intern after a survived audit?
- Which Firing scene plays when two or more Pressures reach 0 in the same step.

Write the answer as two numbered lists, one for morning and one for end of day.

Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [The week](08-the-week.md).

## Comments

- From [Task choices on a Fallout Task](20-task-choices-on-a-fallout-task.md): an ignored Fallout Task costs Performance 2 and Escalation 1, then expires. It does not also pay the unhandled-Task cost. Place the expiry step in the end-of-day order.

## Answer

The end-of-day steps run in a fixed order, and the Firing check runs once at the end. When several Pressures reach 0 together, a fixed priority picks the Firing scene. On Friday, the end-of-day steps run before the audit, so the audit is always the last thing that can fire the Intern.

### Morning

1. The day number goes up by 1.
2. Escalation goes up by 1. If it crosses a tier boundary, `tierChanged` fires.
3. From Tuesday, Sanity drops by 1.
4. The Firing check runs. If a Pressure is at 0, the Firing scene plays and the morning stops here. The player gets "Retry yesterday" (see [Retry after a morning Firing](17-retry-after-a-morning-firing.md)).
5. On Tuesday only, `goodwillRevealed` fires.
6. Fallout Tasks due today arrive. Each one fires `falloutArrived`.
7. New Tasks arrive from today's Task slots. The strange Task swap uses the tier from step 2. Each Task fires `taskAssigned`.
8. The game takes the day-start snapshot and autosaves.
9. `dayStarted` fires.

Escalation must come before step 7, because the strange Task swap reads the tier. The Firing check comes before any Task arrives, so no Task appears on screen only to be wiped by a Firing.

### End of day

1. Each ignored Fallout Task costs Performance 2, adds 1 Escalation, and expires.
2. Each other unhandled Task costs Performance 1 and rolls over.
3. From Tuesday, each Faction the Intern did not help today loses 1 goodwill.
4. The Firing check runs once. If any Pressure is at 0, the Firing scene plays. The player gets "Retry this day", which restores today's snapshot.
5. `dayEnded` fires.

Every end-of-day step only lowers Pressures, and each Pressure stops at 0. With one Firing check at the end, the order of steps 1 to 3 therefore never changes the result. The order is fixed anyway, so the rule code and tests are simple to follow.

The rule "a Firing happens straight after the choice that drops a Pressure to 0" still applies during the day. The end-of-day steps are not choices, so they share one check.

### Friday

On Friday the order is:

1. The 5 Task hours end, or the Intern goes home early.
2. The end-of-day steps 1 to 3 run.
3. The Firing check runs.
4. The Friday audit runs. The audit answer applies its effect.
5. The Firing check runs again.
6. If the Intern is not fired, `dayEnded` fires, then `weekSurvived`, and the survival scene plays.

So:

- The neutrality drain cannot fire the Intern after a survived audit.
- The audit answer never counts as helping a Faction, because the drain has already run.
- The player sees the final Pressures before choosing the audit answer.
- A Firing at step 3 or step 5 offers "Retry this day", which restores Friday's snapshot.

### Firing priority

When two or more Pressures reach 0 in the same step, the first one in this list picks the Firing scene:

1. Performance: Pan Zbigniew fires the Intern serenely.
2. Launch Team goodwill: Ryszard hands over a template dismissal letter.
3. Paper Trail goodwill: Pani Halina files the Intern away.
4. Sanity: the Intern walks out.

The Boss outranks everyone. This also covers the daytime case, such as one sabotage dropping both Performance and a goodwill to 0. The `fired` event carries only the winning Pressure.

### Going home early

- A "Go home" button is always on screen during the Workday.
- If open Tasks remain, the game asks for confirmation first. If none remain, the day ends at once.
- Going home loses the leftover hours. It then runs the end-of-day steps.
- On Friday, going home skips the rest of the Task hours and goes straight to the end-of-day steps. The audit still runs.
- A Task choice or Break that costs more hours than are left is locked. The game shows the reason: "Not enough hours left today."

This stops a player with no Tasks left from turning leftover hours into Breaks for free Sanity.

### Rejected options

- **A Firing check after each end-of-day step.** The step order would then decide which scene plays. That adds a rule with no benefit.
- **The audit before the end-of-day steps on Friday.** The neutrality drain could then fire the Intern after a survived audit, which feels unfair. The audit answer would also need its own neutrality rule.
- **No "Go home" button.** Leftover hours would turn into free Sanity through Breaks.

Glossary terms updated in `CONTEXT.md`: Workday (it ends when the hours run out or when the Intern goes home).

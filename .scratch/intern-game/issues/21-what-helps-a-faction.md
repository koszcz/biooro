# What helps a Faction

Type: grilling
Status: resolved
Blocked by:

## Question

Which Task choices count as helping a Faction?

Two rules depend on this:

- **Neutrality:** each Faction the Intern did not help today loses 1 goodwill at the end of the day.
- **Escalation:** any Task choice that helps the Paper Trail adds 1 Escalation.

Today, helping means doing one of the Faction's Tasks or sabotaging one of its rival's Tasks. Decide, for each Task choice and each delegation target, whether it helps the Task side Faction, its rival, or nobody:

- Faking a Faction's Task.
- Delegating it to Ryszard, Wiola or Kamil.
- Delegating a Paper Trail Task or a Task with no side to Kamil.
- Handling a Fallout Task.

Write the answer as one table that the rule code can follow directly.

Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [The week](08-the-week.md).

## Answer

A Task choice helps whichever Faction the real work ends up serving. Faked work helps nobody. Delegation never helps the Colleague's own Faction just because they took the Task.

### The help table

The Task side is X and its rival is Y. "Helps" feeds two rules: the end-of-day neutrality cost, and Escalation +1 for any Task choice that helps the Paper Trail.

| Task choice | Task side X | Task with no side |
| --- | --- | --- |
| Do it | Helps X | Helps nobody |
| Fake it | Helps nobody | Helps nobody |
| Sabotage it | Helps Y | Helps nobody |
| Delegate to Ryszard (he fakes it) | Helps nobody | Helps nobody |
| Delegate to Wiola (she does it properly) | Helps X | Helps nobody |
| Delegate to Kamil, Launch Team Task | Helps the Paper Trail (the Task flips) | Not applicable |
| Delegate to Kamil, Paper Trail Task | Helps the Paper Trail | Not applicable |
| Delegate to Kamil, Task with no side | Not applicable | Helps the Paper Trail (the Task flips) |

### Kamil Przeciek's two new cases

- **A Paper Trail Task:** Kamil does it properly. Performance does not change, because Paper Trail Tasks never raise it. Paper Trail goodwill nets 0: −1 for the delegation cost and +1 for doing it. Escalation rises by 1 because the choice helps the Paper Trail.
- **A Task with no side:** the Task flips to the Paper Trail. Performance does not change. Paper Trail goodwill drops by 1, the delegation cost. Launch Team goodwill does not change, because nobody owned the Task. Escalation rises by 1 because the choice helps the Paper Trail.

### Fallout Tasks

A Fallout Task uses the same table as a normal Task with the same Task side:

- Doing it helps the Task side.
- Sabotaging it helps the rival.
- Delegating it to Wiola or Kamil follows the table. Ryszard is already locked for Fallout Tasks.
- An ignored Fallout Task expires and helps nobody.

Faking still pays off the help later, when the Intern deals with the Fallout Task two days on.

### Escalation

- Sabotage already adds 1 Escalation. Sabotaging a Launch Team Task also helps the Paper Trail, but one Task choice adds at most 1 Escalation. The total is still 1.
- Doing a Paper Trail Task adds 1 Escalation.

### Rejected options

- **Faking helps the Task side.** The Intern could then stay neutral for 2 hours a day by faking one Task for each side.
- **Delegation helps the Colleague's Faction.** The Colleague's Faction pays the delegation cost, so counting it as help would contradict that cost.
- **Kamil is locked for Paper Trail Tasks.** He would lose his most in-character job.
- **Kamil quietly does a Task with no side.** This breaks his rule of escalating everything he touches.

Glossary term added to `CONTEXT.md`: Helps (new).


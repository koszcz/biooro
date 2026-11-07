# Pressures and Task choices

Type: grilling
Status: resolved
Blocked by:

## Question

How does the core loop work? Decide which Pressures exist and what makes each one rise or fall. Decide what each Task choice (do it, fake it, delegate it, sabotage it) costs and gains. Decide how the number of Tasks grows as the Intern finishes more of them.

## Answer

### Pressures

The Intern has four Pressures:

- **Performance**: how Pan Zbigniew rates the Intern's output.
- **Launch Team goodwill**: how the Launch Team feels about the Intern.
- **Paper Trail goodwill**: how the Paper Trail feels about the Intern.
- **Sanity**: how much more of Biooro the Intern can take.

Rules for all four:

- Each Pressure is a whole number from 0 to 10. Each one starts at 6 and cannot go above 10.
- If any Pressure reaches 0, the Intern is fired.
- All outcomes are deterministic. The same choice in the same state always gives the same result. There are no dice.
- Both goodwill Pressures appear on screen on Day 2, when the Intern discovers the Factions. On Day 1 they still change, but the player cannot see them.
- Sanity drops by 1 every morning.

### The Workday

- Each day has an 8-hour Workday. Each Task choice spends hours from it.
- Conversations with Colleagues cost no hours.
- A Break costs 1 hour and raises Sanity by 2.
- When the Workday runs out, the day ends.

### Task side

- Each Task serves the Faction of whoever assigned it. This is its Task side. A Boss or a Colleague can assign a Task.
- Some Tasks have no side, such as fixing the printer.
- Tasks with a Paper Trail side never raise Performance, because Pan Zbigniew leads the Launch Team.

### Task choices

All four Task choices always appear. If one is locked, the game says why.

For a Task whose side is Faction X, with rival Faction Y:

| Task choice | Hours | Performance | X goodwill | Y goodwill | Sanity |
| --- | --- | --- | --- | --- | --- |
| Do it | 3 | +1 | +1 | 0 | −1 |
| Fake it | 1 | +1 | 0 | 0 | 0 |
| Delegate it | 1 | +1 | see "Delegating" | see "Delegating" | 0 |
| Sabotage it | 2 | −1 | −2 | +1 | +1 |

- For a Task with no side, ignore both goodwill columns.
- For a Paper Trail Task, Performance does not rise from doing, faking, or delegating. Sabotaging it still costs Performance 1.
- Doing, faking, and delegating finish the Task. Sabotage does not.

### Fallout

- Each faked Task returns two days later as a Fallout Task with the same Task side.
- A Fallout Task takes 4 hours. Its other effects follow the "Do it" row.
- If the Intern ignores a Fallout Task, Performance drops by 2.
- A Fallout Task that would arrive after Day 5 never arrives.

### Delegating

- The Intern picks a Colleague. Delegating unlocks only when that Colleague's Faction has goodwill of 5 or more.
- Delegating costs that Colleague's Faction 1 goodwill, because nobody likes extra work.
- Each Colleague handles a delegated Task in character:
  - **Ryszard Szablon** fakes it. The Intern still gets the Fallout Task.
  - **Wiola Ufna** does it properly. The Task side Faction gains 1 goodwill.
  - **Kamil Przeciek** escalates it. A Launch Team Task flips to the Paper Trail. Performance stays the same, Launch Team goodwill drops by 1, and the Task counts as helping the Paper Trail.

### Neutrality

- From Day 2, at the end of each day, each Faction the Intern did not help that day loses 1 goodwill.
- The Intern helps a Faction by doing one of its Tasks or by sabotaging one of its rival's Tasks.
- The Intern can help both Factions in one day, but it costs hours.

### Task growth

- Each morning, the Bosses and Colleagues assign 2 new Tasks, plus 1 more for every 2 Tasks the Intern finished the day before. For example, finishing 5 Tasks brings 4 new Tasks the next morning.
- Escalation changes how strange Tasks are, not how many arrive.
- Unhandled Tasks roll over to the next day. At the end of each day, each unhandled Task costs Performance 1.

Glossary terms added to `CONTEXT.md`: Performance, Goodwill, Sanity, Workday, Task side, Fallout, Break. The Pressure, Task, and Task choice definitions were updated to match.

## Comments

- From [Cast](06-cast.md): the Intern can stay neutral between the Launch Team and the Paper Trail, but neutrality must drain goodwill from both Factions. Decide that cost here.
- From [The week](08-the-week.md): Sanity does not drop on Monday morning. The first morning drop is on Tuesday.

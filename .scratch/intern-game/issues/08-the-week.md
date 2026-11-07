# The week

Type: grilling
Status: resolved
Blocked by: 01, 06, 07

## Question

What happens from Monday to Friday? Decide the story beats for each day, how much Escalation each day brings, and which choices push Escalation further. Decide how the slice can end: each kind of Firing, and surviving the week.

## Answer

### Story beats

| Day | Escalation tier at start | What the day does |
| --- | --- | --- |
| Monday | Mundane | Dull onboarding. Ryszard Szablon teaches the Intern how to fake Tasks. |
| Tuesday | Mundane | The Intern discovers the Factions through Tasks. Both goodwill Pressures appear on screen. |
| Wednesday | Odd | The first truly strange Smart range complaint arrives. |
| Thursday | Odd | Fallout from Tuesday lands. Both Bosses demand loyalty. |
| Friday | Wrong | Head office audits the Smart range in the afternoon. |

### Escalation

- Escalation is a hidden whole number. The player never sees it.
- It starts at 0. Each morning adds 1, so Monday starts at 1.
- These Task choices add 1 Escalation:
  - Sabotaging any Task.
  - Any Task choice that helps the Paper Trail, including delegating to Kamil Przeciek.
- One Task choice adds at most 1 Escalation. Sabotaging a Launch Team Task adds 1, not 2.
- Ignoring a Fallout Task adds 1 Escalation.

### Escalation tiers

| Tier | Escalation |
| --- | --- |
| Mundane | 0 to 2 |
| Odd | 3 to 4 |
| Wrong | 5 or more |

- The tier picks dialogue lines and small changes to the office.
- Tasks have no per-tier variants. Instead, the tier can swap in a strange Task (see "Strange Task swaps").
- Every run reaches Wrong on Friday. The Intern's choices only make it arrive sooner.

### Task slots

Each morning, the game counts how many new Tasks arrive (Ticket 07's growth rule). It then takes that many slots from the day's list, in order. The spec fixes who assigns each slot and its Task side. Task wording comes from the writing workflow.

| Day | Slots in order |
| --- | --- |
| Monday | Pan Zbigniew (Launch Team); anyone (no side) |
| Tuesday | Pani Halina (Paper Trail); Pan Zbigniew (Launch Team); anyone (no side) |
| Wednesday | Kamil (Paper Trail); Wiola (Launch Team); Ryszard (Launch Team) |
| Thursday | Pani Halina (Paper Trail); Pan Zbigniew (Launch Team); Kamil (Paper Trail); anyone (no side) |
| Friday | Pan Zbigniew (Launch Team); Pani Halina (Paper Trail); Wiola (Launch Team); Ryszard (Launch Team) |

- At most 2, 3, 3, 4, and 4 new Tasks can arrive from Monday to Friday. The lists match those limits.
- Monday Tasks have no side or come from Pan Zbigniew, so the Factions stay hidden.
- Fallout Tasks arrive on top of these slots.

### Strange Task swaps

- Tuesday, Wednesday, and Thursday each have one strange Task.
- At morning assignment, if the tier is above that day's starting tier, the strange Task replaces the last slot used that day. It keeps that slot's assigner and Task side.
- Monday has no swap, because Escalation is always 1 on Monday morning.
- Friday has no swap, because its starting tier is already Wrong.
- That is three extra Tasks to write.

### Sanity on Monday

- Sanity does not drop on Monday morning. The first morning drop is on Tuesday.
- This amends Ticket 07's "Sanity drops by 1 every morning" rule.

### The Friday audit

- The audit takes the last 3 hours of Friday's Workday.
- An unseen Head office auditor phones in. Pani Halina hovers nearby.
- The auditor asks one question about Smart range complaints. The Intern has three answers:

| Answer | Effect |
| --- | --- |
| Bury | Launch Team goodwill +2 |
| Escalate | Paper Trail goodwill +2 |
| Deflect | Sanity −2 |

- The audit answer can cause a Firing. For example, deflecting at Sanity 2 fires the Intern.

### Firings

- A Firing happens immediately after the choice that drops a Pressure to 0.
- The Tuesday-onward morning Sanity drop can also cause a Firing. That Firing plays before the day starts.
- Each Pressure has its own Firing scene:

| Pressure at 0 | Firing scene |
| --- | --- |
| Performance | Pan Zbigniew fires the Intern serenely. |
| Launch Team goodwill | Ryszard Szablon hands the Intern a template dismissal letter. |
| Paper Trail goodwill | Pani Halina files the Intern away. |
| Sanity | The Intern walks out. |

### Surviving the week

- If the Intern is not fired by the end of Friday, the slice ends with one Friday-evening scene.
- The scene has three variants, chosen by goodwill:
  - Launch Team goodwill is higher.
  - Paper Trail goodwill is higher.
  - Both goodwills are equal.
- Escalation tier changes Wiola Ufna's final line.

### Survivability check

- With Ticket 07's numbers, the week is survivable.
- A player who always picks "Do it" loses about 1 Sanity per day. That player ends Friday near Sanity 1 without many Breaks. The week is tight, not broken.
- Fallout is the main source of pressure on Thursday and Friday.

Glossary terms updated in `CONTEXT.md`: Firing (one per Pressure) and Escalation (hidden from the player).

## Comments

- From [Pressures and Task choices](07-pressures-and-task-choices.md): Task counts and Pressure costs are fixed. Check that the week is survivable with them, and decide which Tasks each day brings. Fallout that would arrive after Day 5 never arrives.

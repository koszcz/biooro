# Survivability and the scripted week

Type: grilling
Status: resolved
Blocked by: 19, 20, 21, 22

## Question

Is the week survivable with the final rules, and what policy does the scripted Vitest week follow?

The survivability check in [The week](08-the-week.md) is wrong:

- A player who always picks "Do it" and takes no Breaks goes from Sanity 6 to 4 on Monday, to 1 on Tuesday, and to 0 on Wednesday morning.
- With Breaks, Sanity is easy to hold. The real squeeze is Performance. "Do it" takes 3 hours, so only 2 fit in a day, while 3 or 4 Tasks arrive. The unhandled Tasks cost Performance every night.
- A hand-run of "Do it, then Breaks with leftover hours" ends Friday at about Performance 1.

Do this:

1. Hand-run or script the week with the rules from the blocking tickets.
2. Check at least three policies: always do it, always fake it, and a mixed policy.
3. Decide whether to change any number, such as hours, costs or starting Pressures, so the week is tight but survivable.
4. Decide whether faking on Thursday and Friday, which has no Fallout cost, breaks the balance.
5. Define the scripted Vitest week exactly: which Task it handles first, which Task choice it picks, when it takes Breaks, and which Pressures it must end above.
6. Check that "Retry yesterday" can always save the run. After a morning Firing, the player replays the previous day from its snapshot. Confirm that some sequence of Task choices and Breaks on that day keeps Sanity above 0 the next morning. See [Retry after a morning Firing](17-retry-after-a-morning-firing.md).

Sources: [The week](08-the-week.md), [Pressures and Task choices](07-pressures-and-task-choices.md), [Lock the tech plan](09-lock-the-tech-plan.md), [Retry after a morning Firing](17-retry-after-a-morning-firing.md).

## Answer

The user accepted every recommendation. The week is tight but survivable. One number changes: an ignored Fallout Task now costs Performance 3, not 2. Without that change, a player who fakes everything survives the week. The simulator is [sim/week_sim.py](../sim/week_sim.py), and the retry check is [sim/retry_check.py](../sim/retry_check.py).

### Policies checked

All runs use the rules from tickets 07, 08 and 17 to 23, with the new Performance 3 cost for ignored Fallout. They hold no Conversations and never delegate. The audit answer lifts the lower goodwill.

| Policy | Result | Why |
| --- | --- | --- |
| Always "Do it", no Breaks | Fired on Wednesday morning (Sanity) | Each "Do it" costs Sanity 1, and nothing restores it. |
| Always "Do it", Breaks with leftover hours | Survives at Performance 1 | Only 2 Tasks fit in a day, so unhandled Tasks pile up. Friday costs Performance 5. |
| Fake first: fake every Task, then do Fallout with leftover hours, then Breaks | Fired on Friday night (Performance) | Ignored Fallout costs Performance 3 each. Escalation reaches 12. |
| Fallout first: do Fallout, then fake every Task, then Breaks | Fired on Thursday night (Performance) | Fallout fills the Workday. New Tasks go unhandled. |
| Mixed (defined below) | Survives at Performance 6, Launch Team 9, Paper Trail 8, Sanity 1 | It helps both Factions each day and fakes the rest. Late fakes are free. |

With the maximum Conversation gain of 3 points a day, every policy that does real work survives easily. The Conversation rule below keeps that gain small.

### The Fallout cost change

An ignored Fallout Task now costs Performance 3 and adds 1 Escalation. It still expires. This replaces the Performance 2 from [Task choices on a Fallout Task](20-task-choices-on-a-fallout-task.md).

- With Performance 2, the fake-first policy survived at Performance 3. Pure faking then beat honest work, which ends at Performance 1.
- With Performance 3, the fake-first policy is fired on Friday night. The mixed policy and both "Do it" policies give the same results as before, because they ignore no Fallout.
- Ticket 20 rejected Performance 3 as charging twice for one mistake. The user chose it anyway: faking is now a loan, and ignoring the repayment must hurt more than it gained.

Changes tried and rejected:

- **9-hour Workday.** It makes the week harder. More finished Tasks bring more new Tasks the next morning.
- **Starting Pressures at 7.** The naive policies still die. Sensible play gets slack it does not need.
- **"Do it" costs 2 hours.** It does not change the "Do it" policies' fate.
- **Fallout returns after one day, not two.** It fires the fake-first policy, but it also fires the mixed policy on Friday morning.
- **Faking costs 2 hours.** It fires the fake-first policy, but it drops the mixed policy to Performance 2.

### Late-week faking

Faking on Thursday and Friday stays free, because its Fallout would arrive after Friday. Treat it as an intended late-week release. It does not break the balance: a player who fakes early still pays on Wednesday and Thursday, and both fake policies are still fired.

### Conversations

Conversations stay capped as in [How often the Intern can talk](23-how-often-the-intern-can-talk.md). Add this rule to the writing rules: across one Colleague's Conversations in the week, the choices that raise a Pressure and the choices that lower one roughly balance. Talking shifts Pressures between goodwills and Sanity. It does not feed them for free.

### Retry yesterday

No trap was found. With the final rules, the retry check played 60,000 random weeks. It hit about 950 morning Firings. For each one, a full search of the previous day from its snapshot found a line of play that survives the next morning. This is evidence, not proof: random play may miss rare states.

### The scripted Vitest week

The test suite holds three scripted weeks. Each one holds no Conversations, never delegates, and never sabotages.

**1. The mixed week (survives).** Each day, the policy repeats these steps until it goes home:

1. If an open Fallout Task exists and "Do it" fits in the hours left, do the oldest one.
2. Otherwise, for each Faction not yet helped today, do its oldest open Task that is not Fallout, if "Do it" fits. Check the Factions in the order the Tasks appear in the open list.
3. Otherwise, fake the oldest open Task that can be faked, if 1 hour is left.
4. Otherwise, take a Break if an hour is left and Sanity is below 10.
5. Otherwise, go home.

Before any "Do it" at Sanity 1, take a Break first. "Oldest" means the order in the open list: rolled-over Tasks first, then Fallout in arrival order, then new Tasks in slot order. At the Friday audit, the policy answers "Bury" if Launch Team goodwill is lower or equal, and "Escalate" otherwise.

The test asserts the exact end state after the audit: survived, Performance 6, Launch Team goodwill 9, Paper Trail goodwill 8, Sanity 1, Escalation 7. Any rule change that moves these numbers fails the test on purpose. Rerun the simulator and update the numbers only when the change is intended.

**2. Always "Do it", no Breaks.** It handles the oldest Task first, does each one that fits, and then goes home. The test asserts a Sanity Firing on Wednesday morning, with the "Retry yesterday" option.

**3. Fake first, with Breaks.** It fakes the oldest Task that can be faked while 1 hour is left. Then it does the oldest Fallout Task that fits. Then it takes Breaks below Sanity 10, then goes home. The test asserts a Performance Firing on Friday night. This week guards the Fallout cost change.

### Rejected options

- **Keep ignored Fallout at Performance 2.** Faking everything would survive the week.
- **Change hours, other costs, or starting Pressures.** See "Changes tried and rejected".
- **A cost for late fakes.** It removes the late-week release and adds a rule for no gain.
- **Leave Conversation gains generous.** The week becomes easy for any player who talks.
- **Lower the Conversation cap.** The net-zero writing rule keeps talking meaningful without a new game rule.
- **One scripted week with loose asserts.** It would miss balance changes and never test the Firing paths.

## Comments

- From [End-of-day order and Firing priority](22-end-of-day-order-and-firing-priority.md): a "Go home" button ends the day early and loses the leftover hours. Choices that cost more hours than are left are locked. Leftover hours can no longer become free Sanity through Breaks unless the policy chooses them. On Friday the end-of-day steps run before the audit.
- From [How often the Intern can talk](23-how-often-the-intern-can-talk.md): each Colleague offers one Conversation per day. Each Conversation may change one Pressure by at most 1, never Performance, and never below 1. Talking can therefore add up to 3 points a day to Sanity or goodwill. Check the policies both with and without these gains, and decide whether the scripted week holds Conversations.

# Survivability and the scripted week

Type: grilling
Status: open
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

## Comments

- From [End-of-day order and Firing priority](22-end-of-day-order-and-firing-priority.md): a "Go home" button ends the day early and loses the leftover hours. Choices that cost more hours than are left are locked. Leftover hours can no longer become free Sanity through Breaks unless the policy chooses them. On Friday the end-of-day steps run before the audit.

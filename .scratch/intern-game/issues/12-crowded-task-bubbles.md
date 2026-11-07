# Crowded Task bubbles

Type: prototype
Status: resolved
Blocked by: 11

## Question

How do Task bubbles behave when one person has assigned many Tasks? From Thursday, Fallout and rolled-over Tasks can give one Boss five or more open Tasks. Full-text bubbles then stack into a tall column that covers the office and the Task choice popover. Decide how a crowded stack looks, and how the popover stays fully on screen near the edges.

## Answer

Use variant E, "two bubbles and a pill". A crowded person shows their two most urgent Tasks in full, plus one pill for the rest.

### Crowded stacks

- One person is crowded when they have 3 or more open Tasks.
- Up to 2 open Tasks show as full bubbles, exactly as before.
- When crowded, the two most urgent Tasks show as full bubbles. A dark pill sits above them and says "+N more from <name>".
- If any hidden Task is Fallout, the pill adds a red warning sign and the count, such as "⚠ 1".
- Most urgent means Fallout first, then the oldest Task first. This order applies everywhere: bubbles, the pill, and the list.
- "Anyone" Tasks over the Intern follow the same rules.

### The Task list

- Clicking the pill opens the popover as a list of all that person's Tasks, most urgent first.
- Each list row shows the full Task text, a side colour stripe, and a pink fill for Fallout.
- Clicking a row shows that Task's choices, with a "← All N from <name>" link back to the list.
- Clicking one of the two full bubbles opens that Task's choices directly, with the same back link.
- After the player picks a Task choice for a Task in a crowded stack, the popover returns to the list. It closes when that person has no Tasks left.
- While a popover is open, every other person's bubbles fade to 35% opacity.
- Escape or the × closes the popover.

### Keeping it on screen

- A bubble group stays fully on screen. If its person is near an edge, the group slides inward and its tail detaches from the head.
- The popover opens to the right of the bubble group. If it would cross the right edge, it flips to the left side.
- The popover never covers the Pressure gauges, because they show the hover preview. It never covers the hour blocks either.
- If the popover is still too tall, it scrolls inside.

Rejected options:

- Variant D, a pile that fans out on hover. Hovering brings back the tall column.
- Variant F, one summary bubble per person. It hides all Task text, and its 540-pixel popover covers half the office.

The prototype is on branch `prototype/pressures-ui` (commit `aac1617`), in `prototype/pressures-ui/src/variants/crowd.ts`. Run `pnpm --dir prototype/pressures-ui dev`, open `?variant=E`, then use "Crowd Zbigniew (6)" and the "Edge test" button.

## Comments

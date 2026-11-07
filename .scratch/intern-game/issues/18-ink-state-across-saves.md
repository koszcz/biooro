# Ink state across saves

Type: grilling
Status: resolved
Blocked by:

## Question

How do saves handle Ink, so a reload never applies an effect twice and never loses Ink's own state?

Two problems share one cause:

- **Effects run twice.** The game autosaves after each Ink choice. A reload replays the conversation from its start. Any `adjust()`, `set_flag()` or `escalate()` call before the save point runs again.
- **Ink's own state is lost.** `GameState` holds no Ink visit counts, once-only choices or knot progress. After a reload, Ink forgets which lines and choices it has already used.

Decide one of these, or something better:

- Save Ink's state JSON (inkjs `story.state.toJson()`) inside the save, and resume mid-conversation.
- Save only at the end of a conversation, and ban writers from relying on Ink visit counts and once-only choices. All memory goes through `set_flag()`.

Say what the save holds, when it saves, and which Ink features writers may use.

Sources: [Save and load](15-save-and-load.md), [Lock the tech plan](09-lock-the-tech-plan.md), [Writing workflow](10-writing-workflow.md).

## Answer

The game saves Ink's own state next to `GameState`, and it saves only between Conversations. A reload never lands inside a Conversation, so no Ink effect runs twice.

### When it saves

- The game saves when a Conversation ends, not after each Ink choice. This replaces "autosave after every Ink choice" from [Save and load](15-save-and-load.md).
- Saves after every Task choice and every Break stay as they are.
- During a Conversation, `adjust()`, `set_flag()` and `escalate()` still apply at once, so the gauges move live.
- The game still checks for a Firing after each Ink choice. A Firing ends the Conversation, and the game saves at that point.
- If the player reloads or closes the tab midway, the save still holds the state from just before the Conversation. The Conversation replays from its start, and its effects apply once.

### What the save holds

- The save record holds `GameState`, the day-start snapshot, and Ink's state JSON from `story.state.toJson()`.
- The day-start snapshot also holds the Ink state JSON from that moment. "Retry this day" and "Retry yesterday" restore both together, so Ink's memory matches the restored day.
- The save `version` covers the Ink state too.

### Which Ink features writers may use

- Allowed: visit counts, once-only choices (`*`), sequences, cycles, shuffles, and `temp` variables.
- Banned: global `VAR` used as memory between Conversations.
- Anything the rules or another character must know goes through `set_flag()`. This keeps the tech plan's rule that Ink holds no story flags.

### When the story changes

- If `story.state.LoadJson()` throws, the game discards the save, the same as for a version mismatch.
- Developers bump the save `version` whenever they change a `.ink` file. `npm run check` does not enforce this in the slice.

### Rejected options

- Resuming mid-conversation from Ink's state JSON. The game would have to re-show the last line and choices on load. Conversations are short, so this is not worth the work.
- Banning visit counts and once-only choices. Writers would rebuild them by hand with flags, which is slower and easier to get wrong.

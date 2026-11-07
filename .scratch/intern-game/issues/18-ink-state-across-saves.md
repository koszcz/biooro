# Ink state across saves

Type: grilling
Status: open
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

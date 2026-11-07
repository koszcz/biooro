# Fold the open decisions into the spec

Type: task
Status: resolved
Blocked by: 17, 18, 19, 20, 21, 22, 23, 24, 25, 27

## Question

Update `.scratch/intern-game/spec.md` with the answers to tickets 17 to 25 and 27.

Do this:

- Replace each "still open" note in the spec with the decision, linked to its ticket.
- Remove each row from "Open decisions" once its decision is folded in.
- Update the "Content to write" table with the conversation count.
- Check the whole spec again for contradictions. Open a new ticket for any real decision.

Done when the spec has no open decisions and someone can build the slice from it without asking anything.

## Comments

- From [End-of-day order and Firing priority](22-end-of-day-order-and-firing-priority.md): Escalation is always at least 5 on Friday morning, so the tier is always Wrong when the survival scene plays. The "tier variant of Wiola's final line" can never vary. Decide whether it reads Escalation instead, or drop the variant. The new "Go home" button also needs a place in the UI section.
- From [How often the Intern can talk](23-how-often-the-intern-can-talk.md): the "Content to write" table needs 14 Colleague Conversations and 15 brush-off lines (one per cast member per Escalation tier). The Ink bridge section needs the per-Conversation caps and the rule that `adjust()` from a Conversation never goes below 1.
- From [Conversation interface](24-conversation-interface.md): the UI section needs the Conversation interface: hover labels, walking up to talk, speech bubbles, the 45 characters-a-second reveal, numbered choice bubbles with hidden effects, the "…" badges, brush-off bubbles, and letterbox bars for scripted scenes. The audio section should note that spaces make no blip. Clicks on the office are ignored during a Conversation, so the "Go home" button and Break are disabled then too.
- From [Survivability and the scripted week](25-survivability-and-the-scripted-week.md): replace the survivability check from [The week](08-the-week.md) with the policy table. Mark late-week faking as intended. Add the net-zero Conversation rule to the writing rules. Change the ignored Fallout cost to Performance 3 everywhere, including the Fallout rules and the end-of-day steps. Replace the open scripted-week note in the tech plan with the three scripted weeks and their exact asserts. Link the simulator in `sim/`.
- From [How Task choices play out](27-how-task-choices-play-out.md): the UI section needs Task actions: Task places, the walk and clip for each Task choice, the private "🤫" sabotage tag, the hand-off walk for delegating, hour blocks that drain during the clip, locked input, and Pressure floats when the action finishes. The content section needs a Task place and clip on every Task slot. The asset list needs the printer we build ourselves from boxes (see `makePrinter()`). The tech plan needs the event that starts a Task action, and the rule that `GameState` still applies the Task choice in one step.


## Answer

The [spec](../spec.md) now holds every decision from tickets 17 to 25 and 27. It has no open decisions, and the "Open decisions" section is gone.

### What changed in the spec

- **Game rules**: handled and finished, a delegation table for every Task side and Colleague, a help table, the Fallout Task choices, ignored Fallout at Performance 3, the Conversation caps, and a new "Balance" section with the policy table.
- **The week**: the morning, end-of-day and Friday step lists, and the Firing priority.
- **Screen and interface**: "Go home", Task actions with Task places and clips, the Conversation interface, scripted scenes, and the retry buttons.
- **Save and load**: the save record with Ink state JSON, saving only between Conversations, and retry from the latest snapshot.
- **Tech plan**: store commands, four new events (`taskActionStarted`, `taskActionFinished`, `conversationStarted`, `conversationEnded`), the Conversation cap checks in the Ink bridge, Ink feature rules, and the three scripted weeks with exact asserts.
- **Writing**: the net-zero Conversation rule, and a content table with 14 Conversations, 15 brush-offs, 3 hand-off lines and the onboarding scene.
- **Assets**: the clip list, checked against the Mini Characters GLB files, and the printer built from boxes.

### Contradictions resolved as fixes

The spec's "Fixes made in this spec" section records each one. None needed a new ticket.

- Wiola's tier variant in the survival scene can never vary, because Friday is always Wrong. The variant is dropped.
- The Monday onboarding is a scripted scene, but it also uses up Ryszard's Monday Conversation. It is the one exception.
- "End the day" and "Go home" merge into one "Go home" button.
- A Break plays no walk. Its hour empties at once.
- The store applies a Task choice at the click but holds its events until the scene calls `finishTaskAction()`.
- The game also autosaves at the end of the day, and a save with 0 hours left resumes by running the end-of-day steps.
- Brush-offs and hand-off lines live in each character's Ink file.
- Each Task place has one fixed sabotage clip, taken from the prototype.

# Fold the open decisions into the spec

Type: task
Status: open
Blocked by: 17, 18, 19, 20, 21, 22, 23, 24, 25

## Question

Update `.scratch/intern-game/spec.md` with the answers to tickets 17 to 25.

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

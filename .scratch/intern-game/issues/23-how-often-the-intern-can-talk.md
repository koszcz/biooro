# How often the Intern can talk

Type: grilling
Status: resolved
Blocked by:

## Question

How often can the Intern have a conversation, and what can a conversation change?

Conversations cost no hours. Ink can change Pressures with `adjust()`. A player could repeat a conversation to farm Pressures.

Decide:

- The limit, for example one conversation per Colleague per day.
- Whether Bosses can be talked to outside their scripted scenes.
- Which Pressures a conversation may change, and by how much at most.
- What a Colleague says when the Intern clicks them after the limit.

Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [Lock the tech plan](09-lock-the-tech-plan.md).

## Answer

The user accepted every recommendation.

### The limit

- Each Colleague (Ryszard, Wiola and Kamil) offers one authored Conversation per day.
- After the Intern holds it, that Colleague has no more Conversations that day.
- A Conversation the Intern skips is lost. It never comes back on a later day.
- Ryszard's Monday onboarding counts as his Monday Conversation.
- The week therefore has 14 Colleague Conversations: 3 Colleagues times 5 days, minus the onboarding.

### Bosses

- Pan Zbigniew and Pani Halina have no Conversations the Intern can start.
- They speak only through their Tasks and scripted scenes: the onboarding, the Friday audit and the Firings.
- The audit, Firing and survival scenes are not Colleague Conversations. They never count toward the limit.

### What a Conversation may change

- A Conversation may change at most one Pressure, by a total of at most 1 up or down.
- It may change the speaker's Faction goodwill, the rival Faction's goodwill, or Sanity. It never changes Performance.
- It may call `escalate()` at most once.
- `adjust()` from a Conversation never takes a Pressure below 1. A Conversation can therefore never cause a Firing.
- Holding a Conversation never counts as helping a Faction. The end-of-day neutrality cost still applies.
- The Ink bridge tracks each Conversation's totals. In development and tests, it throws an error if a Conversation breaks these caps.

### After the limit

- Clicking a Colleague after their Conversation shows a one-line brush-off.
- Clicking a Boss always shows a one-line brush-off.
- Each of the five cast members has one brush-off per Escalation tier, so 15 lines in all.
- A brush-off changes no Pressures and offers no choices.
- Where the brush-off appears on screen is part of [Conversation interface](24-conversation-interface.md).

### Effect on balance

- Talking can add up to 3 points a day to Sanity or goodwill. [Survivability and the scripted week](25-survivability-and-the-scripted-week.md) must account for this.

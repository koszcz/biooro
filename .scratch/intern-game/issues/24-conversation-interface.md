# Conversation interface

Type: prototype
Status: resolved
Blocked by: 23

## Question

How do Ink conversations look and work on screen?

No ticket decides this. Build a rough prototype in `prototype/pressures-ui` to react to. It should cover:

- How the player starts a conversation, for example by clicking a Colleague.
- Whether the Intern must walk to that Colleague first. The Task popover opens from anywhere, so today the Intern never needs to walk. Decide what walking is for.
- Where conversation text appears: a speech bubble, a panel, or something else. It must not clash with Task bubbles.
- How text reveals. The audio plays one blip per two revealed characters, so say the reveal speed and whether a click completes the line.
- How Ink choices appear and are picked.
- How scripted scenes start: the Monday onboarding, the Friday audit, Firings and the survival scene.
- How the limit from [How often the Intern can talk](23-how-often-the-intern-can-talk.md) shows on screen.

Sources: [Pressures and Task inbox UI](11-pressures-and-inbox-ui.md), [Isometric office look](02-isometric-office-look.md), [Audio](14-audio.md).

## Answer

Use variant G, "walk up, speech bubbles in the world". Conversations happen in the office, not in a menu, and walking gets a job.

### Starting a Conversation

- The player clicks a person to talk to them.
- Hovering a person changes the cursor to a pointer and shows a dark label under their head. The label says what a click will do:
  - "💬 Talk to <name>" when that Colleague still has a Conversation today.
  - "<name> · talked today", greyed, after it is used.
  - "<name> · busy (Boss)" for a Boss.
- If the person has a Conversation, the Intern walks to them first. The Intern heads for the person and stops at the first free cell beside them, then faces them. The Conversation starts the moment the Intern arrives.
- On arrival, the partner turns to face the Intern. When the Conversation ends, the partner turns back to where they faced before.
- Walking costs no hours. Walking is only for talking. The Task popover still opens from anywhere.
- From the click until the Conversation ends, clicks on the office do nothing. The player can't move the Intern, pick a Task choice, take a Break, or go home.

### Where the text appears

- Each line is a large white speech bubble over the speaker's head. Its border and tail use the speaker's Faction colour, and a small heading shows their name.
- The Intern's own lines appear over the Intern in the same way.
- Head office has no body in the room. Its lines appear in one bubble at the top centre of the screen.
- During a Conversation:
  - the partner's Task bubbles are hidden;
  - everyone else's Task bubbles fade to 25% opacity, and nobody's can be clicked;
  - any open Task popover closes;
  - the Pressure gauges and the hour blocks stay visible.

### Text reveal

- Text reveals at 45 characters a second.
- One blip plays for every two revealed characters. Spaces make no blip. Each speaker has their own pitch.
- A click, Space or Enter completes the line. A small "▸" then appears at the end of the line. The next press moves on.
- Clicks on the prototype or debug controls never count as a press.

### Ink choices

- Choices appear as stacked, numbered bubbles over the Intern. They have an orange border, the Intern's colour.
- The player picks by clicking a bubble or pressing its number key.
- Choices never show their Pressure effect.
- After the pick, the Intern says the chosen text as a normal line. Then the effect shows: the gauge moves, and a "+1 Sanity" style label floats up beside the gauges.
- If the changed Pressure's gauge is still hidden (goodwill before Tuesday), the change still happens but no label floats.

### Limit and brush-offs

- A small white "…" badge sits over each Colleague who still has a Conversation today. Its border uses their Faction colour.
- After that Conversation, the badge fades to 35% for the rest of the day. Bosses never have a badge.
- Clicking a Colleague whose Conversation is used up, or any Boss, shows a brush-off. The Intern doesn't walk.
- A brush-off is a smaller speech bubble over that person, with one line from the current Escalation tier and no choices. It fades out after about 2.6 seconds. Nothing else on screen changes.

### Scripted scenes

- These are the Monday onboarding, the Friday audit, the Firings and the survival scene.
- The game starts them. The player never clicks to start one.
- Black letterbox bars slide in at the top and bottom. A title card sits in the top bar, for example "Monday 9:00 · Onboarding" or "Fired · Performance hit 0".
- The gauges, the hour blocks, every Task bubble and every "…" badge hide until the scene ends.
- Lines and choices use the same bubbles, reveal and keys as a normal Conversation.
- If the scene's main speaker is in the room (Pan Zbigniew at onboarding and at a Firing), the Intern first walks to stand beside them. The two face each other, as in a normal Conversation.
- A scripted scene never uses up a Colleague's daily Conversation.

Rejected options:

- Variant H, a bottom panel with a portrait, with no walking. Walking would stay pointless, and the panel covers the hour blocks.
- Variant I, walking plus a transcript column on the right. The column clashes with the Task popover, which opens on the right. A transcript of the day isn't needed for the slice.

The prototype is in `prototype/pressures-ui`. Start it with the preview tool (`pressures-ui-prototype`), open `?variant=G`, and click a Colleague. The pink box at the top left changes the reveal speed and the brush-off tier, and plays the four scripted scenes. Variants G, H and I are in `src/variants/talk.ts`. The stand-in Ink content and the reveal are in `src/talk.ts`.

## Comments

- From [How often the Intern can talk](23-how-often-the-intern-can-talk.md): each Colleague offers one Conversation per day, and Bosses have none outside scripted scenes. After the limit, and always for a Boss, a click shows a one-line brush-off with no choices. Decide where brush-offs appear and how the screen shows that a Colleague's Conversation is used up.

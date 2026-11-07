# How Task choices play out

Type: prototype
Status: open
Blocked by: 24

## Question

What happens in the office when the player picks a Task choice?

Today a Task choice resolves at once, and the Intern stays where they stand. A Task like "Unjam the printer (again)" never touches the printer. The spec lists animation clips that could serve Task choices, but no ticket decides how to use them. Build a rough prototype in `prototype/pressures-ui`, on top of variant G, to react to. It should cover:

- Whether each Task has a place in the office, such as the printer, a desk or Room 4, and how Tasks with no clear place work, such as "Summarise the week of complaints in one upbeat line".
- What "Do it" looks like: whether the Intern walks to the place and plays a clip, such as `interact-left`, `pick-up` or `sit` at a desk.
- What "Fake it" and "Sabotage it" look like, and whether they differ on screen from "Do it". Sabotage must stay readable to the player, but other characters shouldn't seem to notice it.
- What "Delegate it" looks like: whether the chosen Colleague walks to the place instead, and what the Intern does meanwhile.
- How the hour cost shows: as visible time passing (for example, the hour blocks draining while the clip plays), or at once.
- Whether the player can act while the Intern is busy, or whether input is locked as in a Conversation. Say how this fits with Task bubbles that are still open.
- How the Pressure changes show: at the moment of the choice, or when the action finishes.

Sources: [Pressures and Task inbox UI](11-pressures-and-inbox-ui.md), [Crowded Task bubbles](12-crowded-task-bubbles.md), [Conversation interface](24-conversation-interface.md), [Free low-poly office assets](05-free-office-assets.md), [Character and art direction](13-character-and-art-direction.md).

## Comments

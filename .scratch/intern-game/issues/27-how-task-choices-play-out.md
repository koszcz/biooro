# How Task choices play out

Type: prototype
Status: resolved
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

- Prototype built: `prototype/pressures-ui`, variants J, K and L (`src/variants/act.ts`), preview `pressures-ui-prototype`, `?variant=J|K|L`. The user chose variant J.

## Answer

Variant J, "go there and wait it out". The Intern acts out every Task choice in the office, and the player waits for it to finish. The prototype is `prototype/pressures-ui/src/variants/act.ts` (`?variant=J`). Variants K and L stay in the same file as the alternatives that lost.

### Task places

- Every Task has one Task place. Write it on each Task slot in the content, with the clip to play there. Do not work it out from the title, as the prototype does.
- The slice uses seven Task places: the Intern's desk, the printer, the sink, the plant, the shredder, Room 4, and the evidence shelf.
- A Task with no clear place, such as "Summarise the week of complaints in one upbeat line", happens at the Intern's desk. The Intern sits down there.
- The Kenney kits have no printer, so we build our own in code. It is a floor-standing copier made of chamfered boxes, with two paper drawers and a sheet half out of the output slot. To blend in, it copies the kit: the kit's own `metal`, `metalMedium`, `metalDark` and `carpetWhite` colours, roughness 1, no glowing lights, and about the size of the kit's washer (0.38 wide, 0.45 tall, 0.32 deep). Its front faces the camera. See `makePrinter()` in `prototype/pressures-ui/src/scene.ts`. The build can keep it as code or export it once to a GLB file.

### What each Task choice looks like

| Task choice | On screen |
| --- | --- |
| Do it | The Intern walks to the Task place and plays its clip: `sit` at the desk, `interact-left` or `interact-right` at a machine, `pick-up` at the plant or shelf, `crouch` at the shredder. |
| Fake it | The same walk and the same place, for 1 hour. It ends with a "✨ looks done" sparkle. |
| Sabotage it | The same walk and place, with a different clip, such as a kick or a fiddle. A purple "🤫" tag over the Intern shows only to the player. Nobody turns to look, and nobody comments. At the desk, the clip is still `sit`, so the tag carries the difference. |
| Delegate it | The Intern walks to the Colleague. The Colleague nods (`emote-yes`) and says a short line in a speech bubble. The 1 hour drains there. |

After a hand-off, the Colleague acts on their own, and it costs the Intern nothing:

- Wiola walks to the Task place, works for about 3 hours of screen time, then walks back home. For a desk Task, she works where she stands.
- Kamil does the same for a Paper Trail or unsided Task. With a Launch Team Task, he walks to Pani Halina instead, which shows the escalation.
- Ryszard says yes, stays where he is, and shows "✨ looks done". He fakes it.

### Time, input and Pressures

- **Hours drain while the clip plays.** One hour block empties for each in-game hour of the Task choice. The prototype uses 1 second per hour. Tune the pace in the build.
- **Input is locked**, as in a Conversation. Clicks on the office are ignored. All Task bubbles dim and cannot be clicked, and any open popover closes. Break and "Go home" are disabled.
- The Task being worked shows a "⏳" before its title. A tag over the Intern names the Task choice, the Task, and the hours left, as small blocks.
- **Pressures change when the action finishes**, never at the click. Each visible change rises from the Intern's head as a coloured float, such as "+1 Performance".
- If the hours reach 0, the day ends after the action finishes.

### Fit with the locked tech plan

This decision only changes what the scene shows. The rules stay the same:

- `GameState` still applies a Task choice in one step, at the click. It stays pure, and the autosave after a Task choice holds the finished result.
- The scene gets a new typed event for the start of a Task choice. It plays the walk and the clip, drains the hour blocks, and holds back the Pressure gauges and floats until the action finishes.
- Reloading in the middle of an action skips the rest of the animation. Nothing is lost.

The prototype instead splits the rule into steps (`spendHours`, then `applyChoice`). That is only a shortcut for the prototype. Do not copy it.

# Assemble the spec

Type: task
Status: open
Blocked by:

## Question

Compile the 15 resolved tickets into the final spec at `.scratch/intern-game/spec.md`. Someone must be able to build the vertical slice from it without asking anything.

Do this:
- Read every resolved ticket and `CONTEXT.md`.
- Organise the spec by what a builder needs: scope, game rules, the week, cast, UI, art and audio, save and load, tech plan, and writing workflow.
- Link each section back to its source ticket instead of restating long detail.
- Flag any contradiction or gap between tickets. Resolve small ones in the spec and note them. Open a new ticket for any real decision.
- Keep each sentence short and sharp enough for an agent to act on.

Done when `spec.md` exists, covers all 15 tickets, and lists the gaps found.

## Comments

### Review of tickets 01 to 15 (2026-11-07)

A review of all resolved tickets found the problems below. Handle them as this ticket says: open a new ticket for each real decision, and resolve small ones in the spec with a note.

#### Rule bugs

These break the game as written. Each one needs a decision, so open a ticket for each.

1. **"Retry this day" can loop forever.** If the morning Sanity drop fires the Intern, the day-start snapshot fires the Intern again. Decide what retry restores in that case. Sources: [Save and load](15-save-and-load.md), [The week](08-the-week.md).
2. **A reload applies Ink effects twice.** The game autosaves after each Ink choice, but a reload replays the conversation from its start. Any `adjust()`, `set_flag()` or `escalate()` call in that conversation runs again. Source: [Save and load](15-save-and-load.md).
3. **Ink's own state is never saved.** `GameState` holds no Ink visit counts or once-only choice state. Decide whether to save Ink's state JSON, or to ban writers from relying on it. Sources: [Lock the tech plan](09-lock-the-tech-plan.md), [Save and load](15-save-and-load.md).
4. **Friday can ask for more Tasks than it has slots.** Finishing 7 Tasks on Thursday (4 new Tasks plus 3 Fallout Tasks) gives 2 + 3 = 5 new Tasks on Friday. Friday has 4 slots. The claim "at most 2, 3, 3, 4 and 4" is wrong for Friday. Add a rule that caps arrivals at the slot count. This one is small: resolve it in the spec. Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [The week](08-the-week.md).
5. **The survivability check is wrong.** A player who always picks "Do it" and takes no Breaks goes from Sanity 6 to 4 (Monday), to 1 (Tuesday), to 0 on Wednesday morning, and is fired. With Breaks, Sanity is easy to hold. The real squeeze is Performance: "Do it" takes 3 hours, so only 2 fit in a day, while 3 or 4 Tasks arrive. The unhandled Tasks then cost Performance every night. A hand-run of "Do it, then Breaks with leftover hours" ends Friday at about Performance 1. Rewrite the check, and define the policy the scripted Vitest week follows: which Task it picks first, and when it takes Breaks. Sources: [The week](08-the-week.md), [Lock the tech plan](09-lock-the-tech-plan.md).

#### Missing decisions

No ticket decides these. Open a ticket for each.

6. **Conversation UI and interaction.** No ticket says how Ink conversations appear on screen, how the player starts one, or how choices are picked. It is also unclear whether walking matters: the Task popover opens from anywhere, so the Intern never needs to walk to an assigner. Sources: [Pressures and Task inbox UI](11-pressures-and-inbox-ui.md), [Isometric office look](02-isometric-office-look.md).
7. **How often the Intern can talk.** Conversations cost no hours, and Ink can change Pressures with `adjust()`. A player could repeat a conversation to farm Pressures. Decide a limit, such as once per Colleague per day. Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [Lock the tech plan](09-lock-the-tech-plan.md).
8. **What sabotage does to the Task.** Sabotage "does not finish" the Task. If the Task stays open, it rolls over and costs Performance 1 every night until the week ends. Decide whether a sabotaged Task closes. Source: [Pressures and Task choices](07-pressures-and-task-choices.md).
9. **Which Task choices a Fallout Task offers.** Decide whether the Intern can fake a Fallout Task (and whether that creates more Fallout), delegate it, or sabotage it. Also define "ignoring" a Fallout Task, and whether it costs both the Fallout penalty (Performance 2) and the unhandled-Task penalty (Performance 1). Source: [Pressures and Task choices](07-pressures-and-task-choices.md).
10. **End-of-day order and Firing priority.** Fix the order of the end-of-day steps: the unhandled-Task penalty, the neutrality drain, and the Firing check. On Friday, also place the audit and the survival scene in that order. Decide which Firing scene plays when two Pressures reach 0 at once. Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [The week](08-the-week.md).
11. **What "helps a Faction" means.** The neutrality drain and the Escalation rule both depend on it. Decide whether faking a Faction's Task, or delegating it to Wiola, counts as helping that Faction. Sources: [Pressures and Task choices](07-pressures-and-task-choices.md), [The week](08-the-week.md).

#### Small fixes

Resolve these in the spec and note each one.

- **No event carries the Escalation tier.** The audio module and the palette both react to the tier. Add an event such as `tierChanged`, and say whether the tier can change mid-day.
- **The event lists differ.** The UI ticket names `hoursChanged`, `taskResolved`, `goodwillRevealed` and `dayStarted`, which the tech plan does not. List all events once in the spec. The audio module also needs `taskResolved` to play a sound for each Task choice.
- **The palette is tied to days, not tiers.** The art ticket describes Monday, Wednesday and Friday. Map these to the Mundane, Odd and Wrong tiers, because choices can bring a tier early.
- **The code layout table is incomplete.** Add `src/story/` (Ink files), `src/audio/`, and a folder for the state store. The save code lives with the store, but no ticket names that folder.
- **Text reveal is undefined.** The audio ticket plays a blip per revealed character, so it assumes text appears letter by letter. The UI ticket shows full text at once and defines no reveal.
- **The package manager differs.** The tech plan uses `npm run check`. The prototypes use `pnpm`. Pick one.
- **Kamil's delegation effects need spelling out.** Delegating a Launch Team Task to Kamil costs the Paper Trail 1 goodwill (the delegation cost) and the Launch Team 1 goodwill (the flip). Give the net effects in one table row.
- **Faking on Thursday and Friday has no cost.** Fallout from those days would arrive after Friday, so it never arrives. Note this as an exploit, or as an intended late-week release.
- **The first Fallout lands on Wednesday, not Thursday.** Ryszard teaches faking on Monday, so Monday fakes return on Wednesday. The week plan says Fallout first lands on Thursday.
- **The title screen and the loading screen overlap.** The audio ticket unlocks audio with the loading screen's Start button. The save ticket has a title screen with Continue and New game. Use those buttons to unlock audio.

#### Housekeeping

- The research findings for tickets 03, 04 and 05 are on unmerged branches (`research/dialogue-tool`, `research/threejs-stack`, `research/office-assets`). The tickets link to worktrees outside the repo. The prototype branches `prototype/office-look` and `prototype/pressures-ui` are not merged into `main` either. Link to branches in the spec, or ask the user to merge them.
- `prototype/pressures-ui/` is untracked on `main`. It looks like a copy of the `prototype/pressures-ui` branch. Ask the user before committing it.

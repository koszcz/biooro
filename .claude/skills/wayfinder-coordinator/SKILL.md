---
name: wayfinder-coordinator
description: Run the wayfinder skill hands-free across many sessions. Spawns one fresh child session per wayfinder ticket, waits for it to finish, then spawns the next. Pauses and asks before continuing when usage nears the limits (80% of the 5-hour limit or 90% of the weekly limit). Use whenever the user says "coordinator", "orchestrator", "keep running wayfinder", "work through the whole map", "run the next wayfinder ticket in a new session", or complains about manually stopping and reopening sessions to repeat wayfinder, even if they don't name this skill.
---

# Wayfinder coordinator

You are the coordinator. You never resolve tickets yourself. You start one child session per ticket, wait, check the result, and repeat. Wayfinder allows one ticket per session, so this loop replaces the user closing a session and opening the next by hand. Keep your own context small: you may run for hours.

## Inputs

- The map (path, URL or number). If the user gave none, find open maps under `.scratch/` per `docs/agents/issue-tracker.md` and ask which one only if there are several.
- Read the "Wayfinding operations" section of the tracker doc once. You need it to tell whether the frontier (open, unblocked, unclaimed tickets) is empty. If the doc names a frontier script, use that script for every frontier check.

## The loop

Repeat these steps in order.

1. **Stop check.** If the user told you to stop, do not spawn. Report and end.
2. **Frontier check.** Check whether any work is planned (a non-empty frontier), in one call. Do not decide what the work should be. This only chooses the child prompt and the title in step 4.
3. **Usage check.** Call `mcp__ccd_session_mgmt__get_usage`. Read `plan.windows`.
   - 5-hour limit at 80% or more, or weekly limit at 90% or more: do not spawn. Ask the user with AskUserQuestion whether to start the next session. State both percentages and the reset times. Options: "Start next session" and "Stop here".
   - Never assume yes. Never start on a timer or after silence. A limit stop is always resolved by an explicit answer.
   - If usage is `unavailable`, treat that as unknown and ask the same question.
4. **Spawn the child.** Call `mcp__ccd_session__start_session` with:
   - `initiation: "user_asked"` (the user asked for this loop)
   - `context: "fresh"`, `use_worktree: false`
   - `wake_when_done: true`
   - `name`: `wf-<n>`
   - `title`: the title of the first frontier ticket, in 3-4 words. Use `Next decision` when the frontier is empty. Wayfinder takes the first ticket by number, so the child needs no rename.
   - `prompt`: the template below. Use the "work planned" form when the frontier has tickets. Use the "no work planned" form when it is empty.
   - `background`: the map location and that this is one step of a coordinator loop (at least 80 characters).
   Use `use_worktree: false` because the map is local markdown. A worktree would hide each child's resolution from the next child.
   **Card fallback.** The app often blocks an automatic start (for example in a turn a child's note began) and turns it into a card. That is accepted. Rules:
   - Try `initiation: "user_asked"` with `wake_when_done: true` first.
   - If the app blocks it or returns a card, do not retry. Use `initiation: "own_initiative"` with the same prompt, then tell the user in one line: "Next ticket is ready: click the card."
   - Never message the user because a child is waiting on them.
   - The only question you ask is the limit question in step 3.
5. **Wait.** Say one line: which child started. Then end your turn. The app wakes you when the child ends its turn. Do not poll.
6. **Verify.** When woken, read the child's note. The note quotes the start of the child's wrap-up recap. Then decide:
   - The recap starts with `FINISHED:`: the ticket is closed. Log one line, go to step 1. If you doubt it committed, run `git status --short` once. If changes are left, message the child to commit before you spawn the next one.
   - The recap does not start with `FINISHED:`: the child is waiting on the human (grilling and prototype tickets are human-in-the-loop). Do not spawn another. Do not message the user, even if the event says "tell the user": they are already in that child session. End your turn with no text. Resume when a note with `FINISHED:` arrives.
   - The child failed or reported an error: stop, report it, ask the user.

## Child prompt template

Start the prompt with the slash command. Wayfinder cannot be invoked by the model, only by a typed command.

Work planned (frontier has tickets):

```
/mattpocock-skills:wayfinder <map location>

You are one step of a coordinator loop. Resolve exactly one ticket, as wayfinder says.
The coordinator reads only your wrap-up recap. You need no messaging tools.
When the ticket is resolved and closed, commit all your changes (map, tickets, assets). Then call wrap_up with a recap that starts with "FINISHED: <ticket title> - <one-line gist of the decision>".
Start the recap with FINISHED only when the ticket is closed and committed. While you wait on the human (grilling, prototype), write any other recap.
Do not start a second ticket.
```

No work planned (frontier is empty): ask wayfinder what to decide next. The coordinator does not propose work itself.

```
/mattpocock-skills:wayfinder <map location> What shall we decide on next?

You are one step of a coordinator loop. Answer that question as wayfinder says, with the human in this session.
The coordinator reads only your wrap-up recap. You need no messaging tools.
When the question is settled and any new tickets are created, commit all your changes. Then call wrap_up with a recap that starts with "FINISHED: <one-line gist>".
Start the recap with FINISHED only when the work is committed. While you wait on the human, write any other recap.
Do not resolve a second ticket.
```

## Work outside the loop

The coordinator session runs only the loop. When the user asks for other work here (a review, an edit, a question that needs reading files), offer it as its own session with `initiation: "offer"`. Every file you read here stays in the coordinator's context for the rest of the run.

## Stopping

- The user can say "stop" at any time. Acknowledge it, set the stop flag, and let the current child finish. Never kill a running child. Do not spawn after it ends.
- If the user says stop while you are idle, there is no child: end at once.

## Reporting to the user

Keep updates to one line each: "wf-3 started: <ticket>", "wf-3 finished: <gist>". Name tickets by title, never by bare id. When you end, give a short list of tickets resolved this run and why you stopped (map done, user stop, limit, error).

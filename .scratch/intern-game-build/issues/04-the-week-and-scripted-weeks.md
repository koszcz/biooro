# The week and the scripted weeks

Status: resolved
Blocked by: 02

## What to build

Turn one Workday into a full week from Monday to Friday, then prove the balance with the three scripted weeks.

- The 10 morning steps and the end-of-day steps, in the spec's order, as pure functions that return `{ state, events }`.
- Task growth and the cap at the day's slot count.
- Fallout: pending Fallout with due days, Fallout that would arrive after Friday never arrives, the Fallout Task limits, and ignored Fallout costing Performance 3 and Escalation 1.
- Rollover of unhandled Tasks, at a cost of Performance 1 each.
- The neutrality cost from Tuesday.
- Sanity dropping each morning from Tuesday, and the `goodwillRevealed` event on Tuesday.
- The three strange swap Tasks and the swap rule. Add them to the content with placeholder wording.
- Friday: 5 Task hours, the end-of-day steps before the audit, the audit answer as a rule function, the second Firing check, and the survival variant.
- The retry kind on each Firing: "this day" or "yesterday".
- The three scripted weeks as Vitest tests, with the exact asserts from the spec.

## Acceptance criteria

- [ ] The three scripted-week tests pass with the spec's exact numbers. If one fails, compare against `.scratch/intern-game/sim/week_sim.py` before you change anything. Never change the asserted numbers to make a test pass.
- [ ] Tests cover the Friday order, the swap rule and Fallout after Friday.
- [ ] `npm run check` passes.

## Spec

- [4. Game rules](../../intern-game/spec.md#4-game-rules): "Fallout", "Neutrality", "Task growth", "Escalation" and "Balance".
- [5. The week](../../intern-game/spec.md#5-the-week): all of it.
- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "The scripted weeks".

## Comments

Built on branch ticket-04, merged into intern-game-build at 9495f6392a3d50be5580e1d8f171b229f60b94af. Also built the 'Ryszard already faked this once' lock left over from ticket 03. Choices where the spec is silent: an `audit` phase holds the game between Friday's end-of-day steps and `answerAudit`; an end-of-day Firing does not emit `dayEnded`; a strange Task keeps its slot's Task ID with an optional `strange` field.

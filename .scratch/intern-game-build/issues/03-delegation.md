# Delegation

Status: ready-for-agent
Blocked by: 02

## What to build

Add "Delegate it" to the rules, so the Intern can hand a Task to Ryszard, Wiola or Kamil.

- `applyTaskChoice` accepts "Delegate it" with a Colleague.
- The trust lock: the Colleague's Faction needs goodwill of 5 or more. Otherwise the reason is "<Colleague> doesn't trust you yet".
- The net effects from the "Delegating" table, for every Task side and Colleague.
- Ryszard's fake creates pending Fallout due in 2 days. Kamil's flip of a Launch Team Task or a Task with no side.
- The "Helping a Faction" rows for the three Colleagues.
- Content data for the three Colleagues: name, Faction and what they do with a delegated Task.

## Acceptance criteria

- [ ] One test per row of the "Delegating" table asserts every column exactly.
- [ ] Tests cover the trust lock for each Faction.
- [ ] `npm run check` passes.

## Spec

- [4. Game rules](../../intern-game/spec.md#4-game-rules): "Delegating" and "Helping a Faction".

# Onboarding, audit and survival scenes

Status: resolved
Blocked by: 13, 16

## What to build

Draft the scripted scenes that the user does not write.

- The Monday onboarding with Pan Zbigniew and Ryszard, in `src/story/onboarding.ink`. Ryszard teaches the Intern to fake Tasks.
- The Friday audit in `src/story/audit.ink`: the unseen Head office auditor asks one question about Smart range complaints, with the three answers.
- The three survival scenes in `src/story/survival.ink`, with no tier variant.

Check each draft against `docs/writing/voice.md` and fix any mismatch first.

## Acceptance criteria

- [x] Each scene replaces its placeholder knot and plays in the game.
- [ ] You open a pull request, and the user reads every line before it merges.

## Spec

- [5. The week](../../intern-game/spec.md#5-the-week): "The Friday audit" and "Surviving the week".
- [11. Writing](../../intern-game/spec.md#11-writing): "Content to write".

## Comments

2026-11-09, agent: Drafted all five scenes on branch `ticket-21-scenes`, checked against the voice guide. The lines are in `src/story/onboarding.ink`, `src/story/audit.ink` and `src/story/survival.ink`. The onboarding needs two speakers, so a line can now name a cast member with a speaker tag, such as `#speaker:ryszard` (`src/dialogue/conversations.ts`). No scene changes a Pressure from Ink. The audit effects still apply from the `#audit:` tags. `src/dialogue/scriptedScenes.test.ts` plays every choice path of each scene. The game was not checked in the browser. Every line still needs your review before merge.
- 2026-11-09, agent: A code review shortened lines to fit their display time and fixed voice-guide breaks. The work merged straight into `main`, without a pull request, at the user's request. The user still has to read every line on `main`. The ticket is resolved.

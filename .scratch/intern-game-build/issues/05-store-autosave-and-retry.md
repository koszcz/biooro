# Store, autosave and retry

Status: resolved
Blocked by: 04

## What to build

The state store in `src/store/`. It is the only way the scene, UI, audio and dialogue folders change state.

- A typed event emitter for every event in the spec's "Events" table.
- Every store command from the "Store commands" table. `chooseTask` applies the whole Task choice at the click, autosaves, emits `taskActionStarted` at once and holds the other events until `finishTaskAction()`.
- The save record in one `localStorage` key: `GameState`, Ink state JSON as an opaque string, the day-start snapshot and a `version` number. A second key holds the settings record.
- Autosave at every point the spec lists, and never inside a Conversation.
- Loading: discard the save when the version differs or the JSON fails to parse. Resume the Firing screen. Run the end-of-day steps when a save has 0 hours left.
- `retry()` restores the snapshot, and `startOver()` starts a new game.

## Acceptance criteria

- [ ] Tests with a fake `localStorage` cover save, load, version discard, retry after a day Firing and retry after a morning Firing.
- [ ] A test proves `chooseTask` holds `pressureChanged` until `finishTaskAction()` runs.
- [ ] `npm run check` passes.

## Spec

- [9. Save and load](../../intern-game/spec.md#9-save-and-load): all of it.
- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Store commands" and "Events".

## Comments

Built on branch ticket-05, merged into intern-game-build at 4c318fb. Choices where the spec is silent: added an `answerAudit(answer)` command; a survived week deletes the save; `retry()` emits `dayStarted`; `continueGame(loadInk?)` discards the save if `loadInk` throws; a Break that spends the last hour runs the end-of-day steps; only an unscripted Conversation marks a Colleague as talked today; keys are `biooro.save` and `biooro.settings` (`{ muted }`). Left for ticket 11: the save when a Firing ends a Conversation, which needs Ink writes.

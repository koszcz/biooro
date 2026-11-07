# Title screen and scripted scenes

Status: ready-for-agent
Blocked by: 09, 12

## What to build

Wrap the week in its scenes, so it plays from the title screen to the end. Use placeholder Ink knots for every scene.

- The loading screen turns into the title screen with Continue and New game. New game asks for confirmation. A finished week removes Continue. Either button unlocks browser audio.
- The scripted scene frame: letterbox bars, the title card, and the HUD, bubbles and badges hidden until the scene ends.
- The main speaker walk-up: the Intern walks beside Pan Zbigniew at the onboarding and at the Performance Firing.
- The Monday onboarding, which uses up Ryszard's Monday Conversation.
- The four Firing scenes, picked by the `fired` event.
- The screen after a Firing, with "Retry this day" or "Retry yesterday", and "Start over".
- The Friday audit scene. Its answer applies through the rule function, and the second Firing check runs after it.
- The survival scene, picked by its variant.

## Acceptance criteria

- [ ] A full week plays from New game to the survival scene with no reload.
- [ ] Each of the four Firings shows its scene and the right retry button.
- [ ] Closing the tab on the Firing screen and pressing Continue reopens that screen.
- [ ] `npm run check` passes.

## Spec

- [6. Screen and interface](../../intern-game/spec.md#6-screen-and-interface): "Scripted scenes" and "After a Firing".
- [5. The week](../../intern-game/spec.md#5-the-week): "Friday", "The Friday audit", "Firings" and "Surviving the week".
- [10. Tech plan](../../intern-game/spec.md#10-tech-plan): "Boot".

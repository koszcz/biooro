# Conversation interface

Type: prototype
Status: open
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

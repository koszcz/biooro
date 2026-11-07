# Pressures and Task inbox UI

Type: prototype
Status: open
Blocked by:

## Question

How do the four Pressures, the remaining Workday hours, and the Task inbox look and behave on screen? Decide where each one sits over the isometric office, how a Task choice is picked, how locked Task choices show their reason, and how the goodwill Pressures appear on Day 2.

## Comments

- From [Lock the tech plan](09-lock-the-tech-plan.md): the UI is plain DOM in TypeScript, with no UI library. It reacts to typed state events such as `pressureChanged` and `taskAssigned`. Build the prototype that way, and flag it if a library proves necessary.

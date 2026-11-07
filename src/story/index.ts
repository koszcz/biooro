// Ink dialogue files, with main.ink as the root.
export { default as story } from "./main.ink";
/** The game story plus test knots. Only tests import it, so builds leave it out. */
export { default as testStory } from "./test.ink";

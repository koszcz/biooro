// Every Polish Ink line, keyed by its #id: tag. The voice anchors and test knots are not shown in the game, so they
// have no Polish text.
import { FIRING_LINES } from "./firings";
import { KAMIL_LINES } from "./kamil";
import { RYSZARD_LINES } from "./ryszard";
import { SCENE_LINES } from "./scenes";
import { WIOLA_LINES } from "./wiola";

export const STORY_LINES: Readonly<Record<string, string>> = {
  ...SCENE_LINES,
  ...FIRING_LINES,
  ...RYSZARD_LINES,
  ...WIOLA_LINES,
  ...KAMIL_LINES,
};

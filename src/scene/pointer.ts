// Turns pointer events on the office canvas into clicks and hovers on people or the floor.
// A Conversation locks the office from the click that starts it until it ends.
import { type Camera, type Object3D, Raycaster, Vector2 } from "three";
import type { CastId } from "../content/index";
import { personUnder } from "./people";

/** The store events that lock and unlock the office. */
export type LockEvents = {
  on(type: "conversationStarted" | "conversationEnded", listener: () => void): () => void;
};

export type Pointer = {
  onPersonClick(listener: (person: CastId) => void): void;
  onPersonHover(listener: (person: CastId | undefined) => void): void;
  /** Calls `listener` with the aimed ray when the player clicks anything but a person. */
  onFloorClick(listener: (ray: Raycaster) => void): void;
  /** Locks the office now, for the walk to a Conversation. The next `conversationEnded` unlocks it. */
  lock(): void;
};

/** `busy` locks the office as well, for example while a Task action plays. */
export function createPointer(
  canvas: HTMLElement,
  camera: Camera,
  people: Object3D[],
  events: LockEvents,
  busy: () => boolean = () => false,
): Pointer {
  const ray = new Raycaster();
  const point = new Vector2();
  const aim = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    point.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    ray.setFromCamera(point, camera);
  };

  const clicks: ((person: CastId) => void)[] = [];
  const hovers: ((person: CastId | undefined) => void)[] = [];
  const floorClicks: ((ray: Raycaster) => void)[] = [];
  let locked = false;
  let hovered: CastId | undefined;
  const hover = (person: CastId | undefined) => {
    if (person === hovered) return;
    hovered = person;
    canvas.style.cursor = person ? "pointer" : "";
    for (const listener of hovers) listener(person);
  };

  const lock = () => {
    locked = true;
    hover(undefined);
  };
  events.on("conversationStarted", lock);
  events.on("conversationEnded", () => {
    locked = false;
  });
  canvas.addEventListener("pointermove", (event) => {
    // A right (2) or middle (4) button held down means a camera drag. Leave the cursor alone.
    if (event.buttons & 6) return;
    if (locked || busy()) {
      hover(undefined);
      return;
    }
    aim(event);
    hover(personUnder(ray, people));
  });
  canvas.addEventListener("pointerleave", () => hover(undefined));
  canvas.addEventListener("pointerdown", (event) => {
    // Only the primary button walks and talks. The other buttons pan the camera.
    if (event.button !== 0 || locked || busy()) return;
    aim(event);
    const person = personUnder(ray, people);
    if (person) for (const listener of clicks) listener(person);
    else for (const listener of floorClicks) listener(ray);
  });

  return {
    onPersonClick: (listener) => clicks.push(listener),
    onPersonHover: (listener) => hovers.push(listener),
    onFloorClick: (listener) => floorClicks.push(listener),
    lock,
  };
}

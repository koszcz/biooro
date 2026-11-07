// Turns pointer events on the office canvas into clicks and hovers on people or the floor.
// A Conversation locks the office from the click that starts it until it ends.
import { type Camera, type Object3D, Raycaster, Vector2 } from "three";
import type { CastId } from "../content";
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
};

export function createPointer(canvas: HTMLElement, camera: Camera, people: Object3D[], events: LockEvents): Pointer {
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

  events.on("conversationStarted", () => {
    locked = true;
    hover(undefined);
  });
  events.on("conversationEnded", () => {
    locked = false;
  });
  canvas.addEventListener("pointermove", (event) => {
    if (locked) return;
    aim(event);
    hover(personUnder(ray, people));
  });
  canvas.addEventListener("pointerleave", () => hover(undefined));
  canvas.addEventListener("pointerdown", (event) => {
    if (locked) return;
    aim(event);
    const person = personUnder(ray, people);
    if (person) for (const listener of clicks) listener(person);
    else for (const listener of floorClicks) listener(ray);
  });

  return {
    onPersonClick: (listener) => clicks.push(listener),
    onPersonHover: (listener) => hovers.push(listener),
    onFloorClick: (listener) => floorClicks.push(listener),
  };
}

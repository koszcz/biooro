import { OrthographicCamera } from "three";
import { describe, expect, it } from "vitest";
import { createPointer, type LockEvents } from "./pointer";

const noLocks: LockEvents = { on: () => () => {} };

// A stand-in canvas: just enough for the pointer to aim and set its cursor.
function fakeCanvas() {
  const canvas = new EventTarget() as EventTarget & HTMLElement;
  Object.assign(canvas, {
    style: { cursor: "" },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
  });
  return canvas;
}

function press(canvas: EventTarget, button: number) {
  const event = Object.assign(new Event("pointerdown"), { button, clientX: 400, clientY: 300 });
  canvas.dispatchEvent(event);
}

describe("createPointer", () => {
  it("walks on the primary button only, so other buttons can pan the camera", () => {
    const canvas = fakeCanvas();
    const pointer = createPointer(canvas, new OrthographicCamera(), [], noLocks);
    let floorClicks = 0;
    pointer.onFloorClick(() => floorClicks++);
    press(canvas, 1);
    press(canvas, 2);
    expect(floorClicks).toBe(0);
    press(canvas, 0);
    expect(floorClicks).toBe(1);
  });
});

import type { OrthographicCamera } from "three";
import { panCamera, type ScreenSpot, zoomCamera } from "./camera";

// The wheel zooms toward the cursor. A right or middle button drag pans the view.
// The left button stays free for click-to-walk and clicks on people.
export function wireCameraControls(canvas: HTMLCanvasElement, camera: OrthographicCamera): void {
  // Pixels to normalised device coordinates: the canvas spans 2 units each way, with +y up.
  const toScreen = (x: number, y: number): ScreenSpot => {
    const bounds = canvas.getBoundingClientRect();
    return { x: (x / bounds.width) * 2, y: -(y / bounds.height) * 2 };
  };
  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const bounds = canvas.getBoundingClientRect();
      const fromCorner = toScreen(event.clientX - bounds.left, event.clientY - bounds.top);
      zoomCamera(camera, event.deltaY, { x: fromCorner.x - 1, y: fromCorner.y + 1 });
    },
    { passive: false },
  );

  let dragging: number | undefined;
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 1 && event.button !== 2) return;
    event.preventDefault();
    dragging = event.pointerId;
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragging) return;
    panCamera(camera, toScreen(event.movementX, event.movementY));
  });
  const stopDragging = (event: PointerEvent) => {
    if (event.pointerId !== dragging) return;
    dragging = undefined;
    canvas.style.cursor = "";
  };
  canvas.addEventListener("pointerup", stopDragging);
  canvas.addEventListener("pointercancel", stopDragging);
}

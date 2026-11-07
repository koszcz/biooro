// Where the Task choice popover goes: right of the assigner, flipped left at the edge, clear of the HUD.

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PopoverRequest {
  /** The assigner's head on screen. */
  anchor: { x: number; y: number };
  /** The popover's natural size. */
  size: { width: number; height: number };
  viewport: { width: number; height: number };
  /** The popover must never cover these. */
  avoid: { gauges: Rect; hours: Rect };
}

export interface PopoverPlace {
  left: number;
  top: number;
  /** The height to use. It is less than the natural height when the popover must scroll. */
  height: number;
  side: "left" | "right";
}

/** The gap between the assigner and the popover, and between the popover and anything it avoids. */
const GAP = 24;
const MARGIN = 10;
/** How far above the head the popover's top edge starts. */
const LIFT = 80;

export interface BubbleGroupBox {
  /** The centre of the group, over the person's head. */
  x: number;
  /** The bottom of the group (the head). */
  bottom: number;
  width: number;
  height: number;
}

/** The room a bubble's tail needs below the group. */
const TAIL = 8;

/** How far to move a bubble group so it stays fully on screen. */
export function slideGroupIn(
  { x, bottom, width, height }: BubbleGroupBox,
  viewport: { width: number; height: number },
): { dx: number; dy: number } {
  const clampShift = (low: number, high: number, min: number, max: number) =>
    low < min ? min - low : high > max ? max - high : 0;
  return {
    dx: clampShift(x - width / 2, x + width / 2, MARGIN, viewport.width - MARGIN),
    dy: clampShift(bottom - height, bottom + TAIL, MARGIN, viewport.height - MARGIN),
  };
}

export function placePopover({ anchor, size, viewport, avoid }: PopoverRequest): PopoverPlace {
  // The free area: right of the gauges and above the hour blocks.
  const minLeft = avoid.gauges.right + MARGIN;
  const maxRight = viewport.width - MARGIN;
  const minTop = MARGIN;
  const maxBottom = Math.min(viewport.height, avoid.hours.top) - MARGIN;

  const fitsRight = anchor.x + GAP + size.width <= maxRight;
  const side = fitsRight ? "right" : "left";
  const wanted = fitsRight ? anchor.x + GAP : anchor.x - GAP - size.width;
  const left = Math.max(minLeft, Math.min(wanted, maxRight - size.width));

  const height = Math.min(size.height, maxBottom - minTop);
  const top = Math.max(minTop, Math.min(anchor.y - LIFT, maxBottom - height));
  return { left, top, height, side };
}

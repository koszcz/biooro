import { describe, expect, it } from "vitest";
import { placePopover, slideGroupIn } from "./placement";

describe("slideGroupIn", () => {
  const screen = { width: 1200, height: 800 };
  const group = { x: 600, bottom: 400, width: 200, height: 150 };
  const fits = (g: typeof group, shift: { dx: number; dy: number }) => {
    const left = g.x + shift.dx - g.width / 2;
    const top = g.bottom + shift.dy - g.height;
    return left >= 0 && left + g.width <= screen.width && top >= 0 && g.bottom + shift.dy <= screen.height;
  };

  it("leaves a group in the middle of the screen where it is", () => {
    expect(slideGroupIn(group, screen)).toEqual({ dx: 0, dy: 0 });
  });

  it.each([
    ["left", { ...group, x: 5 }],
    ["right", { ...group, x: 1195 }],
    ["top", { ...group, bottom: 20 }],
    ["bottom", { ...group, bottom: 799 }],
  ])("slides a group at the %s edge fully on screen", (_edge, edgeGroup) => {
    expect(fits(edgeGroup, slideGroupIn(edgeGroup, screen))).toBe(true);
  });
});

const viewport = { width: 1200, height: 800 };
// The gauges sit on the left edge. The hour blocks sit at the bottom.
const gauges = { left: 12, top: 300, right: 200, bottom: 500 };
const hours = { left: 400, top: 720, right: 800, bottom: 760 };
const size = { width: 280, height: 300 };

function overlaps(a: { left: number; top: number; width: number; height: number }, b: typeof gauges) {
  return a.left < b.right && a.left + a.width > b.left && a.top < b.bottom && a.top + a.height > b.top;
}

describe("placePopover", () => {
  it("opens to the right of the assigner", () => {
    const place = placePopover({ anchor: { x: 600, y: 400 }, size, viewport, avoid: { gauges, hours } });
    expect(place.left).toBeGreaterThan(600);
    expect(place.side).toBe("right");
  });

  it("flips left at the right edge and stays on screen", () => {
    const place = placePopover({ anchor: { x: 1100, y: 400 }, size, viewport, avoid: { gauges, hours } });
    expect(place.side).toBe("left");
    expect(place.left + size.width).toBeLessThan(1100);
  });

  it("never covers the gauges", () => {
    const place = placePopover({ anchor: { x: 60, y: 400 }, size, viewport, avoid: { gauges, hours } });
    expect(overlaps({ ...place, width: size.width, height: place.height }, gauges)).toBe(false);
  });

  it("never covers the hour blocks", () => {
    const place = placePopover({ anchor: { x: 500, y: 700 }, size, viewport, avoid: { gauges, hours } });
    expect(overlaps({ ...place, width: size.width, height: place.height }, hours)).toBe(false);
  });

  it("shrinks to fit and scrolls when too tall", () => {
    const tall = { width: 280, height: 2000 };
    const place = placePopover({ anchor: { x: 600, y: 400 }, size: tall, viewport, avoid: { gauges, hours } });
    expect(place.top).toBeGreaterThanOrEqual(0);
    expect(place.top + place.height).toBeLessThanOrEqual(hours.top);
    expect(place.height).toBeLessThan(2000);
  });
});

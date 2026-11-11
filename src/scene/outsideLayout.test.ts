import { describe, expect, it } from "vitest";
import { FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";
import {
  cityBlocks,
  FRONT_ROAD_Z,
  isInFront,
  isOfficeBlock,
  isParkBlock,
  LOT_SOUTH,
  SIDE_ROAD_X,
} from "./outsideLayout";

describe("the city grid", () => {
  it("has exactly one office block, and it holds the whole office and car park", () => {
    const office = cityBlocks().filter(isOfficeBlock);
    expect(office).toHaveLength(1);
    const [block] = office;
    expect(block.west).toBeLessThan(-0.5);
    expect(block.north).toBeLessThan(-0.5);
    expect(block.east).toBeGreaterThan(FLOOR_WIDTH - 0.5);
    expect(block.south).toBeGreaterThan(Math.max(FLOOR_DEPTH - 0.5, LOT_SOUTH));
  });

  it("has exactly one park, which is not the office block", () => {
    const parks = cityBlocks().filter(isParkBlock);
    expect(parks).toHaveLength(1);
    expect(isOfficeBlock(parks[0])).toBe(false);
  });

  it("keeps buildings low only in blocks the camera sees in front of the office", () => {
    for (const block of cityBlocks()) {
      // North of the office, or west of it beside its own block.
      const behind = block.south <= 0 || (block.east <= 0 && block.south <= FRONT_ROAD_Z);
      if (behind) expect(isInFront(block), JSON.stringify(block)).toBe(false);
    }
    const eastOfOffice = cityBlocks().find((b) => b.west === SIDE_ROAD_X && b.north < 0 && b.south > 0);
    expect(eastOfOffice && isInFront(eastOfOffice)).toBe(true);
  });
});

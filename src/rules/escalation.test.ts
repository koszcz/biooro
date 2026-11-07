import { describe, expect, it } from "vitest";
import { tierOf } from "./index";

describe("tierOf", () => {
  it("is Mundane from 0 to 2, Odd from 3 to 4 and Wrong from 5", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 12].map(tierOf)).toEqual([
      "mundane",
      "mundane",
      "mundane",
      "odd",
      "odd",
      "wrong",
      "wrong",
      "wrong",
    ]);
  });
});

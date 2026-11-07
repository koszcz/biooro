import { describe, expect, it } from "vitest";
import { compileInk } from "./ink.ts";
import { addLineIds, checkLineIds } from "./line-ids.ts";

const file = (name: string, lines: string[]) => ({ name, text: `${lines.join("\n")}\n` });

describe("checkLineIds", () => {
  it("passes when every line of text has an id", () => {
    const story = file("halina.ink", [
      "// A comment needs no id.",
      "INCLUDE other.ink",
      "EXTERNAL tier()",
      "=== halina_monday ===",
      "= opening",
      "~ temp mood = 1",
      "Good morning. #id:halina.monday.1",
      '{ tier() == "wrong":',
      "  The filing cabinet hums. #id:halina.monday.2",
      "- else:",
      "  Sign here. #id:halina.monday.3",
      "}",
      "* [Ask about forms #id:halina.monday.4] -> forms",
      "+ Leave #id:halina.monday.5",
      "-",
      "- (done)",
      "-> END",
    ]);
    expect(checkLineIds([story])).toEqual([]);
  });

  it("fails a line of text with no id", () => {
    const story = file("halina.ink", ["=== halina_monday ===", "Good morning.", "* [Ask] -> END"]);
    expect(checkLineIds([story])).toEqual([
      "halina.ink:2 has no #id: tag: Good morning.",
      "halina.ink:3 has no #id: tag: * [Ask] -> END",
    ]);
  });

  it("fails an id used twice, across files", () => {
    const first = file("a.ink", ["Hello. #id:same"]);
    const second = file("b.ink", ["Hi. #id:same"]);
    expect(checkLineIds([first, second])).toEqual(["b.ink:1 repeats #id:same from a.ink:1"]);
  });

  it("skips lines inside block comments", () => {
    expect(checkLineIds([file("a.ink", ["/* Notes", "for writers */", "Hi. #id:a.1"])])).toEqual([]);
  });
});

describe("addLineIds", () => {
  it("adds a new id to each line of text that has none, by file and knot", () => {
    const story = file("halina.ink", [
      "Before any knot.",
      "=== halina_monday ===",
      "Good morning. #id:halina.halina_monday.1",
      "Sign here. // ask twice",
      "Then go. -> END",
      "* [Ask about forms] -> END",
      "* Leave",
    ]);
    expect(addLineIds(story, new Set(["halina.halina_monday.1"]))).toBe(
      `${[
        "Before any knot. #id:halina.top.1",
        "=== halina_monday ===",
        "Good morning. #id:halina.halina_monday.1",
        "Sign here. #id:halina.halina_monday.2 // ask twice",
        "Then go. #id:halina.halina_monday.3 -> END",
        "* [Ask about forms #id:halina.halina_monday.4] -> END",
        "* Leave #id:halina.halina_monday.5",
      ].join("\n")}\n`,
    );
  });

  it("writes Ink that still compiles and passes the check", () => {
    const story = file("main.ink", ["Hi. -> knot", "=== knot ===", "* [Ask] Answer.", "* Leave", "- -> END"]);
    const fixed = { name: story.name, text: addLineIds(story, new Set()) };
    expect(checkLineIds([fixed])).toEqual([]);
    expect(compileInk(fixed.name, fixed.text).errors).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { checkAudio } from "./audio.ts";

describe("checkAudio", () => {
  it("passes when every manifest entry has a file", () => {
    expect(checkAudio({ hum: "hum.wav", blip: "blip.wav" }, () => true)).toEqual([]);
  });

  it("names each manifest entry whose file is missing", () => {
    const errors = checkAudio({ hum: "hum.wav", blip: "blip.wav" }, (file) => file !== "blip.wav");
    expect(errors).toEqual(['"blip" needs public/audio/blip.wav, but the file is missing']);
  });

  it("passes for the real manifest and folder", () => {
    expect(checkAudio()).toEqual([]);
  });
});

import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { glbPaths } from "./models";

const publicPath = (path: string) => new URL(`../../public/${path}`, import.meta.url);

describe("glbPaths", () => {
  it("lists every person's base model and the glasses the cast wear", () => {
    const paths = glbPaths();
    for (const name of [
      "character-male-c",
      "character-male-d",
      "character-male-a",
      "character-female-b",
      "character-female-e",
      "character-male-f",
      "aid-glasses",
      "aid-sunglasses",
    ])
      expect(paths).toContain(`models/characters/${name}.glb`);
  });

  it("lists every furniture model in the layout and the Intern", () => {
    const paths = glbPaths();
    expect(paths).toContain("models/furniture/desk.glb");
    expect(paths).toContain("models/furniture/toiletSquare.glb");
    expect(paths).toContain("models/characters/character-male-c.glb");
    expect(paths.some((p) => p.includes("printer"))).toBe(false);
  });

  it("names only files that exist in public/", () => {
    for (const path of glbPaths()) expect(existsSync(publicPath(path)), path).toBe(true);
  });

  it("ships only the GLB files the game loads", () => {
    const shipped = (folder: string) =>
      readdirSync(publicPath(`models/${folder}`))
        .filter((f) => f.endsWith(".glb"))
        .map((f) => `models/${folder}/${f}`);
    const folders = ["furniture", "characters", "roads", "cars", "city"];
    expect(folders.flatMap(shipped).sort()).toEqual([...glbPaths()].sort());
  });

  it("ships the colour map each textured kit needs beside its models", () => {
    for (const folder of ["characters", "roads", "cars", "city"])
      expect(existsSync(publicPath(`models/${folder}/Textures/colormap.png`)), folder).toBe(true);
  });
});

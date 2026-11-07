import { Group, type Mesh, type MeshStandardMaterial, type Object3D } from "three";
import { describe, expect, it } from "vitest";
import { COLLEAGUE_SPOTS } from "../content/index";
import { createCast } from "./cast";
import type { CharacterModel, ModelLibrary } from "./models";

// A stand-in Mini Character: a model with the bones the cast extras hang on.
function fakeModels(): ModelLibrary & { loaded: CharacterModel[] } {
  const loaded: CharacterModel[] = [];
  return {
    loaded,
    furniture: () => new Group(),
    character: (name) => {
      loaded.push(name);
      const model = new Group();
      for (const bone of ["torso", "head", "arm-right"]) {
        const part = new Group();
        part.name = bone;
        model.add(part);
      }
      return { model, clips: [] };
    },
    accessory: (name) => {
      const glasses = new Group();
      glasses.name = name;
      return glasses;
    },
  };
}

const named = (root: Object3D, name: string): Object3D[] => {
  const found: Object3D[] = [];
  root.traverse((o) => {
    if (o.name === name) found.push(o);
  });
  return found;
};

const colourOf = (root: Object3D, name: string) =>
  `#${((named(root, name)[0] as Mesh).material as MeshStandardMaterial).color.getHexString()}`;

describe("createCast", () => {
  it("puts the five cast members at their spots, each on a different base model", () => {
    const models = fakeModels();
    const cast = createCast(models);
    expect(Object.keys(cast).sort()).toEqual(["halina", "kamil", "ryszard", "wiola", "zbigniew"]);
    expect(new Set(models.loaded).size).toBe(5);
    expect(models.loaded).not.toContain("character-male-c"); // the Intern's model
    expect(cast.zbigniew.root.position.x).toBe(1);
    expect(cast.zbigniew.root.position.z).toBeCloseTo(4.5);
    expect(cast.wiola.root.position.x).toBe(COLLEAGUE_SPOTS.wiola.cell.col);
    expect(cast.wiola.root.position.z).toBe(COLLEAGUE_SPOTS.wiola.cell.row);
  });

  it("makes the Bosses 12% taller and lifts seated people 0.13 units", () => {
    const cast = createCast(fakeModels());
    expect(cast.zbigniew.root.scale.y).toBeCloseTo(1.12);
    expect(cast.halina.root.scale.y).toBeCloseTo(1.12);
    expect(cast.ryszard.root.scale.y).toBe(1);
    expect(cast.kamil.root.position.y).toBeCloseTo(0.13);
    expect(cast.ryszard.root.position.y).toBeCloseTo(0.13);
    expect(cast.wiola.root.position.y).toBe(0);
  });

  it("dresses the Launch Team in teal vests with lanyards and the Paper Trail in manila vests with folders", () => {
    const cast = createCast(fakeModels());
    for (const id of ["zbigniew", "ryszard", "wiola"] as const) {
      expect(colourOf(cast[id].root, "vest")).toBe("#18b6c8");
      expect(named(cast[id].root, "lanyard")).toHaveLength(1);
      expect(named(cast[id].root, "folder")).toHaveLength(0);
    }
    for (const id of ["halina", "kamil"] as const) {
      expect(colourOf(cast[id].root, "vest")).toBe("#c9ab6b");
      expect(named(cast[id].root, "folder")).toHaveLength(1);
      expect(named(cast[id].root, "lanyard")).toHaveLength(0);
    }
  });

  it("gives Pogodny a tie, Teczka glasses and a recording light, and Przeciek sunglasses", () => {
    const cast = createCast(fakeModels());
    expect(colourOf(cast.zbigniew.root, "tie")).toBe("#0b3d44");
    expect(named(cast.halina.root, "aid-glasses")).toHaveLength(1);
    expect(named(cast.halina.root, "recordingLight")).toHaveLength(1);
    expect(named(cast.kamil.root, "aid-sunglasses")).toHaveLength(1);
    for (const id of ["ryszard", "wiola"] as const) {
      for (const extra of ["tie", "aid-glasses", "aid-sunglasses", "recordingLight"])
        expect(named(cast[id].root, extra)).toHaveLength(0);
    }
  });

  it("blinks Teczka's recording light", () => {
    const cast = createCast(fakeModels());
    const light = named(cast.halina.root, "recordingLight")[0] as Mesh;
    const glow = () => (light.material as MeshStandardMaterial).emissiveIntensity;
    cast.halina.update(0.01, 0.1);
    const on = glow();
    cast.halina.update(0.01, 0.6);
    expect(glow()).not.toBe(on);
  });

  it("faces each person toward the camera, and turns them to face a point", () => {
    const cast = createCast(fakeModels());
    expect(cast.ryszard.root.rotation.y).toBe(0);
    const { x, z } = cast.ryszard.root.position;
    cast.ryszard.faceToward({ x: x + 2, z });
    expect(cast.ryszard.root.rotation.y).toBeCloseTo(Math.PI / 2);
    cast.ryszard.faceToward({ x, z: z - 3 });
    expect(Math.abs(cast.ryszard.root.rotation.y)).toBeCloseTo(Math.PI);
    cast.ryszard.faceHome();
    expect(cast.ryszard.root.rotation.y).toBe(0);
  });
});

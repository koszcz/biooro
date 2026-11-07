// Box parts that people wear: vests, lanyards, folders, ties and Teczka's recording light.
// Sizes and offsets follow prototype/office-look/src/art.ts. Parts are chamfered boxes, like the kit's.
// Faction colours apply to people only, so vests, badges and ties take a colour. Every other part uses a kit material.
import { type BufferGeometry, type Material, Mesh, MeshStandardMaterial, type Object3D, SphereGeometry } from "three";
import { chamferedBox, type KitMaterial, kitMaterial } from "./kit";
import type { Character } from "./models";

type Vec3 = [number, number, number];

/** Finds a bone of a Mini Character by name, such as "torso" or "head". */
export function bone(character: Character, name: string): Object3D | undefined {
  let found: Object3D | undefined;
  character.model.traverse((o) => {
    if (o.name === name) found = o;
  });
  return found;
}

/** Bevel for worn parts. They are a few centimetres thick, so the kit's bevel would round them off. */
const WORN_BEVEL = 0.006;

/** A Faction colour or cast cue, lit like a kit material: roughness 1, metalness 0 and flat shading. */
const castColour = (color: string) =>
  new MeshStandardMaterial({ color, roughness: 1, metalness: 0, flatShading: true });

const materialOf = (look: string | KitMaterial): Material =>
  look.startsWith("#") ? castColour(look) : kitMaterial(look as KitMaterial);

function part(
  parent: Object3D | undefined,
  name: string,
  geometry: BufferGeometry,
  look: string | KitMaterial,
  position: Vec3,
  material: Material = materialOf(look),
): Mesh {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent?.add(mesh);
  return mesh;
}

const box = (w: number, h: number, d: number) => chamferedBox(w, h, d, WORN_BEVEL);

// The torso bone sits at the hip, so torso offsets are in torso space.

/** A box vest over the torso, with an optional stripe. It is the loudest Faction cue. */
export function addVest(character: Character, color: string, stripe?: string): void {
  const torso = bone(character, "torso");
  part(torso, "vest", box(0.3, 0.19, 0.32), color, [0, 0.09, -0.02]);
  if (stripe) part(torso, "stripe", box(0.31, 0.03, 0.33), stripe, [0, 0.07, -0.02]);
}

/** A white lanyard with a badge on the chest. */
export function addLanyard(character: Character, badge: string): void {
  const torso = bone(character, "torso");
  const lanyard = part(torso, "lanyard", box(0.03, 0.14, 0.01), "carpetWhite", [0, 0.2, 0.115]);
  part(lanyard, "badge", box(0.09, 0.1, 0.012), badge, [0, -0.09, 0.005]);
}

/** A pale folder with a red tab, held in the right hand. */
export function addFolder(character: Character): void {
  const arm = bone(character, "arm-right");
  const folder = part(arm, "folder", box(0.14, 0.02, 0.2), "lamp", [-0.03, -0.12, 0.1]);
  part(folder, "folderTab", box(0.1, 0.022, 0.08), "carpet", [0, 0, -0.07]);
}

export function addTie(character: Character, color: string): void {
  part(bone(character, "torso"), "tie", box(0.05, 0.16, 0.014), color, [0, 0.14, 0.12]);
}

/** Teczka's red recording light. The caller blinks it. */
export function addRecordingLight(character: Character): Mesh {
  return part(
    bone(character, "torso"),
    "recordingLight",
    new SphereGeometry(0.025, 8, 6),
    "#ff2020",
    [0.07, 0.2, 0.125],
    new MeshStandardMaterial({
      color: "#ff2020",
      roughness: 1,
      flatShading: true,
      emissive: "#ff0000",
      emissiveIntensity: 2,
    }),
  );
}

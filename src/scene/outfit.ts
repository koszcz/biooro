// Box parts that people wear: vests, lanyards, folders, ties and Teczka's recording light.
// Sizes and offsets follow prototype/office-look/src/art.ts. Faction colours apply to people only.
import {
  BoxGeometry,
  type BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  type Object3D,
  SphereGeometry,
} from "three";
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

function part(
  parent: Object3D | undefined,
  name: string,
  geometry: BufferGeometry,
  color: string,
  position: Vec3,
  extra: MeshStandardMaterialParameters = {},
): Mesh {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...extra }));
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  parent?.add(mesh);
  return mesh;
}

// The torso bone sits at the hip, so torso offsets are in torso space.

/** A box vest over the torso, with an optional stripe. It is the loudest Faction cue. */
export function addVest(character: Character, color: string, stripe?: string): void {
  const torso = bone(character, "torso");
  part(torso, "vest", new BoxGeometry(0.3, 0.19, 0.32), color, [0, 0.09, -0.02]);
  if (stripe) part(torso, "stripe", new BoxGeometry(0.31, 0.03, 0.33), stripe, [0, 0.07, -0.02]);
}

/** A white lanyard with a badge on the chest. */
export function addLanyard(character: Character, badge: string): void {
  const torso = bone(character, "torso");
  const lanyard = part(torso, "lanyard", new BoxGeometry(0.03, 0.14, 0.01), "#ffffff", [0, 0.2, 0.115]);
  part(lanyard, "badge", new BoxGeometry(0.09, 0.1, 0.012), badge, [0, -0.09, 0.005]);
}

/** A manila folder with a red tab, held in the right hand. */
export function addFolder(character: Character): void {
  const arm = bone(character, "arm-right");
  const folder = part(arm, "folder", new BoxGeometry(0.14, 0.02, 0.2), "#e2c67e", [-0.03, -0.12, 0.1]);
  part(folder, "folderTab", new BoxGeometry(0.1, 0.022, 0.08), "#c23b3b", [0, 0, -0.07]);
}

export function addTie(character: Character, color: string): void {
  part(bone(character, "torso"), "tie", new BoxGeometry(0.05, 0.16, 0.014), color, [0, 0.14, 0.12]);
}

/** Teczka's red recording light. The caller blinks it. */
export function addRecordingLight(character: Character): Mesh {
  return part(
    bone(character, "torso"),
    "recordingLight",
    new SphereGeometry(0.025, 8, 6),
    "#ff2020",
    [0.07, 0.2, 0.125],
    {
      emissive: "#ff0000",
      emissiveIntensity: 2,
    },
  );
}

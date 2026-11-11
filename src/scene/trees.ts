// A simple tree built from chamfered boxes in kit materials, for the park. The kits we use have no trees.
// It follows docs/art/making-assets.md: a dark wood trunk and two leafy blocks, origin at the base centre.
import { Group, Mesh } from "three";
import type { Instancer } from "./instancing";
import { chamferedBox, kitMaterial } from "./kit";

let template: Group | undefined;

/** One tree, about 2.4 tall at scale 1: well above the 1.3-tall office walls, like a real street tree. */
function tree(): Group {
  if (template) return template;
  template = new Group();
  const trunk = new Mesh(chamferedBox(0.22, 0.9, 0.22, 0.03), kitMaterial("woodDark"));
  trunk.position.y = 0.45;
  const crown = new Mesh(chamferedBox(1.1, 0.9, 1.1, 0.06), kitMaterial("plant"));
  crown.position.y = 1.25;
  const top = new Mesh(chamferedBox(0.7, 0.6, 0.7, 0.05), kitMaterial("plant"));
  top.position.y = 1.95;
  template.add(trunk, crown, top);
  return template;
}

export function addTree(instancer: Instancer, x: number, z: number, scale = 1): void {
  instancer.add("tree", tree, { x, z, scale, turn: (x * 7 + z * 3) % Math.PI });
}

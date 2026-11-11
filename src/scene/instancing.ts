// Draws many copies of the same outside model with one draw call per mesh, so a whole city stays cheap.
// Copies placed here never move. Moving things, such as cars, stay ordinary objects.
import { type BufferGeometry, Group, InstancedMesh, type Material, Matrix4, Mesh, type Object3D, Vector3 } from "three";

/** Where one copy goes: its spot on the ground, its turn about the vertical, and its size. */
export type Placement = { x: number; z: number; turn?: number; scale?: number; y?: number };

type Part = { geometry: BufferGeometry; material: Material | Material[]; local: Matrix4 };

export type Instancer = {
  /** Places one copy of `template`. Copies of the same template share their meshes. */
  add(key: string, template: () => Object3D, at: Placement): void;
  /** Builds every copy added so far into one group. */
  build(): Group;
};

export function createInstancer(): Instancer {
  const kinds = new Map<string, { parts: Part[]; spots: Matrix4[] }>();
  const up = new Vector3(0, 1, 0);

  const partsOf = (root: Object3D): Part[] => {
    root.updateMatrixWorld(true);
    const parts: Part[] = [];
    root.traverse((o) => {
      if (o instanceof Mesh) parts.push({ geometry: o.geometry, material: o.material, local: o.matrixWorld.clone() });
    });
    return parts;
  };

  return {
    add(key, template, at) {
      let kind = kinds.get(key);
      if (!kind) {
        kind = { parts: partsOf(template()), spots: [] };
        kinds.set(key, kind);
      }
      const scale = at.scale ?? 1;
      const spot = new Matrix4()
        .makeRotationAxis(up, at.turn ?? 0)
        .scale(new Vector3(scale, scale, scale))
        .setPosition(at.x, at.y ?? 0, at.z);
      kind.spots.push(spot);
    },
    build() {
      const group = new Group();
      const matrix = new Matrix4();
      for (const { parts, spots } of kinds.values())
        for (const part of parts) {
          const mesh = new InstancedMesh(part.geometry, part.material, spots.length);
          spots.forEach((spot, i) => {
            mesh.setMatrixAt(i, matrix.multiplyMatrices(spot, part.local));
          });
          mesh.castShadow = true;
          mesh.raycast = () => {};
          // Copies spread over the whole city, so the mesh's own bounds would cull them wrongly.
          mesh.frustumCulled = false;
          group.add(mesh);
        }
      return group;
    },
  };
}

/** The first mesh material in a kit model. Kit models share one material across all their meshes. */
export function firstMaterial(model: Object3D): Material {
  let material: Material | undefined;
  model.traverse((o) => {
    if (o instanceof Mesh) material ??= o.material as Material;
  });
  if (!material) throw new Error(`${model.name} has no mesh`);
  return material;
}

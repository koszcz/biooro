// Loads every GLB at boot and hands out copies. Furniture comes from the Kenney Furniture Kit,
// people from Kenney Mini Characters. The files live in public/models/.
import type { AnimationClip, Group, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { FURNITURE, type KitModel } from "../content/index";

/** Kenney Mini Characters models the office uses. Each person has a different base model. */
const CHARACTERS = [
  "character-male-c",
  "character-male-d",
  "character-male-a",
  "character-female-b",
  "character-female-e",
  "character-male-f",
] as const;
export type CharacterModel = (typeof CHARACTERS)[number];
export const INTERN_MODEL: CharacterModel = "character-male-c";

/** Mini Characters accessories the cast wear on their heads. */
const ACCESSORIES = ["aid-glasses", "aid-sunglasses"] as const;
export type AccessoryModel = (typeof ACCESSORIES)[number];

const furnitureModels = (): KitModel[] => [
  ...new Set(FURNITURE.flatMap((p) => (p.model === "printer" ? [] : [p.model]))),
];

/** Every GLB the game loads at boot, as paths under public/. */
export function glbPaths(): string[] {
  return [
    ...furnitureModels().map((name) => `models/furniture/${name}.glb`),
    ...[...CHARACTERS, ...ACCESSORIES].map((name) => `models/characters/${name}.glb`),
  ];
}

export type Character = { model: Group; clips: AnimationClip[] };

export type ModelLibrary = {
  furniture(name: KitModel): Object3D;
  character(name: CharacterModel): Character;
  accessory(name: AccessoryModel): Object3D;
};

/** Loads every GLB. `onProgress` gets the share loaded so far, from 0 to 1. */
export async function loadModels(onProgress: (share: number) => void): Promise<ModelLibrary> {
  const loader = new GLTFLoader();
  const paths = glbPaths();
  const loaded = new Map<string, { scene: Group; animations: AnimationClip[] }>();
  let done = 0;
  onProgress(0);
  await Promise.all(
    paths.map(async (path) => {
      const gltf = await loader.loadAsync(`${import.meta.env.BASE_URL}${path}`);
      gltf.scene.traverse((o) => {
        o.castShadow = true;
        o.receiveShadow = true;
      });
      loaded.set(path, gltf);
      done += 1;
      onProgress(done / paths.length);
    }),
  );
  const get = (path: string) => {
    const gltf = loaded.get(path);
    if (!gltf) throw new Error(`${path} was not loaded at boot`);
    return gltf;
  };
  return {
    furniture: (name) => get(`models/furniture/${name}.glb`).scene.clone(true),
    character: (name) => {
      const gltf = get(`models/characters/${name}.glb`);
      return { model: cloneSkinned(gltf.scene) as Group, clips: gltf.animations };
    },
    accessory: (name) => cloneSkinned(get(`models/characters/${name}.glb`).scene),
  };
}

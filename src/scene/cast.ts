// The five cast members at their Colleague spots, each with a base model, a Faction vest and a prop.
// The lineup follows prototype/office-look/src/art.ts.
import { type AnimationAction, AnimationMixer, Group, type MeshStandardMaterial, type Object3D } from "three";
import { type CastId, COLLEAGUE_SPOTS } from "../content";
import { SEAT_LIFT } from "./intern";
import type { AccessoryModel, CharacterModel, ModelLibrary } from "./models";
import { addFolder, addLanyard, addRecordingLight, addTie, addVest, bone } from "./outfit";
import type { FloorPoint } from "./walker";

/** Bosses stand 12% taller than everyone else. */
export const BOSS_SCALE = 1.12;

const LAUNCH_TEAM = { vest: "#18b6c8", badge: "#0b6f7a" };
const PAPER_TRAIL = { vest: "#c9ab6b" };

type CastLook = {
  model: CharacterModel;
  faction: "launchTeam" | "paperTrail";
  boss?: boolean;
  /** Turn around the vertical axis at the spot. 0 faces the camera side (+z). */
  facing: number;
  tie?: string;
  glasses?: AccessoryModel;
  recordingLight?: boolean;
};

const LOOKS: Readonly<Record<CastId, CastLook>> = {
  zbigniew: { model: "character-male-d", faction: "launchTeam", boss: true, facing: 0, tie: "#0b3d44" },
  ryszard: { model: "character-male-a", faction: "launchTeam", facing: 0 },
  wiola: { model: "character-female-b", faction: "launchTeam", facing: 0 },
  halina: {
    model: "character-female-e",
    faction: "paperTrail",
    boss: true,
    facing: 0,
    glasses: "aid-glasses",
    recordingLight: true,
  },
  kamil: { model: "character-male-f", faction: "paperTrail", facing: 0, glasses: "aid-sunglasses" },
};

export type CastMember = {
  readonly id: CastId;
  readonly root: Group;
  /** Turns the person to face a point on the floor. */
  faceToward(point: FloorPoint): void;
  /** Turns the person back to their set direction. */
  faceHome(): void;
  update(seconds: number, elapsed: number): void;
};

export type Cast = Readonly<Record<CastId, CastMember>>;

const ignoreClicks = (o: Object3D) => {
  o.raycast = () => {};
};

function createMember(models: ModelLibrary, id: CastId): CastMember {
  const look = LOOKS[id];
  const spot = COLLEAGUE_SPOTS[id];
  const character = models.character(look.model);
  if (look.faction === "launchTeam") {
    addVest(character, LAUNCH_TEAM.vest);
    addLanyard(character, LAUNCH_TEAM.badge);
  } else {
    addVest(character, PAPER_TRAIL.vest);
    addFolder(character);
  }
  if (look.tie) addTie(character, look.tie);
  if (look.glasses) {
    const glasses = models.accessory(look.glasses);
    // The head bone sits at the chin, so lift the glasses to the eyes and out in front of the face.
    glasses.position.set(0, 0.07, 0.1);
    bone(character, "head")?.add(glasses);
  }
  const light = look.recordingLight ? addRecordingLight(character) : undefined;

  const root = new Group();
  root.name = id;
  root.add(character.model);
  root.position.set(spot.cell.col, spot.seated ? SEAT_LIFT : 0, spot.cell.row + (spot.offset?.z ?? 0));
  root.scale.setScalar(look.boss ? BOSS_SCALE : 1);
  root.rotation.y = look.facing;
  root.traverse(ignoreClicks);

  const mixer = new AnimationMixer(character.model);
  const clip = character.clips.find((c) => c.name === (spot.seated ? "sit" : "idle"));
  const action: AnimationAction | undefined = clip && mixer.clipAction(clip);
  action?.play();

  return {
    id,
    root,
    faceToward(point) {
      root.rotation.y = Math.atan2(point.x - root.position.x, point.z - root.position.z);
    },
    faceHome() {
      root.rotation.y = look.facing;
    },
    update(seconds, elapsed) {
      if (light) (light.material as MeshStandardMaterial).emissiveIntensity = Math.sin(elapsed * 6) > 0 ? 2.5 : 0.2;
      mixer.update(seconds);
    },
  };
}

export function createCast(models: ModelLibrary): Cast {
  const ids = Object.keys(LOOKS) as CastId[];
  return Object.fromEntries(ids.map((id) => [id, createMember(models, id)])) as Record<CastId, CastMember>;
}

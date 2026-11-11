// The world outside the office: a ground plane that fades into fog. Nothing out here is interactive.
// The fog takes the tier's background colour, so the ground's far edge melts into the sky.
import { Fog, Group, Mesh, PlaneGeometry } from "three";
import { FLOOR_DEPTH, FLOOR_WIDTH } from "./floor";
import { kitMaterial } from "./kit";

/** How far the ground reaches from the office centre in each direction. */
const GROUND_HALF_SIZE = 90;
/** The ground sits just under the office floor, so the two never flicker. */
const GROUND_Y = -0.02;
/** Where the fog starts and ends, measured along the camera's view from the camera. The camera stands 50 away. */
export const FOG_NEAR = 58;
export const FOG_FAR = 95;

export function createSurroundings(): Group {
  const group = new Group();
  group.name = "surroundings";

  const geometry = new PlaneGeometry(GROUND_HALF_SIZE * 2, GROUND_HALF_SIZE * 2);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate((FLOOR_WIDTH - 1) / 2, GROUND_Y, (FLOOR_DEPTH - 1) / 2);
  const ground = new Mesh(geometry, kitMaterial("metalMedium"));
  ground.name = "ground";
  ground.receiveShadow = true;
  // Clicks pass through the ground. Only the office floor takes them.
  ground.raycast = () => {};
  group.add(ground);

  return group;
}

/** The fog for the outside. The tier look keeps its colour equal to the background. */
export const createFog = (): Fog => new Fog("#000000", FOG_NEAR, FOG_FAR);

// The Three.js stage for Task actions: walks the Intern and the Colleagues around the office and plays their clips.
import { type Cell, COLLEAGUE_SPOTS, type ColleagueId, FURNITURE, type Piece, PLACE_SPOTS } from "../content";
import type { Cast, CastMember } from "./cast";
import type { Intern, Pose } from "./intern";
import { cellAt, routeToCell, type WalkGoal } from "./routes";
import type { ActionGoal, ActionStage } from "./taskActions";
import type { FloorPoint } from "./walker";

const centreOf = (cell: Cell): FloorPoint => ({ x: cell.col, z: cell.row });

/** The chair at the Intern's desk, where desk Tasks happen. */
const DESK_CHAIR: Piece | undefined = FURNITURE.find(
  (piece) => piece.seat && piece.cell.col === PLACE_SPOTS.desk.cell.col && piece.cell.row === PLACE_SPOTS.desk.cell.row,
);

/** The cell someone stands on to reach the goal. */
function standCell(goal: ActionGoal): Cell {
  return "place" in goal ? PLACE_SPOTS[goal.place].stand : COLLEAGUE_SPOTS[goal.person].stand;
}

/** The thing itself, which people face while they work. */
function lookAt(goal: ActionGoal): FloorPoint {
  return centreOf("place" in goal ? PLACE_SPOTS[goal.place].cell : COLLEAGUE_SPOTS[goal.person].cell);
}

const headingTo = (from: FloorPoint, to: FloorPoint) => Math.atan2(to.x - from.x, to.z - from.z);

const atHome = (member: CastMember) =>
  Math.hypot(member.walker.position.x - member.home.x, member.walker.position.z - member.home.z) < 1e-3;

/** The walk from where the Colleague is. A seated Colleague first steps to the cell beside their seat. */
function colleagueRoute(member: CastMember, goal: ActionGoal | "home"): FloorPoint[] | null {
  const spot = COLLEAGUE_SPOTS[member.id];
  const fromSeat = atHome(member) && spot.seated;
  const from = fromSeat ? spot.stand : cellAt(member.walker.position);
  const lead = fromSeat ? [centreOf(spot.stand)] : [];
  if (goal === "home") {
    const route = routeToCell(from, spot.stand);
    return route && [...lead, ...route, member.home];
  }
  const route = routeToCell(from, standCell(goal));
  return route && [...lead, ...route];
}

export function createActionStage(
  intern: Intern,
  walkIntern: (goal: WalkGoal, arrived: () => void) => void,
  cast: Cast,
): ActionStage {
  const rest = (member: CastMember) => {
    member.play(member.homePose);
    member.faceHome();
  };
  return {
    internTo(goal, arrived) {
      if ("place" in goal && goal.place === "desk" && DESK_CHAIR) walkIntern({ chair: DESK_CHAIR }, arrived);
      else walkIntern({ cell: standCell(goal) }, arrived);
    },
    internPlay(clip, toward) {
      // At the desk the Intern keeps facing the desk from the chair.
      const heading = toward && clip !== "sit" ? headingTo(intern.walker.position, lookAt(toward)) : undefined;
      intern.setPose(clip as Pose, heading);
    },
    handOff(colleague) {
      const member = cast[colleague];
      member.faceToward(intern.walker.position);
      intern.walker.heading = headingTo(intern.walker.position, member.walker.position);
      intern.setPose("idle");
      member.play("emote-yes");
    },
    colleagueTo(colleague: ColleagueId, goal, arrived) {
      const member = cast[colleague];
      const route = colleagueRoute(member, goal);
      const settle = () => {
        if (goal === "home") rest(member);
        else member.play("idle");
        arrived();
      };
      if (!route || route.length === 0) settle();
      else member.walker.walk(route, settle);
    },
    colleagueRest(colleague) {
      rest(cast[colleague]);
    },
    colleaguePlay(colleague, clip, toward) {
      const member = cast[colleague];
      if (toward) member.faceToward(lookAt(toward));
      member.play(clip as Pose);
    },
  };
}

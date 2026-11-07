// Delegating a Task to a Colleague: the goodwill cost, what each Colleague does with it, and when one refuses.
import { COLLEAGUES, type ColleagueId, type Faction, type LockedReason } from "../content/index";
import type { PressureDeltas } from "./pressures";
import type { GameState, OpenTask } from "./state";

/** What one Task choice does, before it applies. */
export interface ChoiceOutcome {
  deltas: PressureDeltas;
  /** The Faction the real work ends up serving, from the "Helping a Faction" table. */
  helps: Faction | null;
  finished: boolean;
  /** True when the Task returns later as Fallout. */
  causesFallout: boolean;
}

/** A Colleague's Faction needs at least this much goodwill before the Colleague takes a delegated Task. */
export const DELEGATION_TRUST = 5;

function sumDeltas(...parts: PressureDeltas[]): PressureDeltas {
  const total: PressureDeltas = {};
  for (const part of parts) {
    for (const [pressure, amount] of Object.entries(part) as [keyof PressureDeltas, number][]) {
      total[pressure] = (total[pressure] ?? 0) + amount;
    }
  }
  return total;
}

/** The "Delegating" table, built from its rules: the 1 goodwill cost, then what the Colleague does. */
export function delegationOutcome(side: Faction | null, colleagueId: ColleagueId): ChoiceOutcome {
  const colleague = COLLEAGUES[colleagueId];
  const cost: PressureDeltas = { [colleague.faction]: -1 };
  const performanceGain = side === "paperTrail" ? 0 : 1;
  switch (colleague.handling) {
    case "fakes":
      return {
        deltas: sumDeltas(cost, { performance: performanceGain }),
        helps: null,
        finished: true,
        causesFallout: true,
      };
    case "doesProperly":
      return {
        deltas: sumDeltas(cost, { performance: performanceGain }, side ? { [side]: 1 } : {}),
        helps: side,
        finished: true,
        causesFallout: false,
      };
    case "escalates": {
      // A Launch Team Task flips to the Paper Trail, which costs Launch Team 1 goodwill.
      // A Paper Trail Task is done properly. Either way the work serves the Paper Trail.
      const effect: PressureDeltas =
        side === "launchTeam" ? { launchTeam: -1 } : side === "paperTrail" ? { paperTrail: 1 } : {};
      return { deltas: sumDeltas(cost, effect), helps: "paperTrail", finished: true, causesFallout: false };
    }
  }
}

/** Why a Colleague refuses a delegated Task, or `null` when they take it. */
export function delegationLockedReason(state: GameState, task: OpenTask, colleague: ColleagueId): LockedReason | null {
  if (task.fallout && COLLEAGUES[colleague].handling === "fakes") return "ryszardAlreadyFaked";
  if (state.pressures[COLLEAGUES[colleague].faction] < DELEGATION_TRUST) return `${colleague}DoesntTrust`;
  return null;
}

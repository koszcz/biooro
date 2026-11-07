// Plays the scripted scenes the game starts: the Monday onboarding, the four Firings, the Friday audit and survival.
import type { CastId } from "../content/index";
import type { AuditAnswer, Pressure, SurvivalVariant } from "../rules/index";
import type { GameStore } from "../store/index";
import type { Dialogue, DialogueChoice } from "./bridge";
import { playDialogue, type TalkStage, type TalkView } from "./conversations";

export type ScriptedScene =
  | { kind: "onboarding" }
  | { kind: "firing"; pressure: Pressure }
  | { kind: "audit" }
  | { kind: "survival"; variant: SurvivalVariant };

/** The letterbox bars and title card. While the frame is open, the HUD, Task bubbles and badges hide. */
export interface SceneFrame {
  open(scene: ScriptedScene): void;
  close(): void;
}

/** The onboarding knot sets this flag at its end. Until then, Continue on Monday replays the onboarding. */
export const ONBOARDED_FLAG = "onboarded";

/** The Ink knot of each scripted scene. It also names the scene, for example in its title card. */
export type SceneKnot = "onboarding" | "audit" | `firing_${Pressure}` | `survival_${SurvivalVariant}`;

interface SceneSpec {
  knot: SceneKnot;
  /** The scene's main person. Lines without a speaker tag are theirs. */
  person: CastId;
  /** True when the main speaker is in the room, so the Intern walks beside them first. */
  walkUp: boolean;
}

const FIRING_PEOPLE: Record<Pressure, CastId> = {
  performance: "zbigniew",
  launchTeam: "ryszard",
  paperTrail: "halina",
  // The Intern walks out alone. Every line carries #speaker:intern.
  sanity: "zbigniew",
};

const SURVIVAL_PEOPLE: Record<SurvivalVariant, CastId> = {
  launchTeam: "zbigniew",
  paperTrail: "halina",
  // Nobody wins. Every line carries #speaker:intern.
  equal: "zbigniew",
};

export function sceneSpec(scene: ScriptedScene): SceneSpec {
  switch (scene.kind) {
    case "onboarding":
      return { knot: "onboarding", person: "zbigniew", walkUp: true };
    case "firing":
      return {
        knot: `firing_${scene.pressure}`,
        person: FIRING_PEOPLE[scene.pressure],
        walkUp: scene.pressure === "performance",
      };
    case "audit":
      return { knot: "audit", person: "halina", walkUp: false };
    case "survival":
      return { knot: `survival_${scene.variant}`, person: SURVIVAL_PEOPLE[scene.variant], walkUp: false };
  }
}

const AUDIT_ANSWERS: readonly AuditAnswer[] = ["bury", "escalate", "deflect"];

function auditAnswerOf(choice: DialogueChoice): AuditAnswer | undefined {
  return AUDIT_ANSWERS.find((answer) => choice.tags.some((tag) => tag.trim() === `audit:${answer}`));
}

export class Scenes {
  private queue: Promise<void> = Promise.resolve();
  private pending = 0;
  private auditQueued = false;
  /** The scene whose title card shows. */
  private framed: ScriptedScene | null = null;

  constructor(
    private readonly store: GameStore,
    private readonly dialogue: Dialogue,
    private readonly stage: TalkStage,
    private readonly view: TalkView,
    private readonly frame: SceneFrame,
  ) {
    store.on("dayStarted", () => this.queueOnboarding());
    store.on("fired", ({ pressure }) => this.enqueue({ kind: "firing", pressure }));
    store.on("weekSurvived", ({ variant }) => this.enqueue({ kind: "survival", variant }));
    // The Friday audit has no event. On Friday, the end-of-day steps run in the same command that spends
    // the last hour, so the phase is "audit" once that command returns.
    store.on("hoursChanged", ({ hoursLeft }) => {
      if (hoursLeft === 0) queueMicrotask(() => this.queueAudit());
    });
  }

  /** Resolves when every queued scene has played, including scenes queued while it waits. */
  get settled(): Promise<void> {
    return (async () => {
      let waited: Promise<void>;
      do {
        waited = this.queue;
        await waited;
        // The audit is queued in a microtask after the command that reached it.
        await Promise.resolve();
      } while (waited !== this.queue);
    })();
  }

  /** True from the moment a scene is queued until the last queued scene ends. */
  get playing(): boolean {
    return this.pending > 0;
  }

  /** After Continue: replays the scene the save stopped before. A Firing screen needs no scene. */
  resume(): void {
    this.queueOnboarding();
    this.queueAudit();
  }

  private queueOnboarding(): void {
    const { day, phase, flags } = this.store.state;
    if (day === 1 && phase.kind === "workday" && !flags.includes(ONBOARDED_FLAG)) this.enqueue({ kind: "onboarding" });
  }

  private queueAudit(): void {
    if (this.store.state.phase.kind !== "audit" || this.auditQueued) return;
    this.auditQueued = true;
    this.enqueue({ kind: "audit" });
  }

  private enqueue(scene: ScriptedScene): void {
    this.pending += 1;
    // The frame opens at once, so nothing behind it shows while an earlier scene or line finishes.
    if (this.pending === 1) this.openFrame(scene);
    this.queue = this.queue
      .then(() => this.play(scene))
      .catch((error: unknown) => console.error(error))
      .finally(() => {
        this.pending -= 1;
        if (this.pending > 0) return;
        this.framed = null;
        this.frame.close();
      });
  }

  private openFrame(scene: ScriptedScene): void {
    if (this.framed === scene) return;
    this.framed = scene;
    this.frame.open(scene);
  }

  private async play(scene: ScriptedScene): Promise<void> {
    this.openFrame(scene);
    const { knot, person, walkUp } = sceneSpec(scene);
    let answer: AuditAnswer | undefined;
    // The frame already locks input, so the scene starts once the Intern arrives.
    if (walkUp) await this.stage.walkBeside(person);
    const turnBack = walkUp ? this.stage.faceEachOther(person) : undefined;
    this.dialogue.start(person, knot, true);
    await playDialogue(this.dialogue, this.view, person, (choice) => {
      answer ??= auditAnswerOf(choice);
    });
    turnBack?.();
    if (scene.kind !== "audit") return;
    this.auditQueued = false;
    if (!answer) throw new Error('The "audit" knot ended without an #audit: answer.');
    // The answer applies after the scene ends, so the save never holds a half-played audit.
    this.store.answerAudit(answer);
  }
}

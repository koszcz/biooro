// The audio engine: raw Web Audio. It plays the music loops, the hum, the cues and the blips.
import type { CastId } from "../content/index";
import { type Tier, tierOf } from "../rules/index";
import type { GameStore } from "../store/index";
import { cueFor, musicLevels } from "./cues";
import type { SoundId } from "./manifest";

/** The slice of AudioContext the engine uses. Tests pass a fake. */
export type SoundContext = Pick<
  AudioContext,
  "createGain" | "createBufferSource" | "destination" | "currentTime" | "resume"
>;

export type Buffers = Readonly<Record<SoundId, AudioBuffer>>;
export type AudioStore = Pick<GameStore, "on" | "settings" | "updateSettings" | "state">;

/** Seconds a crossfade takes to settle. */
const FADE = 0.6;
const HUM_LEVEL = 0.35;

/** Each speaker's blip is the one sample, played at its own pitch. */
const BLIP_PITCH: Readonly<Record<CastId | "intern" | "headOffice", number>> = {
  intern: 1,
  headOffice: 0.6,
  zbigniew: 0.75,
  halina: 1.35,
  ryszard: 0.85,
  wiola: 1.6,
  kamil: 1.15,
};

export interface Audio {
  readonly muted: boolean;
  setMuted(muted: boolean): void;
  /** Plays `count` blips for `speaker`. */
  blip(speaker: keyof typeof BLIP_PITCH, count: number): void;
}

export function createAudio(store: AudioStore, ctx: SoundContext, buffers: Buffers): Audio {
  const master = ctx.createGain();
  master.connect(ctx.destination);
  let muted = store.settings.muted;
  master.gain.value = muted ? 0 : 1;

  const loop = (id: SoundId, level: number) => {
    const gain = ctx.createGain();
    gain.gain.value = level;
    gain.connect(master);
    const source = ctx.createBufferSource();
    source.buffer = buffers[id];
    source.loop = true;
    source.connect(gain);
    source.start();
    return gain;
  };

  const music = {
    clean: loop("music-clean", 0),
    odd: loop("music-odd", 0),
    wrong: loop("music-wrong", 0),
  };
  loop("hum", HUM_LEVEL);

  let tier: Tier = tierOf(store.state.escalation);
  let silenced = false;
  const fade = () => {
    const levels = musicLevels(tier, silenced);
    for (const variant of ["clean", "odd", "wrong"] as const) {
      music[variant].gain.setTargetAtTime(levels[variant], ctx.currentTime, FADE / 3);
    }
  };
  fade();

  const play = (id: SoundId, rate = 1) => {
    const source = ctx.createBufferSource();
    source.buffer = buffers[id];
    source.playbackRate.value = rate;
    source.connect(master);
    source.start();
  };

  store.on("tierChanged", (event) => {
    tier = event.tier;
    fade();
  });
  store.on("fired", () => {
    silenced = true;
    fade();
  });
  store.on("dayStarted", () => {
    silenced = false;
    fade();
  });
  for (const type of ["taskAssigned", "falloutArrived", "taskResolved", "pressureChanged", "fired", "dayEnded"] as const) {
    store.on(type, (event) => {
      const cue = cueFor(event);
      if (cue) play(cue);
    });
  }

  return {
    get muted() {
      return muted;
    },
    setMuted(value) {
      muted = value;
      master.gain.value = value ? 0 : 1;
      store.updateSettings({ muted: value });
    },
    blip(speaker, count) {
      for (let i = 0; i < count; i++) play("blip", BLIP_PITCH[speaker]);
    },
  };
}

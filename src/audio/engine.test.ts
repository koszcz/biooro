import { describe, expect, it } from "vitest";
import type { Settings, StoreEvent, StoreEventType } from "../store/index";
import { createAudio, type SoundContext } from "./engine";
import { AUDIO_MANIFEST, type SoundId } from "./manifest";

/** A recording stand-in for the Web Audio API. */
class FakeContext {
  currentTime = 0;
  readonly destination = { name: "destination" };
  readonly gains: FakeGain[] = [];
  readonly sources: FakeSource[] = [];
  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }
  createBufferSource() {
    const source = new FakeSource();
    this.sources.push(source);
    return source;
  }
  resume() {
    return Promise.resolve();
  }
}
class FakeParam {
  value = 1;
  targets: number[] = [];
  setTargetAtTime(target: number) {
    this.targets.push(target);
    this.value = target;
  }
  cancelScheduledValues() {}
}
class FakeGain {
  gain = new FakeParam();
  connect(next: unknown) {
    return next;
  }
}
class FakeSource {
  buffer: unknown;
  loop = false;
  started = false;
  playbackRate = new FakeParam();
  connect(next: unknown) {
    return next;
  }
  start() {
    this.started = true;
  }
}

/** A store with just what the audio needs: events, settings and the Escalation. */
class FakeStore {
  escalation = 0;
  settings: Settings;
  private readonly listeners: { type: StoreEventType; fn: (event: StoreEvent) => void }[] = [];
  constructor(readonly saved: { settings: Settings }) {
    this.settings = saved.settings;
  }
  get state() {
    return { escalation: this.escalation };
  }
  on(type: StoreEventType, fn: (event: never) => void) {
    this.listeners.push({ type, fn: fn as (event: StoreEvent) => void });
    return () => {};
  }
  update(changes: Partial<Settings>) {
    this.settings = { ...this.settings, ...changes };
    this.saved.settings = this.settings;
  }
  emit(event: StoreEvent) {
    for (const l of this.listeners) if (l.type === event.type) l.fn(event);
  }
}

function setup(saved = { settings: { muted: false } }) {
  const ctx = new FakeContext();
  const store = new FakeStore(saved);
  const buffers = Object.fromEntries(Object.keys(AUDIO_MANIFEST).map((id) => [id, { id }])) as Record<SoundId, never>;
  const audio = createAudio(store as never, store, ctx as unknown as SoundContext, buffers);
  const played = () => ctx.sources.filter((s) => s.started && !s.loop).map((s) => (s.buffer as { id: string }).id);
  const master = () => ctx.gains[0];
  return { ctx, store, audio, saved, played, master };
}

describe("createAudio", () => {
  it("plays the Task bubble sound when a Task arrives", () => {
    const { store, played } = setup();
    store.emit({ type: "taskAssigned", task: {} as never });
    expect(played()).toContain("bubble");
  });

  it("plays the Task bubble sound when a Fallout Task arrives", () => {
    const { store, played } = setup();
    store.emit({ type: "falloutArrived", task: {} as never });
    expect(played()).toEqual(["bubble"]);
  });

  it("plays the Task choice sound when the action resolves, not when it starts", () => {
    const { store, played } = setup();
    store.emit({ type: "taskActionStarted", task: {} as never, choice: "fake", hours: 1 });
    expect(played()).toEqual([]);
    store.emit({ type: "taskResolved", task: {} as never, choice: "fake" });
    expect(played()).toEqual(["choice-fake"]);
  });

  it("starts the music variants and the hum looping", () => {
    const { ctx } = setup();
    const looping = ctx.sources.filter((s) => s.loop && s.started).map((s) => (s.buffer as { id: string }).id);
    expect(looping.sort()).toEqual(["hum", "music-clean", "music-odd", "music-wrong"]);
  });

  it("plays one blip sound per request at the speaker's pitch", () => {
    const { ctx, audio } = setup();
    audio.blip("halina", 1);
    audio.blip("kamil", 1);
    const blips = ctx.sources.filter((s) => (s.buffer as { id: string } | undefined)?.id === "blip");
    expect(blips).toHaveLength(2);
    expect(blips[0]?.playbackRate.value).not.toBe(blips[1]?.playbackRate.value);
  });

  it("crossfades the music on a tier change", () => {
    const { ctx, store } = setup();
    const [, clean, odd, wrong] = ctx.gains;
    expect([clean?.gain.value, odd?.gain.value, wrong?.gain.value]).toEqual([1, 0, 0]);
    store.emit({ type: "tierChanged", tier: "odd" });
    expect([clean?.gain.value, odd?.gain.value, wrong?.gain.value]).toEqual([0, 1, 0]);
    store.emit({ type: "tierChanged", tier: "wrong" });
    expect([clean?.gain.value, odd?.gain.value, wrong?.gain.value]).toEqual([0, 0, 1]);
  });

  it("cuts the music for a Firing and brings it back the next day", () => {
    const { ctx, store } = setup();
    const [, clean] = ctx.gains;
    store.emit({ type: "fired", pressure: "sanity", retry: "day" } as never);
    expect(clean?.gain.value).toBe(0);
    store.emit({ type: "dayStarted", day: 1 });
    expect(clean?.gain.value).toBe(1);
  });

  it("silences everything when muted, and remembers it across reloads", () => {
    const first = setup();
    first.audio.setMuted(true);
    expect(first.master()?.gain.value).toBe(0);
    const second = setup(first.saved);
    expect(second.audio.muted).toBe(true);
    expect(second.master()?.gain.value).toBe(0);
    second.audio.setMuted(false);
    expect(second.master()?.gain.value).toBe(1);
  });
});

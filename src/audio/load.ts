// Loads every file in the manifest at boot, then starts the engine. The browser keeps the context
// suspended until the player first clicks or presses a key, so the first gesture resumes it.
import { type Audio, type AudioSettings, type AudioStore, type Buffers, createAudio } from "./engine";
import { AUDIO_MANIFEST, type SoundId } from "./manifest";

export async function loadAudio(store: AudioStore, settings: AudioSettings, baseUrl: string): Promise<Audio> {
  const ctx = new AudioContext();
  const ids = Object.keys(AUDIO_MANIFEST) as SoundId[];
  const decoded = await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(`${baseUrl}audio/${AUDIO_MANIFEST[id]}`);
      if (!response.ok) throw new Error(`Could not load audio file ${AUDIO_MANIFEST[id]}: ${response.status}`);
      return [id, await ctx.decodeAudioData(await response.arrayBuffer())] as const;
    }),
  );
  const resume = () => {
    void ctx.resume();
    window.removeEventListener("pointerdown", resume, true);
    window.removeEventListener("keydown", resume, true);
  };
  window.addEventListener("pointerdown", resume, true);
  window.addEventListener("keydown", resume, true);
  return createAudio(store, settings, ctx, Object.fromEntries(decoded) as Buffers);
}

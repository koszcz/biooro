// Every audio file the game loads, with its path under public/audio/. `npm run check:audio` checks each exists.
// This file imports nothing, so the check script can load it directly.

export const AUDIO_MANIFEST = {
  "music-clean": "music-clean.wav",
  "music-odd": "music-odd.wav",
  "music-wrong": "music-wrong.wav",
  hum: "hum.wav",
  bubble: "bubble.wav",
  "choice-do": "choice-do.wav",
  "choice-fake": "choice-fake.wav",
  "choice-delegate": "choice-delegate.wav",
  "choice-sabotage": "choice-sabotage.wav",
  "pressure-drop": "pressure-drop.wav",
  fired: "fired.wav",
  "day-end": "day-end.wav",
  blip: "blip.wav",
} as const;

export type SoundId = keyof typeof AUDIO_MANIFEST;

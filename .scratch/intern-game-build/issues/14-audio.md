# Audio

Status: ready-for-agent
Blocked by: 12

## What to build

Add the sound, in `src/audio/` with raw Web Audio.

- One typed manifest that lists every audio file in `public/audio/`, loaded at boot.
- One quiet muzak loop with three variants: clean, detuned and thin. A tier change crossfades between them. Pick one CC0 loop and make the two other variants once, offline, with a tool such as `sox` or `ffmpeg`. Commit the three files. Never generate sound in code.
- A looping office hum under the music. Firing scenes cut the music to silence.
- A sound for a Task bubble appearing, each Task choice, a Pressure drop, a Firing and the end of a day.
- A gibberish blip per character, at its own pitch, made from one sample. One blip plays per two revealed characters, and spaces make no blip.
- One mute button, stored in the settings record.
- The audio check in `npm run check`: it fails if a manifest entry has no file.

Use CC0 files only, such as the Kenney audio packs. Ask before you download anything. Say which file, from where and how large.

## Acceptance criteria

- [ ] Every sound the spec lists plays at the right moment, and mute silences all of it across reloads.
- [ ] A tier change crossfades the music.
- [ ] `npm run check` passes, and fails when you delete a file the manifest lists.

## Spec

- [8. Audio](../../intern-game/spec.md#8-audio).

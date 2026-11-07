# Audio

Type: grilling
Status: resolved
Blocked by:

## Question

What does the slice sound like? Decide:
- Music: none, one looping track, or a track that changes with Escalation.
- Sound effects: which events get one (Task choices, Pressure changes, Firings, speech bubbles, footsteps).
- Voice: none, mumbled gibberish per character, or full voice. Text is English only and translation-ready.
- Sourcing: free or CC0 assets, or generated in code. Match the asset policy from the Free low-poly office assets decision.
- Tech: how audio fits the typed events and file boundaries in the locked tech plan. Browser autoplay rules apply.

The tone is mundane with a sinister leak. The palette greys with Escalation, so audio may follow it.

## Answer

### Music

- One quiet muzak loop plays in the office.
- The loop has three pre-made variants: clean, detuned, and thin. Each Escalation tier crossfades to its variant. There is no live audio processing.
- Firing scenes drop the music to silence.
- A looping office hum plays under the music.

### Sound effects

- These events get a sound: a speech bubble appearing, each of the four Task choices, a Pressure drop, a Firing, and the end of a day.
- Footsteps and Pressure gains get no sound.

### Voice

- No voice acting. Each character gets a short gibberish blip as their text appears. Each character has a different pitch.
- One blip plays per two revealed characters.
- Ink lines carry no audio tags.

### Sourcing

- Use CC0 files only, such as the Kenney audio packs. This matches the asset policy in [Free low-poly office assets](05-free-office-assets.md).
- The muzak loop also comes from a CC0 source.
- All blips come from one sample, pitched per character.
- Nothing is generated in code.

### Player controls

- One mute button. There are no volume sliders.
- The loading screen's Start button unlocks audio, so browser autoplay rules are met.

### Tech

- Use raw Web Audio inside one module. Add no audio library.
- A new `src/audio/` folder subscribes to the typed events (`pressureChanged`, `fired`, `dayEnded`, `taskAssigned`). It holds no Three.js and no rule logic. `src/rules/` never imports it.
- The audio module reads the Escalation tier from the event payload to pick the music variant.
- The DOM bubble text reveal calls the audio module once per revealed character. The module plays the blip.
- Audio files live in `public/audio/`. One typed manifest in `src/audio/` names them. `npm run check` fails if a manifest entry has no file.

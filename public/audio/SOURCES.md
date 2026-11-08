# Audio sources

The short sounds come from the Kenney Interface Sounds pack (CC0). Each file was converted from `.ogg` to mono 22,050 Hz `.wav` with ffmpeg, under the same name the manifest uses.

The music and the office hum are still placeholders. `scripts/make-audio.sh` makes them with ffmpeg. No Kenney pack has a muzak loop, so these need another CC0 source. To swap a file, copy it over the same name, run `npm run check:audio`, and update its row below.

| File | Source | Licence |
| --- | --- | --- |
| `bubble.wav` | Kenney Interface Sounds 1.0, `pluck_001.ogg`, https://kenney.nl/assets/interface-sounds | CC0 1.0 |
| `choice-do.wav` | Kenney Interface Sounds 1.0, `confirmation_001.ogg` | CC0 1.0 |
| `choice-fake.wav` | Kenney Interface Sounds 1.0, `scratch_001.ogg` | CC0 1.0 |
| `choice-delegate.wav` | Kenney Interface Sounds 1.0, `drop_001.ogg` | CC0 1.0 |
| `choice-sabotage.wav` | Kenney Interface Sounds 1.0, `error_004.ogg` | CC0 1.0 |
| `pressure-drop.wav` | Kenney Interface Sounds 1.0, `minimize_001.ogg` | CC0 1.0 |
| `fired.wav` | Kenney Interface Sounds 1.0, `error_006.ogg` | CC0 1.0 |
| `day-end.wav` | Kenney Interface Sounds 1.0, `glass_001.ogg` | CC0 1.0 |
| `blip.wav` | Kenney Interface Sounds 1.0, `tick_001.ogg` | CC0 1.0 |
| `music-clean.wav`, `music-odd.wav`, `music-wrong.wav` | `scripts/make-audio.sh`, placeholder | none, made in this repo |
| `hum.wav` | `scripts/make-audio.sh`, placeholder | none, made in this repo |

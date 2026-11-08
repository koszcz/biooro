#!/bin/sh
# Makes the placeholder music and office hum in public/audio/ with ffmpeg. Run it once by hand, then commit the files.
# The game never runs this. Replace these files with CC0 sounds when you find a muzak loop and a hum.
set -e
out="$(dirname "$0")/../public/audio"
mkdir -p "$out"
tmp="$(mktemp -d)"
f() { ffmpeg -hide_banner -loglevel error -y "$@"; }
r="-ar 22050 -ac 1"

# Muzak: a slow four-chord loop of 8 seconds. Each chord lasts 2 seconds.
n=0
for spec in "261.63 329.63 392.0" "220.0 261.63 329.63" "174.61 220.0 261.63" "196.0 246.94 293.66"; do
  set -- $spec
  n=$((n + 1))
  f -f lavfi -i "aevalsrc=0.10*sin(2*PI*$1*t)+0.08*sin(2*PI*$2*t)+0.06*sin(2*PI*$3*t):d=2:s=22050" \
    -af "afade=t=in:d=0.05,afade=t=out:st=1.95:d=0.05" "$tmp/chord$n.wav"
done
f -i "$tmp/chord1.wav" -i "$tmp/chord2.wav" -i "$tmp/chord3.wav" -i "$tmp/chord4.wav" \
  -filter_complex "[0][1][2][3]concat=n=4:v=0:a=1,lowpass=f=1800" $r "$out/music-clean.wav"
# Odd: detuned and wobbling.
f -i "$out/music-clean.wav" -af "asetrate=22050*0.97,aresample=22050,vibrato=f=4:d=0.4" $r "$out/music-odd.wav"
# Wrong: thin, tinny and sour.
f -i "$out/music-clean.wav" -af "asetrate=22050*1.06,aresample=22050,highpass=f=900,lowpass=f=3000,tremolo=f=7:d=0.6" $r "$out/music-wrong.wav"

# Office hum: low mains hum.
f -f lavfi -i "aevalsrc=0.12*sin(2*PI*100*t)+0.06*sin(2*PI*200*t)+0.03*sin(2*PI*50*t):d=4:s=22050" \
  -af "afade=t=in:d=0.1,afade=t=out:st=3.9:d=0.1" $r "$out/hum.wav"

rm -r "$tmp"

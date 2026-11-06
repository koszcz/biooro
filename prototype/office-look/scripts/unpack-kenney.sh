#!/usr/bin/env bash
# PROTOTYPE helper. Usage: pnpm unpack <furniture-kit.zip> <mini-characters.zip>
# Copies every GLB (and its textures) into public/kenney/<kit>/ and writes a manifest.
set -euo pipefail
cd "$(dirname "$0")/.."
unpack() {
  local zip="$1" kit="$2" tmp
  tmp="$(mktemp -d)"
  unzip -q "$zip" -d "$tmp"
  rm -rf "public/kenney/$kit"; mkdir -p "public/kenney/$kit"
  local glbdir
  glbdir="$(dirname "$(find "$tmp" -iname '*.glb' | head -1)")"
  cp -R "$glbdir"/. "public/kenney/$kit/"
  rm -rf "$tmp"
  echo "$kit: $(find "public/kenney/$kit" -iname '*.glb' | wc -l | tr -d ' ') GLB files"
}
unpack "$1" furniture
unpack "$2" characters
node -e '
const fs=require("fs");const list=d=>fs.readdirSync("public/kenney/"+d).filter(f=>f.toLowerCase().endsWith(".glb"));
fs.writeFileSync("public/kenney/manifest.json",JSON.stringify({furniture:list("furniture"),characters:list("characters").filter(f=>f.startsWith("character-"))},null,1));'
echo "Wrote public/kenney/manifest.json"

// The gibberish blips: one per two revealed characters, none for a space.

/** How many blips play when the revealed length of `text` goes from `from` to `to` characters. */
export function blipsBetween(text: string, from: number, to: number): number {
  let count = 0;
  for (let shown = from + 1; shown <= to; shown++) {
    if (shown % 2 === 0 && text[shown - 1] !== " ") count++;
  }
  return count;
}

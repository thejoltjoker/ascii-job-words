/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

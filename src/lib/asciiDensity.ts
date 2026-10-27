/**
 * Classic short ASCII density ramp (sparse/light → dense/dark).
 * Used only for cells above the word/ink blank cutoff.
 */
export const ASCII_DENSITY_RAMP = ' .:-=+*#%@'

/**
 * Map brightness inside the blank zone onto a classic ASCII density glyph.
 * Lighter cells → sparser glyphs; nearer the blank cutoff → denser glyphs.
 * Does not touch the buzzword stream.
 *
 * @param brightness 0 = black … 1 = white
 * @param blankCutoff luminance at which word ink stops (inclusive blank start)
 */
export function asciiGlyphForBlank(
  brightness: number,
  blankCutoff: number,
): string {
  const b = clamp01(brightness)
  const cutoff = clamp01(blankCutoff)
  const ramp = ASCII_DENSITY_RAMP
  if (ramp.length === 0) return ' '
  if (b <= cutoff || cutoff >= 1) {
    // Darkest edge of blank zone → densest fill glyph
    return ramp[ramp.length - 1]!
  }
  // 0 at cutoff (denser), 1 at pure white (sparser)
  const lightness = (b - cutoff) / (1 - cutoff)
  const density = 1 - lightness
  const index = Math.min(
    ramp.length - 1,
    Math.max(0, Math.round(density * (ramp.length - 1))),
  )
  return ramp[index]!
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

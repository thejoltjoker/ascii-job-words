import { describe, expect, it } from 'vitest'
import { ASCII_DENSITY_RAMP, asciiGlyphForBlank } from './asciiDensity'

describe('asciiGlyphForBlank', () => {
  const cutoff = 0.68

  it('uses the short classic density ramp', () => {
    expect(ASCII_DENSITY_RAMP).toBe(' .:-=+*#%@')
  })

  it('maps near-white brightness to a sparse glyph', () => {
    const glyph = asciiGlyphForBlank(0.99, cutoff)
    const sparseHalf = ASCII_DENSITY_RAMP.slice(0, Math.ceil(ASCII_DENSITY_RAMP.length / 2))
    expect(sparseHalf).toContain(glyph)
  })

  it('maps brightness just above the cutoff to a denser glyph', () => {
    const dense = asciiGlyphForBlank(cutoff + 0.01, cutoff)
    const sparse = asciiGlyphForBlank(0.98, cutoff)
    expect(ASCII_DENSITY_RAMP.indexOf(dense)).toBeGreaterThan(
      ASCII_DENSITY_RAMP.indexOf(sparse),
    )
  })

  it('returns densest glyph when brightness equals the cutoff', () => {
    expect(asciiGlyphForBlank(cutoff, cutoff)).toBe(
      ASCII_DENSITY_RAMP[ASCII_DENSITY_RAMP.length - 1],
    )
  })

  it('never returns a character outside the ramp', () => {
    for (let b = cutoff; b <= 1; b += 0.02) {
      expect(ASCII_DENSITY_RAMP).toContain(asciiGlyphForBlank(b, cutoff))
    }
  })
})

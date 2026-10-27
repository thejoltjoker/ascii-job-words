import { describe, expect, it } from 'vitest'
import { pngSizeForPortrait } from './exportPortraitPng'

describe('pngSizeForPortrait', () => {
  it('scales canvas to cols×rows at the mono cell aspect', () => {
    const size = pngSizeForPortrait(100, 60, 8, 0.6, 2)
    expect(size.cellH).toBe(16)
    expect(size.cellW).toBeCloseTo(9.6)
    expect(size.width).toBe(960)
    expect(size.height).toBe(960)
  })

  it('uses scale 1 for 1× export dimensions', () => {
    const size = pngSizeForPortrait(10, 5, 10, 0.5, 1)
    expect(size.width).toBe(50)
    expect(size.height).toBe(50)
  })
})

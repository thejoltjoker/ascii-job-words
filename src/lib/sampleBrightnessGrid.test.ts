import { describe, expect, it } from 'vitest'
import { sampleBrightnessGrid } from './sampleBrightnessGrid'

/** 2×1 image: black pixel, white pixel (RGBA) */
function blackWhiteRow(): {
  data: Uint8ClampedArray
  width: number
  height: number
} {
  return {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([
      0, 0, 0, 255, // black
      255, 255, 255, 255, // white
    ]),
  }
}

describe('sampleBrightnessGrid', () => {
  it('samples letterboxed brightness into the requested grid', () => {
    const grid = sampleBrightnessGrid(blackWhiteRow(), 2, 1)
    expect(grid).toHaveLength(1)
    expect(grid[0]).toHaveLength(2)
    expect(grid[0]![0]).toBeLessThan(0.2)
    expect(grid[0]![1]).toBeGreaterThan(0.8)
  })

  it('preserves aspect with letterboxing (pad as white/bright)', () => {
    // Wide 2×1 image into a square 2×2 grid → top or bottom pad
    const grid = sampleBrightnessGrid(blackWhiteRow(), 2, 2)
    expect(grid).toHaveLength(2)
    const flats = grid.flat()
    const darkCount = flats.filter((b) => b < 0.2).length
    const brightCount = flats.filter((b) => b > 0.8).length
    expect(darkCount).toBe(1)
    expect(brightCount).toBeGreaterThanOrEqual(3)
  })
})

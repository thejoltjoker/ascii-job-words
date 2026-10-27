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
  it('samples stretched brightness into the requested grid', () => {
    const grid = sampleBrightnessGrid(blackWhiteRow(), 2, 1)
    expect(grid).toHaveLength(1)
    expect(grid[0]).toHaveLength(2)
    expect(grid[0]![0]).toBeLessThan(0.2)
    expect(grid[0]![1]).toBeGreaterThan(0.8)
  })

  it('fills the grid by stretching (no letterbox pads)', () => {
    // Wide 2×1 into 2×2 — both rows see black|white
    const grid = sampleBrightnessGrid(blackWhiteRow(), 2, 2)
    expect(grid).toHaveLength(2)
    expect(grid[0]![0]).toBeLessThan(0.2)
    expect(grid[0]![1]).toBeGreaterThan(0.8)
    expect(grid[1]![0]).toBeLessThan(0.2)
    expect(grid[1]![1]).toBeGreaterThan(0.8)
  })
})

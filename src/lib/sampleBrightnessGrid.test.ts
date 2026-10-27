import { describe, expect, it } from 'vitest'
import { sampleBrightnessGrid, samplePixelGrid } from './sampleBrightnessGrid'

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

/** 2×1 image: red pixel, blue pixel */
function redBlueRow(): {
  data: Uint8ClampedArray
  width: number
  height: number
} {
  return {
    width: 2,
    height: 1,
    data: new Uint8ClampedArray([
      220, 30, 40, 255, // red-ish
      20, 50, 210, 255, // blue-ish
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

describe('samplePixelGrid', () => {
  it('captures RGB alongside brightness', () => {
    const grid = samplePixelGrid(redBlueRow(), 2, 1)
    expect(grid).toHaveLength(1)
    expect(grid[0]).toHaveLength(2)
    expect(grid[0]![0]).toMatchObject({ r: 220, g: 30, b: 40 })
    expect(grid[0]![1]).toMatchObject({ r: 20, g: 50, b: 210 })
    expect(grid[0]![0]!.brightness).toBeGreaterThan(0)
    expect(grid[0]![1]!.brightness).toBeGreaterThan(0)
    // Red-ish is brighter than blue-ish under relative luminance
    expect(grid[0]![0]!.brightness).toBeGreaterThan(grid[0]![1]!.brightness)
  })
})

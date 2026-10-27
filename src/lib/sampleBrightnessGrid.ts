export type PixelSource = {
  data: Uint8ClampedArray
  width: number
  height: number
}

/**
 * Stretch the image to fill cols×rows (standard ASCII sampling).
 * The grid aspect is chosen for monospace cells; stretching here cancels
 * that so the portrait is not letterbox-squished on screen.
 * Brightness is relative luminance in 0…1 (0 = black).
 */
export function sampleBrightnessGrid(
  source: PixelSource,
  cols: number,
  rows: number,
): number[][] {
  if (cols < 1 || rows < 1) {
    throw new Error('grid dimensions must be positive')
  }

  const grid: number[][] = []
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    const srcY = Math.min(
      source.height - 1,
      Math.floor(((r + 0.5) / rows) * source.height),
    )
    for (let c = 0; c < cols; c++) {
      const srcX = Math.min(
        source.width - 1,
        Math.floor(((c + 0.5) / cols) * source.width),
      )
      row.push(luminanceAt(source, srcX, srcY))
    }
    grid.push(row)
  }
  return grid
}

function luminanceAt(source: PixelSource, x: number, y: number): number {
  const i = (y * source.width + x) * 4
  const r = source.data[i] ?? 0
  const g = source.data[i + 1] ?? 0
  const b = source.data[i + 2] ?? 0
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

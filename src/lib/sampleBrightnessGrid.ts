export type PixelSource = {
  data: Uint8ClampedArray
  width: number
  height: number
}

/** One sampled cell: luminance for layout + RGB for color ink. */
export type SampledCell = {
  /** Relative luminance 0…1 (0 = black) */
  brightness: number
  /** 0–255 channel samples at the source pixel */
  r: number
  g: number
  b: number
}

/**
 * Stretch the image to fill cols×rows (standard ASCII sampling).
 * The grid aspect is chosen for monospace cells; stretching here cancels
 * that so the portrait is not letterbox-squished on screen.
 */
export function samplePixelGrid(
  source: PixelSource,
  cols: number,
  rows: number,
): SampledCell[][] {
  if (cols < 1 || rows < 1) {
    throw new Error('grid dimensions must be positive')
  }

  const grid: SampledCell[][] = []
  for (let r = 0; r < rows; r++) {
    const row: SampledCell[] = []
    const srcY = Math.min(
      source.height - 1,
      Math.floor(((r + 0.5) / rows) * source.height),
    )
    for (let c = 0; c < cols; c++) {
      const srcX = Math.min(
        source.width - 1,
        Math.floor(((c + 0.5) / cols) * source.width),
      )
      row.push(sampleAt(source, srcX, srcY))
    }
    grid.push(row)
  }
  return grid
}

/**
 * Brightness-only view of {@link samplePixelGrid} (tests / simple callers).
 */
export function sampleBrightnessGrid(
  source: PixelSource,
  cols: number,
  rows: number,
): number[][] {
  return samplePixelGrid(source, cols, rows).map((row) =>
    row.map((cell) => cell.brightness),
  )
}

function sampleAt(source: PixelSource, x: number, y: number): SampledCell {
  const i = (y * source.width + x) * 4
  const r = source.data[i] ?? 0
  const g = source.data[i + 1] ?? 0
  const b = source.data[i + 2] ?? 0
  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return { brightness, r, g, b }
}

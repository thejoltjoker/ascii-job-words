export type PixelSource = {
  data: Uint8ClampedArray
  width: number
  height: number
}

/**
 * Fit the whole image into cols×rows (letterbox). Padded cells read as white.
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

  const scale = Math.min(cols / source.width, rows / source.height)
  const drawW = source.width * scale
  const drawH = source.height * scale
  const offsetX = (cols - drawW) / 2
  const offsetY = (rows - drawH) / 2

  const grid: number[][] = []
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < cols; c++) {
      const srcX = (c + 0.5 - offsetX) / scale
      const srcY = (r + 0.5 - offsetY) / scale
      if (
        srcX < 0 ||
        srcY < 0 ||
        srcX >= source.width ||
        srcY >= source.height
      ) {
        row.push(1)
        continue
      }
      row.push(luminanceAt(source, Math.floor(srcX), Math.floor(srcY)))
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

/** Fallback if the font has not loaded yet (JetBrains Mono ≈ 0.6). */
export const MONO_CELL_ASPECT = 0.6

const COLS_MIN = 140
const COLS_SPAN = 200 // → max 340

/** Density 0…1 → column count (shared by UI estimate + grid build). */
export function colsForDensity(density: number): number {
  const d = Math.min(1, Math.max(0, density))
  return Math.round(COLS_MIN + d * COLS_SPAN)
}

/**
 * Density 0…1 → character-grid resolution.
 * `cellAspect` is glyph width / line height (measure at runtime when possible).
 */
export function gridForDensity(
  density: number,
  imageWidth: number,
  imageHeight: number,
  cellAspect: number = MONO_CELL_ASPECT,
): { cols: number; rows: number } {
  const cols = colsForDensity(density)
  const aspect = imageHeight / Math.max(1, imageWidth)
  const rows = Math.max(
    40,
    Math.round(cols * aspect * clampAspect(cellAspect)),
  )
  return { cols, rows }
}

function clampAspect(a: number): number {
  return Math.min(0.85, Math.max(0.4, a))
}

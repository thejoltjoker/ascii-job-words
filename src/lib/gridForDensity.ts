/**
 * Density 0…1 → sampling resolution. Letterbox aspect follows the source image.
 */
export function gridForDensity(
  density: number,
  imageWidth: number,
  imageHeight: number,
): { cols: number; rows: number } {
  const d = Math.min(1, Math.max(0, density))
  const cols = Math.round(48 + d * 96) // 48…144
  const aspect = imageHeight / Math.max(1, imageWidth)
  // Vertical compression: mono lines are taller than wide character cells
  const rows = Math.max(12, Math.round(cols * aspect * 0.52))
  return { cols, rows }
}

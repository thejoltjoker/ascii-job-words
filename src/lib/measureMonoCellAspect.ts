/**
 * Measure monospace cell width / height at line-height 1.
 * Height equals fontPx; width is the advance of "M".
 */
export function measureMonoCellAspect(fontPx: number): number {
  const probe = document.createElement('span')
  probe.textContent = 'M'
  probe.style.cssText = [
    'position:absolute',
    'left:-9999px',
    'top:0',
    'visibility:hidden',
    `font:${fontPx}px/1 var(--mono), ui-monospace, monospace`,
  ].join(';')
  document.body.append(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()
  if (width <= 0) return 0.6
  return width / fontPx
}

export function fontPxForCols(cols: number): number {
  // Allow tiny type at high density so ~300 columns still fit the page
  return Math.max(3, Math.min(11, Math.floor(1080 / cols)))
}

/** User text-size slider bounds (px). Independent of density / fit-width. */
export const TEXT_SIZE_MIN = 4
export const TEXT_SIZE_MAX = 16
export const TEXT_SIZE_DEFAULT = 6

export function clampTextSizePx(px: number): number {
  return Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, Math.round(px)))
}

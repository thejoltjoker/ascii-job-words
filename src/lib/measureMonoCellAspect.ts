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

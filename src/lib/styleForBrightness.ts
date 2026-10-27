export type BrightnessOptions = {
  /** 0–1; higher hides more light background */
  contrast: number
}

export type BrightnessStyle = {
  blank: boolean
  /** Multiplier on base font size; ~0.55 (light) … ~1.45 (dark) */
  fontScale: number
  /** 0–255 grayscale ink; lower is darker */
  gray: number
}

/**
 * Map luminance (0 = black, 1 = white) to word styling.
 */
export function styleForBrightness(
  brightness: number,
  { contrast }: BrightnessOptions,
): BrightnessStyle {
  const c = clamp01(contrast)
  const b = clamp01(brightness)
  // Higher contrast → lower blank cutoff (more of the light end becomes space)
  const blankCutoff = 0.88 - c * 0.4
  if (b >= blankCutoff) {
    return { blank: true, fontScale: 0, gray: 255 }
  }

  // Gray carries the shade across letters; fontScale kept for API/tests
  const darkness = 1 - b
  const fontScale = 0.9 + darkness * 0.2
  const gray = Math.round(12 + b * 180)
  return { blank: false, fontScale, gray }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

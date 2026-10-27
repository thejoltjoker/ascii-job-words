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
  /** Luminance at which word ink stops (inclusive blank start) */
  blankCutoff: number
}

/**
 * Higher contrast → lower blank cutoff (more of the light end becomes fill).
 */
export function blankCutoffForContrast(contrast: number): number {
  return 0.88 - clamp01(contrast) * 0.4
}

/**
 * Map luminance (0 = black, 1 = white) to word styling.
 */
export function styleForBrightness(
  brightness: number,
  { contrast }: BrightnessOptions,
): BrightnessStyle {
  const b = clamp01(brightness)
  const blankCutoff = blankCutoffForContrast(contrast)
  if (b >= blankCutoff) {
    // Light gray for classic ASCII fill — still readable, never competes with ink
    const t = blankCutoff >= 1 ? 1 : (b - blankCutoff) / (1 - blankCutoff)
    const gray = Math.round(168 + clamp01(t) * 72)
    return { blank: true, fontScale: 0.85, gray, blankCutoff }
  }

  // Gray carries the shade across letters; fontScale kept for API/tests
  const darkness = 1 - b
  const fontScale = 0.9 + darkness * 0.2
  const gray = Math.round(12 + b * 180)
  return { blank: false, fontScale, gray, blankCutoff }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

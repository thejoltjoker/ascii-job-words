import { styleForBrightness } from './styleForBrightness'
import type { SampledCell } from './sampleBrightnessGrid'

export type CharToken = {
  kind: 'char'
  char: string
  /** Multiplier on cell-relative type size (via CSS cqh) */
  fontScale: number
  gray: number
  /** Sampled RGB when color mode is on */
  color?: { r: number; g: number; b: number }
  row: number
  col: number
}

export type BlankToken = {
  kind: 'blank'
  row: number
  col: number
}

export type RowBreakToken = {
  kind: 'rowBreak'
}

export type PortraitToken = CharToken | BlankToken | RowBreakToken

export type WordPortrait = {
  tokens: PortraitToken[]
  rows: number
  cols: number
}

export type ColorMode = 'grayscale' | 'color'

export type PortraitOptions = {
  contrast: number
  colorMode?: ColorMode
}

/** Join words with spaces and cycle forever as a character stream. */
export function createWordCharStream(words: readonly string[]): () => string {
  if (words.length === 0) {
    throw new Error('word bank must not be empty')
  }
  const stream = words.join(' ') + ' '
  let i = 0
  return () => {
    const ch = stream[i % stream.length]!
    i += 1
    return ch
  }
}

/**
 * Map a sampled pixel grid onto a buzzword character stream.
 * Each visible cell takes the next character; blanks skip the stream.
 */
export function buildWordPortrait(
  grid: SampledCell[][],
  words: readonly string[],
  options: PortraitOptions,
): WordPortrait {
  const nextChar = createWordCharStream(words)
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const colorMode = options.colorMode ?? 'grayscale'
  const tokens: PortraitToken[] = []

  for (let r = 0; r < rows; r++) {
    const row = grid[r] ?? []
    for (let c = 0; c < cols; c++) {
      const cell = row[c] ?? { brightness: 1, r: 255, g: 255, b: 255 }
      const style = styleForBrightness(cell.brightness, {
        contrast: options.contrast,
      })
      if (style.blank) {
        tokens.push({ kind: 'blank', row: r, col: c })
        continue
      }
      const token: CharToken = {
        kind: 'char',
        char: nextChar(),
        fontScale: style.fontScale,
        gray: style.gray,
        row: r,
        col: c,
      }
      if (colorMode === 'color') {
        token.color = { r: cell.r, g: cell.g, b: cell.b }
      }
      tokens.push(token)
    }
    if (r < rows - 1) {
      tokens.push({ kind: 'rowBreak' })
    }
  }

  return { tokens, rows, cols }
}

export function portraitToPlainText(portrait: WordPortrait): string {
  const parts: string[] = []
  for (const token of portrait.tokens) {
    if (token.kind === 'rowBreak') {
      parts.push('\n')
    } else if (token.kind === 'blank') {
      parts.push(' ')
    } else {
      parts.push(token.char)
    }
  }
  return parts.join('').replace(/ +\n/g, '\n').replace(/\n+$/g, '')
}

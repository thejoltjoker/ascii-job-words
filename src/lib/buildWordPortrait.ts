import { styleForBrightness } from './styleForBrightness'

export type CharToken = {
  kind: 'char'
  char: string
  /** Multiplier on cell-relative type size (via CSS cqh) */
  fontScale: number
  gray: number
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

export type PortraitOptions = {
  contrast: number
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
 * Map a brightness grid onto a buzzword character stream.
 * Each visible cell takes the next character; blanks skip the stream.
 */
export function buildWordPortrait(
  brightnessGrid: number[][],
  words: readonly string[],
  options: PortraitOptions,
): WordPortrait {
  const nextChar = createWordCharStream(words)
  const rows = brightnessGrid.length
  const cols = brightnessGrid[0]?.length ?? 0
  const tokens: PortraitToken[] = []

  for (let r = 0; r < rows; r++) {
    const row = brightnessGrid[r] ?? []
    for (let c = 0; c < cols; c++) {
      const brightness = row[c] ?? 1
      const style = styleForBrightness(brightness, {
        contrast: options.contrast,
      })
      if (style.blank) {
        tokens.push({ kind: 'blank', row: r, col: c })
        continue
      }
      tokens.push({
        kind: 'char',
        char: nextChar(),
        fontScale: style.fontScale,
        gray: style.gray,
        row: r,
        col: c,
      })
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

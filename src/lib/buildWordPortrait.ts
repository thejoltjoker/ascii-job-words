import { styleForBrightness } from './styleForBrightness'

export type WordToken = {
  kind: 'word'
  word: string
  fontPx: number
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

export type PortraitToken = WordToken | BlankToken | RowBreakToken

export type WordPortrait = {
  tokens: PortraitToken[]
  rows: number
  cols: number
}

export type PortraitOptions = {
  contrast: number
  baseFontPx: number
}

/**
 * Map a brightness grid (row-major, 0=black…1=white) onto cycling job words.
 */
export function buildWordPortrait(
  brightnessGrid: number[][],
  words: readonly string[],
  options: PortraitOptions,
): WordPortrait {
  if (words.length === 0) {
    throw new Error('word bank must not be empty')
  }

  const rows = brightnessGrid.length
  const cols = brightnessGrid[0]?.length ?? 0
  const tokens: PortraitToken[] = []
  let wordIndex = 0

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
      const word = words[wordIndex % words.length]!
      wordIndex += 1
      tokens.push({
        kind: 'word',
        word,
        fontPx: Math.max(4, options.baseFontPx * style.fontScale),
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
      parts.push(token.word)
      parts.push(' ')
    }
  }
  return parts.join('').replace(/ +\n/g, '\n').trimEnd()
}

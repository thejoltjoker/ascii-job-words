import { describe, expect, it } from 'vitest'
import { buildWordPortrait, portraitToPlainText } from './buildWordPortrait'

const words = ['React', 'Go']

describe('buildWordPortrait', () => {
  it('emits one character per dark cell from the word stream', () => {
    const portrait = buildWordPortrait([[0.1, 0.1, 0.1, 0.1, 0.1]], words, {
      contrast: 0.5,
    })
    const chars = portrait.tokens
      .filter((t) => t.kind === 'char')
      .map((t) => t.char)
    // "React" then space then "Go" …
    expect(chars).toEqual(['R', 'e', 'a', 'c', 't'])
  })

  it('leaves light cells blank without consuming the stream', () => {
    const portrait = buildWordPortrait([[0.1, 0.95, 0.1]], words, {
      contrast: 0.5,
    })
    expect(portrait.tokens.map((t) => t.kind)).toEqual(['char', 'blank', 'char'])
    if (portrait.tokens[0]?.kind === 'char' && portrait.tokens[2]?.kind === 'char') {
      expect(portrait.tokens[0].char).toBe('R')
      expect(portrait.tokens[2].char).toBe('e')
    }
  })

  it('inserts a space between words in the stream', () => {
    const portrait = buildWordPortrait(
      [[0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]],
      words,
      { contrast: 0.5 },
    )
    const chars = portrait.tokens
      .filter((t) => t.kind === 'char')
      .map((t) => t.char)
    expect(chars.join('')).toBe('React Go')
  })

  it('shades each character independently by cell brightness', () => {
    const portrait = buildWordPortrait([[0.1, 0.55]], words, { contrast: 0.5 })
    const [dark, mid] = portrait.tokens
    expect(dark?.kind).toBe('char')
    expect(mid?.kind).toBe('char')
    if (dark?.kind === 'char' && mid?.kind === 'char') {
      expect(dark.fontScale).toBeGreaterThan(mid.fontScale)
      expect(dark.gray).toBeLessThan(mid.gray)
    }
  })

  it('exports a monospace plain-text grid', () => {
    const portrait = buildWordPortrait(
      [
        [0.1, 0.95, 0.1],
        [0.1, 0.1, 0.1],
      ],
      words,
      { contrast: 0.5 },
    )
    const text = portraitToPlainText(portrait)
    expect(text).toBe('R e\nact')
  })
})

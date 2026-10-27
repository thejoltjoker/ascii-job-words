import { describe, expect, it } from 'vitest'
import { buildWordPortrait, portraitToPlainText } from './buildWordPortrait'

const words = ['React', 'remote', 'MUST RELOCATE', 'TypeScript']

describe('buildWordPortrait', () => {
  it('emits blank tokens for light cells and words for dark cells', () => {
    const portrait = buildWordPortrait([[0.1, 0.95, 0.2]], words, {
      contrast: 0.5,
      baseFontPx: 10,
    })
    expect(portrait.tokens).toHaveLength(3)
    expect(portrait.tokens[0]?.kind).toBe('word')
    expect(portrait.tokens[1]?.kind).toBe('blank')
    expect(portrait.tokens[2]?.kind).toBe('word')
  })

  it('cycles the word bank without repeating until exhausted', () => {
    const portrait = buildWordPortrait(
      [
        [0.1, 0.1, 0.1, 0.1],
        [0.1, 0.1, 0.1, 0.1],
      ],
      words,
      { contrast: 0.5, baseFontPx: 10 },
    )
    const used = portrait.tokens
      .filter((t) => t.kind === 'word')
      .map((t) => t.word)
    expect(used.slice(0, 4)).toEqual(words)
    expect(used[4]).toBe(words[0])
  })

  it('assigns darker cells larger fontScale than lighter visible cells', () => {
    const portrait = buildWordPortrait([[0.1, 0.6]], words, {
      contrast: 0.5,
      baseFontPx: 12,
    })
    const [dark, light] = portrait.tokens
    expect(dark?.kind).toBe('word')
    expect(light?.kind).toBe('word')
    if (dark?.kind === 'word' && light?.kind === 'word') {
      expect(dark.fontPx).toBeGreaterThan(light.fontPx)
      expect(dark.gray).toBeLessThan(light.gray)
    }
  })

  it('inserts newlines between rows in plain text export', () => {
    const portrait = buildWordPortrait(
      [
        [0.1, 0.95],
        [0.2, 0.1],
      ],
      words,
      { contrast: 0.5, baseFontPx: 10 },
    )
    const text = portraitToPlainText(portrait)
    expect(text.split('\n')).toHaveLength(2)
    expect(text).toMatch(/React/)
  })
})

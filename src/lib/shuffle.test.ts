import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('returns a new array with the same members', () => {
    const input = ['a', 'b', 'c', 'd', 'e']
    const out = shuffle(input, () => 0.42)
    expect(out).not.toBe(input)
    expect(out.sort()).toEqual([...input].sort())
  })

  it('can reorder when random draws vary', () => {
    const input = ['a', 'b', 'c', 'd']
    let i = 0
    const draws = [0.9, 0.1, 0.5, 0.2]
    const out = shuffle(input, () => draws[i++] ?? 0)
    expect(out).not.toEqual(input)
  })
})

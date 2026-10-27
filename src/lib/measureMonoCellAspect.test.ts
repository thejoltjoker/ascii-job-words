import { describe, expect, it } from 'vitest'
import {
  TEXT_SIZE_DEFAULT,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
  clampTextSizePx,
} from './measureMonoCellAspect'

describe('clampTextSizePx', () => {
  it('clamps to the slider bounds', () => {
    expect(clampTextSizePx(TEXT_SIZE_MIN - 2)).toBe(TEXT_SIZE_MIN)
    expect(clampTextSizePx(TEXT_SIZE_MAX + 5)).toBe(TEXT_SIZE_MAX)
    expect(clampTextSizePx(TEXT_SIZE_DEFAULT)).toBe(TEXT_SIZE_DEFAULT)
  })

  it('rounds fractional values', () => {
    expect(clampTextSizePx(7.4)).toBe(7)
    expect(clampTextSizePx(7.6)).toBe(8)
  })
})

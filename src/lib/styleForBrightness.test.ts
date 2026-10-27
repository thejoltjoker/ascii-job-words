import { describe, expect, it } from 'vitest'
import { styleForBrightness } from './styleForBrightness'

describe('styleForBrightness', () => {
  it('marks very light pixels blank at default contrast', () => {
    const style = styleForBrightness(0.95, { contrast: 0.5 })
    expect(style.blank).toBe(true)
    expect(style.gray).toBeLessThan(255)
    expect(style.gray).toBeGreaterThan(150)
    expect(style.blankCutoff).toBeCloseTo(0.68)
  })

  it('marks dark pixels visible with larger size and darker gray', () => {
    const style = styleForBrightness(0.1, { contrast: 0.5 })
    expect(style.blank).toBe(false)
    expect(style.fontScale).toBeGreaterThan(1)
    expect(style.gray).toBeLessThan(80)
  })

  it('marks mid-tone pixels smaller and lighter than dark ones', () => {
    const dark = styleForBrightness(0.15, { contrast: 0.5 })
    const mid = styleForBrightness(0.55, { contrast: 0.5 })
    expect(mid.blank).toBe(false)
    expect(mid.fontScale).toBeLessThan(dark.fontScale)
    expect(mid.gray).toBeGreaterThan(dark.gray)
  })

  it('raises the blank threshold when contrast increases', () => {
    const atLow = styleForBrightness(0.7, { contrast: 0.2 })
    const atHigh = styleForBrightness(0.7, { contrast: 0.9 })
    expect(atLow.blank).toBe(false)
    expect(atHigh.blank).toBe(true)
  })
})

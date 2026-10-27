import { describe, expect, it } from 'vitest'
import {
  BRIGHTNESS_DEFAULT,
  adjustBrightness,
  styleForBrightness,
} from './styleForBrightness'

describe('adjustBrightness', () => {
  it('leaves luminance unchanged at the default mid setting', () => {
    expect(adjustBrightness(0.3, BRIGHTNESS_DEFAULT)).toBeCloseTo(0.3)
    expect(adjustBrightness(0.8)).toBeCloseTo(0.8)
  })

  it('shifts luminance toward white when brightness is raised', () => {
    expect(adjustBrightness(0.3, 1)).toBeCloseTo(0.8)
    expect(adjustBrightness(0.4, 0.75)).toBeCloseTo(0.65)
  })

  it('shifts luminance toward black when brightness is lowered', () => {
    expect(adjustBrightness(0.7, 0)).toBeCloseTo(0.2)
    expect(adjustBrightness(0.5, 0.25)).toBeCloseTo(0.25)
  })

  it('clamps the adjusted luminance to 0…1', () => {
    expect(adjustBrightness(0.9, 1)).toBe(1)
    expect(adjustBrightness(0.1, 0)).toBe(0)
  })
})

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

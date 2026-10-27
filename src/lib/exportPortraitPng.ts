import type { WordPortrait } from './buildWordPortrait'
import { measureMonoCellAspect } from './measureMonoCellAspect'

export type ExportPngOptions = {
  fontPx: number
  /** CSS font family stack matching on-screen mono */
  fontFamily?: string
  background?: string
  scale?: number
}

const DEFAULT_FONT =
  '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace'

/** Pixel size of the PNG for a portrait at the given font size. */
export function pngSizeForPortrait(
  cols: number,
  rows: number,
  fontPx: number,
  cellAspect: number,
  scale = 2,
): { width: number; height: number; cellW: number; cellH: number } {
  const cellH = fontPx * scale
  const cellW = cellH * cellAspect
  return {
    width: Math.max(1, Math.ceil(cols * cellW)),
    height: Math.max(1, Math.ceil(rows * cellH)),
    cellW,
    cellH,
  }
}

/** Draw the portrait onto a canvas (retina-ish via scale). */
export function portraitToCanvas(
  portrait: WordPortrait,
  options: ExportPngOptions,
): HTMLCanvasElement {
  const fontPx = options.fontPx
  const scale = options.scale ?? 2
  const fontFamily = options.fontFamily ?? DEFAULT_FONT
  const background = options.background ?? '#ffffff'
  const cellAspect = measureMonoCellAspect(fontPx) || 0.6
  const { width, height, cellW, cellH } = pngSizeForPortrait(
    portrait.cols,
    portrait.rows,
    fontPx,
    cellAspect,
    scale,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2d canvas unavailable')
  }

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
  ctx.font = `400 ${fontPx * scale}px ${fontFamily}`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  let row = 0
  let col = 0
  for (const token of portrait.tokens) {
    if (token.kind === 'rowBreak') {
      row += 1
      col = 0
      continue
    }
    const x = col * cellW
    const y = row * cellH
    if (token.color) {
      ctx.fillStyle = `rgb(${token.color.r}, ${token.color.g}, ${token.color.b})`
    } else {
      ctx.fillStyle = `rgb(${token.gray}, ${token.gray}, ${token.gray})`
    }
    if (token.kind === 'char' && token.gray < 90) {
      ctx.font = `600 ${fontPx * scale}px ${fontFamily}`
    } else {
      ctx.font = `400 ${fontPx * scale}px ${fontFamily}`
    }
    ctx.fillText(token.char, x, y)
    col += 1
  }

  return canvas
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('PNG encode failed'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.append(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function exportPortraitPng(
  portrait: WordPortrait,
  options: ExportPngOptions,
  filename = 'hire-me-in-monospace.png',
): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
  const canvas = portraitToCanvas(portrait, options)
  const blob = await canvasToPngBlob(canvas)
  downloadBlob(blob, filename)
}

import type { WordPortrait } from './buildWordPortrait'
import { fontPxForCols } from './measureMonoCellAspect'

/**
 * Render as a monospace &lt;pre&gt; grid: one character (or space) per cell.
 * Shading is per-glyph via color; size stays uniform so letters stay sharp.
 */
export function renderPortrait(container: HTMLElement, portrait: WordPortrait): void {
  const pre = document.createElement('pre')
  pre.className = 'portrait-pre'
  pre.style.setProperty('--cols', String(portrait.cols))

  const fontPx = fontPxForCols(portrait.cols)
  pre.style.fontSize = `${fontPx}px`

  const frag = document.createDocumentFragment()

  for (const token of portrait.tokens) {
    if (token.kind === 'rowBreak') {
      frag.append(document.createTextNode('\n'))
      continue
    }
    if (token.kind === 'blank') {
      frag.append(document.createTextNode(' '))
      continue
    }
    const span = document.createElement('span')
    span.className = 'portrait-char'
    span.textContent = token.char
    span.style.color = `rgb(${token.gray}, ${token.gray}, ${token.gray})`
    // Tiny optical weight for darker samples without changing metrics
    span.style.fontWeight = token.gray < 90 ? '600' : '400'
    frag.append(span)
  }

  pre.append(frag)
  container.replaceChildren(pre)
}

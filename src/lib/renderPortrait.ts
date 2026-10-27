import type { WordPortrait } from './buildWordPortrait'

/**
 * Render as a monospace &lt;pre&gt; grid: one character per cell.
 * Ink cells use buzzword glyphs; blank/light cells use classic ASCII fill.
 * Shading is per-glyph via color; size stays uniform so letters stay sharp.
 */
export function renderPortrait(
  container: HTMLElement,
  portrait: WordPortrait,
  fontPx: number,
): void {
  const pre = document.createElement('pre')
  pre.className = 'portrait-pre'
  pre.style.setProperty('--cols', String(portrait.cols))
  pre.style.fontSize = `${fontPx}px`

  const frag = document.createDocumentFragment()

  for (const token of portrait.tokens) {
    if (token.kind === 'rowBreak') {
      frag.append(document.createTextNode('\n'))
      continue
    }
    const span = document.createElement('span')
    span.className =
      token.kind === 'blank' ? 'portrait-char portrait-fill' : 'portrait-char'
    span.textContent = token.char
    if (token.color) {
      span.style.color = `rgb(${token.color.r}, ${token.color.g}, ${token.color.b})`
    } else {
      span.style.color = `rgb(${token.gray}, ${token.gray}, ${token.gray})`
    }
    // Tiny optical weight for darker ink samples without changing metrics
    if (token.kind === 'char') {
      span.style.fontWeight = token.gray < 90 ? '600' : '400'
    } else {
      span.style.fontWeight = '400'
    }
    frag.append(span)
  }

  pre.append(frag)
  container.replaceChildren(pre)
}

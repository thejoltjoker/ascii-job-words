import type { WordPortrait } from './buildWordPortrait'

/** Place words on the sample grid so light cells stay empty (silhouette). */
export function renderPortrait(container: HTMLElement, portrait: WordPortrait): void {
  const frag = document.createDocumentFragment()
  const stage = document.createElement('div')
  stage.className = 'portrait-stage'
  stage.style.aspectRatio = `${portrait.cols} / ${portrait.rows}`

  for (const token of portrait.tokens) {
    if (token.kind !== 'word') continue
    const span = document.createElement('span')
    span.className = 'portrait-word'
    span.textContent = token.word
    span.title = token.word
    span.style.left = `${(token.col / portrait.cols) * 100}%`
    span.style.top = `${(token.row / portrait.rows) * 100}%`
    span.style.fontSize = `${token.fontPx}px`
    span.style.color = `rgb(${token.gray}, ${token.gray}, ${token.gray})`
    stage.append(span)
  }

  frag.append(stage)
  container.replaceChildren(frag)
}

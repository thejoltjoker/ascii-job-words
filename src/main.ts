import './style.css'
import {
  buildWordPortrait,
  portraitToPlainText,
} from './lib/buildWordPortrait'
import { colsForDensity, gridForDensity } from './lib/gridForDensity'
import { imageToPixels, loadImage } from './lib/imagePixels'
import { renderPortrait } from './lib/renderPortrait'
import { sampleBrightnessGrid } from './lib/sampleBrightnessGrid'
import {
  fontPxForCols,
  measureMonoCellAspect,
} from './lib/measureMonoCellAspect'
import { shuffle } from './lib/shuffle'
import { WORD_BANK } from './lib/wordBank'
import type { PixelSource } from './lib/sampleBrightnessGrid'
import type { WordPortrait } from './lib/buildWordPortrait'
import { MONO_CELL_ASPECT } from './lib/gridForDensity'

const SAMPLE_URL = '/sample.jpg'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('#app missing')
}

app.innerHTML = `
  <main class="page">
    <header class="intro">
      <h1>Hire Me in Monospace</h1>
      <p class="tagline">Upload a face. Get an ATS fever dream.</p>
    </header>

    <section class="controls" aria-label="Portrait controls">
      <img class="thumb" id="thumb" alt="Source photo thumbnail" width="72" height="72" />
      <label class="upload">
        <span>Upload</span>
        <input id="file" type="file" accept="image/*" />
      </label>
      <label class="slider">
        <span>Density <output id="densityOut" for="density">0.55</output></span>
        <input id="density" type="range" min="0" max="1" step="0.01" value="0.55" />
      </label>
      <label class="slider">
        <span>Contrast <output id="contrastOut" for="contrast">0.55</output></span>
        <input id="contrast" type="range" min="0" max="1" step="0.01" value="0.55" />
      </label>
      <button type="button" id="randomize" class="btn btn-secondary">Randomize words</button>
      <button type="button" id="copy" class="btn btn-primary">Copy text</button>
    </section>

    <p class="privacy">Runs entirely in your browser — nothing is uploaded.</p>

    <section class="portrait-wrap" aria-live="polite">
      <div id="portrait" class="portrait"></div>
    </section>
  </main>
`

const thumb = document.querySelector<HTMLImageElement>('#thumb')!
const fileInput = document.querySelector<HTMLInputElement>('#file')!
const densityInput = document.querySelector<HTMLInputElement>('#density')!
const contrastInput = document.querySelector<HTMLInputElement>('#contrast')!
const densityOut = document.querySelector<HTMLOutputElement>('#densityOut')!
const contrastOut = document.querySelector<HTMLOutputElement>('#contrastOut')!
const randomizeBtn = document.querySelector<HTMLButtonElement>('#randomize')!
const copyBtn = document.querySelector<HTMLButtonElement>('#copy')!
const portraitEl = document.querySelector<HTMLDivElement>('#portrait')!

let pixels: PixelSource | null = null
let objectUrl: string | null = null
let latestPortrait: WordPortrait | null = null
let activeWords: string[] = [...WORD_BANK]

function syncOutputs(): void {
  densityOut.value = Number(densityInput.value).toFixed(2)
  contrastOut.value = Number(contrastInput.value).toFixed(2)
}

function rebuild(): void {
  if (!pixels) return
  const density = Number(densityInput.value)
  const contrast = Number(contrastInput.value)
  // Estimate cols, measure real mono metrics, then lock rows to photo aspect
  const approxCols = colsForDensity(density)
  const fontPx = fontPxForCols(approxCols)
  const cellAspect = measureMonoCellAspect(fontPx) || MONO_CELL_ASPECT
  const { cols, rows } = gridForDensity(
    density,
    pixels.width,
    pixels.height,
    cellAspect,
  )
  const grid = sampleBrightnessGrid(pixels, cols, rows)
  latestPortrait = buildWordPortrait(grid, activeWords, { contrast })
  renderPortrait(portraitEl, latestPortrait)
}

async function setSource(url: string, revokePrevious = false): Promise<void> {
  if (revokePrevious && objectUrl) {
    URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
  thumb.src = url
  const img = await loadImage(url)
  pixels = imageToPixels(img)
  rebuild()
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0]
  if (!file) return
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(file)
  void setSource(objectUrl)
})

densityInput.addEventListener('input', () => {
  syncOutputs()
  rebuild()
})
contrastInput.addEventListener('input', () => {
  syncOutputs()
  rebuild()
})

randomizeBtn.addEventListener('click', () => {
  activeWords = shuffle(WORD_BANK)
  rebuild()
})

copyBtn.addEventListener('click', async () => {
  if (!latestPortrait) return
  const text = portraitToPlainText(latestPortrait)
  try {
    await navigator.clipboard.writeText(text)
    copyBtn.textContent = 'Copied'
    window.setTimeout(() => {
      copyBtn.textContent = 'Copy text'
    }, 1200)
  } catch {
    copyBtn.textContent = 'Copy failed'
  }
})

syncOutputs()

void (async () => {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
  await setSource(SAMPLE_URL)
})()

import './style.css'
import {
  buildWordPortrait,
  portraitToPlainText,
} from './lib/buildWordPortrait'
import { gridForDensity } from './lib/gridForDensity'
import { imageToPixels, loadImage } from './lib/imagePixels'
import { renderPortrait } from './lib/renderPortrait'
import { sampleBrightnessGrid } from './lib/sampleBrightnessGrid'
import { WORD_BANK } from './lib/wordBank'
import type { PixelSource } from './lib/sampleBrightnessGrid'
import type { WordPortrait } from './lib/buildWordPortrait'

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
        <span>Contrast <output id="contrastOut" for="contrast">0.62</output></span>
        <input id="contrast" type="range" min="0" max="1" step="0.01" value="0.62" />
      </label>
      <button type="button" id="copy" class="copy">Copy text</button>
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
const copyBtn = document.querySelector<HTMLButtonElement>('#copy')!
const portraitEl = document.querySelector<HTMLDivElement>('#portrait')!

let pixels: PixelSource | null = null
let objectUrl: string | null = null
let latestPortrait: WordPortrait | null = null

function syncOutputs(): void {
  densityOut.value = Number(densityInput.value).toFixed(2)
  contrastOut.value = Number(contrastInput.value).toFixed(2)
}

function rebuild(): void {
  if (!pixels) return
  const density = Number(densityInput.value)
  const contrast = Number(contrastInput.value)
  const { cols, rows } = gridForDensity(density, pixels.width, pixels.height)
  const grid = sampleBrightnessGrid(pixels, cols, rows)
  // Size relative to cell: denser grids use smaller type
  const baseFontPx = Math.max(6, Math.round(520 / cols))
  latestPortrait = buildWordPortrait(grid, WORD_BANK, { contrast, baseFontPx })
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
void setSource(SAMPLE_URL)

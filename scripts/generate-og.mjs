/**
 * Membuat gambar OG (1200×630) dari template HTML yang dirender Chromium.
 *
 * Kenapa lewat browser: teks asli jadi tajam dan konsisten dengan tema aplikasi,
 * tanpa menambah dependensi font/kanvas. Jalankan: `node scripts/generate-og.mjs`
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const OUT = 'public/og-image.png'

function star() {
  const outer = 34
  const inner = 14
  const cx = 50
  const cy = 51
  const points = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`
  })
  return `<polygon points="${points.join(' ')}" />`
}

const GLYPHS = {
  circle: '<circle cx="50" cy="50" r="32" />',
  square: '<rect x="17" y="17" width="66" height="66" />',
  triangle: '<polygon points="50,16 84,80 16,80" />',
  star: star(),
}

const BOARD = [
  ['triangle', 'star', 'square', 'circle', 'star', 'triangle'],
  ['square', 'circle', 'star', 'square', 'triangle', 'triangle'],
  ['circle', 'square', 'triangle', 'star', 'circle', 'square'],
  ['star', 'triangle', 'square', 'circle', 'star', 'triangle'],
  ['triangle', 'square', 'circle', 'star', 'square', 'circle'],
  ['square', 'star', 'triangle', 'square', 'circle', 'star'],
]

const marked = new Set(['r0c3', 'r2c0', 'r3c3'])

function board() {
  const cells = BOARD.flatMap((row, r) =>
    row.map((shape, c) => {
      const id = `r${r}c${c}`
      const isMarked = marked.has(id)
      return `<div class="cell${isMarked ? ' marked' : ''}">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"
             stroke-linecap="round" stroke-linejoin="round">${GLYPHS[shape]}</svg>
        ${isMarked ? '<span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,13 10,18 19,7"/></svg></span>' : ''}
      </div>`
    }),
  )

  return `<div class="board">${cells.join('')}<span class="midline"></span></div>`
}

const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #FAF8F3; color: #1F2937;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .canvas {
    position: relative; width: 1200px; height: 630px;
    padding: 56px 64px 44px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .canvas::after {
    content: ''; position: absolute; inset: 20px;
    border: 3px solid #1F2937; border-radius: 28px; pointer-events: none;
  }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand span { font-size: 20px; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: #4B5563; }
  .badge {
    font-size: 17px; font-weight: 600; letter-spacing: .04em;
    color: #2F6B3C; background: #DCE9DC; border: 2px solid #2F6B3C;
    padding: 8px 16px; border-radius: 999px;
  }
  .body { display: flex; align-items: center; gap: 44px; }
  .copy { flex: 1; }
  h1 { font-size: 58px; line-height: 1.05; letter-spacing: -0.02em; font-weight: 700; }
  h1 em { font-style: normal; color: #2F6B3C; }
  p { margin-top: 22px; font-size: 23px; line-height: 1.45; color: #4B5563; max-width: 560px; }
  .chips { display: flex; gap: 10px; margin-top: 26px; flex-wrap: wrap; }
  .chips span {
    font-size: 17px; font-weight: 500; color: #1F2937;
    border: 2px solid #D8D3C7; border-radius: 10px; padding: 7px 14px; background: #fff;
  }
  .board {
    position: relative; flex: none;
    display: grid; grid-template-columns: repeat(6, 62px); gap: 10px;
    padding: 20px; background: #fff; border: 3px solid #1F2937; border-radius: 20px;
  }
  .cell {
    position: relative; width: 62px; height: 62px;
    display: grid; place-items: center; color: #1F2937;
    border-radius: 12px;
  }
  .cell svg { width: 40px; height: 40px; }
  .cell.marked { background: #DCE9DC; color: #2F6B3C; }
  .check {
    position: absolute; top: 2px; right: 2px; width: 18px; height: 18px;
    display: grid; place-items: center; border-radius: 999px; background: #2F6B3C; color: #FAF8F3;
  }
  .check svg { width: 12px; height: 12px; }
  .midline {
    position: absolute; top: 20px; bottom: 20px; left: 50%; width: 3px;
    transform: translateX(-50%); background: #1F2937; border-radius: 999px; opacity: .85;
  }
  .footer {
    display: flex; align-items: center; justify-content: space-between;
    font-size: 18px; color: #6B7280;
  }
  .footer b { color: #1F2937; font-weight: 600; }
</style></head>
<body>
  <div class="canvas">
    <div class="top">
      <div class="brand">
        <svg width="46" height="46" viewBox="0 0 32 32" fill="none" stroke="#1F2937" stroke-width="2">
          <rect x="1" y="1" width="30" height="30" rx="8" />
          <circle cx="16" cy="16" r="7" />
          <path d="M16 2v3M16 27v3" stroke-linecap="round" />
        </svg>
        <span>Kognitif Visual</span>
      </div>
      <div class="badge">Bisa dipakai offline</div>
    </div>

    <div class="body">
      <div class="copy">
        <h1>Latihan kognitif visual<br />untuk pasien <em>pasca stroke</em></h1>
        <p>Papan cancellation test tiga level, umpan balik suara, dan laporan terapis —
           semua tersimpan di perangkat, tanpa akun.</p>
        <div class="chips"><span>3 level</span><span>Suara</span><span>Laporan CSV</span><span>PWA</span></div>
      </div>
      ${board()}
    </div>

    <div class="footer">
      <span><b>trazmedia.com</b></span>
      <span>Latihan kognitif pasca stroke</span>
    </div>
  </div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.screenshot({ path: OUT })
await browser.close()

await mkdir('public', { recursive: true })
console.log(`OG image dibuat: ${OUT} (1200×630)`)

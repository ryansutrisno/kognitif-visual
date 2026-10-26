/**
 * Membuat ikon PNG (192, 512, 512 maskable, apple-touch 180) tanpa dependensi
 * desain eksternal. Jalankan: `node scripts/generate-icons.mjs`
 *
 * Bentuk: lingkaran target + garis tengah, warna sama dengan brand aplikasi.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const PAPER = [0xfa, 0xf8, 0xf3]
const INK = [0x1f, 0x29, 0x37]

/* ------------------------------- PNG writer ------------------------------ */

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = -1
  for (const byte of buffer) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  }
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([length, body, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ------------------------------- Rasterizer ------------------------------ */

const SS = 4 // supersampling factor untuk tepi halus

function render(size, { padding = 0, rounded = false } = {}) {
  const big = size * SS
  const canvas = new Float32Array(big * big * 4)

  const set = (x, y, color, alpha = 1) => {
    if (x < 0 || y < 0 || x >= big || y >= big) return
    const i = (y * big + x) * 4
    canvas[i] = color[0]
    canvas[i + 1] = color[1]
    canvas[i + 2] = color[2]
    canvas[i + 3] = alpha * 255
  }

  // latar
  for (let y = 0; y < big; y++) {
    for (let x = 0; x < big; x++) {
      set(x, y, PAPER)
    }
  }

  const art = big - padding * 2 * SS
  const cx = big / 2
  const cy = big / 2
  const stroke = Math.max(2 * SS, Math.round(art * 0.048))
  const ringR = art * 0.315
  const tickHalf = art * 0.16
  const tickGap = ringR + art * 0.02

  const paint = (color) => {
    for (let y = 0; y < big; y++) {
      for (let x = 0; x < big; x++) {
        const dx = x + 0.5 - cx
        const dy = y + 0.5 - cy
        const dist = Math.hypot(dx, dy)
        const onRing = Math.abs(dist - ringR) <= stroke / 2

        const onTick =
          Math.abs(dx) <= stroke / 2 &&
          Math.abs(dy) > tickGap &&
          Math.abs(dy) <= tickGap + tickHalf

        if (onRing || onTick) set(x, y, color)
      }
    }
  }

  paint(INK)

  if (rounded) {
    // sudut membulat lembut agar tidak terlihat kotak tajam di iOS
    const r = big * 0.22
    for (let y = 0; y < big; y++) {
      for (let x = 0; x < big; x++) {
        const nx = Math.min(x, big - 1 - x) + 0.5
        const ny = Math.min(y, big - 1 - y) + 0.5
        if (nx < r && ny < r && Math.hypot(r - nx, r - ny) > r) {
          const i = (y * big + x) * 4
          canvas[i + 3] = 0
        }
      }
    }
  }

  // downscale box filter
  const out = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const i = ((y * SS + sy) * big + (x * SS + sx)) * 4
          r += canvas[i]
          g += canvas[i + 1]
          b += canvas[i + 2]
          a += canvas[i + 3]
        }
      }
      const n = SS * SS
      const o = (y * size + x) * 4
      out[o] = Math.round(r / n)
      out[o + 1] = Math.round(g / n)
      out[o + 2] = Math.round(b / n)
      out[o + 3] = Math.round(a / n)
    }
  }
  return out
}

/* --------------------------------- Main ---------------------------------- */

mkdirSync(OUT_DIR, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192, options: { rounded: true } },
  { file: 'icon-512.png', size: 512, options: { rounded: true } },
  // maskable: seni dikecilkan ke safe zone 80%
  { file: 'icon-512-maskable.png', size: 512, options: { padding: 51 } },
  { file: 'apple-touch-icon.png', size: 180, options: {} },
]

for (const { file, size, options } of targets) {
  const png = encodePng(size, render(size, options))
  writeFileSync(join(OUT_DIR, file), png)
  console.log(`✓ ${file} (${size}×${size}, ${Math.round(png.length / 1024)} KB)`)
}

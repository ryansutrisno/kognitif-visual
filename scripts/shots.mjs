/**
 * Validasi responsif: memotret layar-layar utama di beberapa ukuran perangkat
 * dan melaporkan overflow horizontal / error runtime.
 *
 * Pakai: node scripts/shots.mjs [baseUrl]
 * Hasil: /tmp/kognitif-shots/*.png + ringkasan di stdout
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = '/tmp/kognitif-shots'

const VIEWPORTS = [
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
]

const results = []
const problems = []

async function shot(page, viewport, screen) {
  const file = `${OUT}/${viewport}-${screen}.png`
  await page.screenshot({ path: file, fullPage: true })

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      scrollHeight: doc.scrollHeight,
      clientHeight: doc.clientHeight,
      // Tombol yang keluar dari layar / lebih kecil dari 44px.
      smallTargets: [...document.querySelectorAll('button')]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && (r.width < 44 || r.height < 44)).length,
    }
  })

  const overflowX = metrics.scrollWidth - metrics.clientWidth
  if (overflowX > 1) problems.push(`${viewport}/${screen}: overflow horizontal ${overflowX}px`)
  if (metrics.smallTargets > 0)
    problems.push(`${viewport}/${screen}: ${metrics.smallTargets} tombol < 44px`)

  results.push({ viewport, screen, ...metrics })
  return file
}

const browser = await chromium.launch()

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: viewport.width < 700,
    hasTouch: viewport.width < 900,
  })
  const page = await context.newPage()

  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`${viewport.name}: console — ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`${viewport.name}: pageerror — ${error.message}`))

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Pilih profil' }).waitFor()
  await shot(page, viewport.name, '01-profil')

  await page.locator('input').first().fill(`PS-${viewport.width}`)
  await page.locator('input').nth(1).fill('A. S.')
  await page.getByRole('button', { name: 'Tambah profil' }).click()

  await page.getByRole('heading', { name: 'Latihan mencari gambar' }).waitFor()
  await shot(page, viewport.name, '02-level')

  await page.getByLabel('Pengaturan tampilan').click()
  await page.getByRole('heading', { name: 'Pengaturan' }).waitFor()
  await shot(page, viewport.name, '03-pengaturan')
  await page.getByRole('button', { name: 'Tutup' }).click()

  await page.getByRole('button', { name: /Mulai Level 1/ }).click()
  await page.getByRole('heading', { name: 'Cara bermain' }).waitFor()
  await shot(page, viewport.name, '04-instruksi')

  await page.getByRole('button', { name: 'Siap, mulai' }).click()
  await page.getByRole('heading', { name: 'Coba dulu, ya' }).waitFor()
  await shot(page, viewport.name, '05-latihan')

  await page.getByRole('button', { name: 'Lanjut ke papan' }).click()
  await page.locator('button[aria-pressed]').first().waitFor()
  await shot(page, viewport.name, '06-papan-l1')

  await page.getByRole('button', { name: 'Selesai' }).click()
  await page.getByRole('heading', { name: 'Papan selesai' }).waitFor()
  await shot(page, viewport.name, '07-hasil')

  await page.getByRole('button', { name: 'Selesai' }).click()
  await page.getByRole('heading', { name: 'Latihan mencari gambar' }).waitFor()

  await page.getByRole('button', { name: 'Laporan terapis' }).last().click()
  await page.locator('input[type="password"]').fill('1234')
  await page.getByRole('heading', { name: 'Laporan sesi' }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, viewport.name, '08-laporan')
  await page.getByRole('button', { name: 'Tutup' }).click()

  await page.getByRole('button', { name: /Mulai Level 3/ }).click()
  await page.getByRole('button', { name: 'Siap, mulai' }).click()
  await page.getByRole('button', { name: 'Lanjut ke papan' }).click()
  await page.locator('button[aria-pressed]').first().waitFor()
  await shot(page, viewport.name, '09-papan-l3')

  await context.close()
}

await browser.close()
await mkdir(OUT, { recursive: true })

console.log(JSON.stringify({ results, problems }, null, 2))

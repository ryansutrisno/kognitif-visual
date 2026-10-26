import { mulberry32, shuffle } from './rng'
import { TARGET_SHAPE, type Board, type BoardSpec, type Cell, type Shape } from './types'

/**
 * Bangun papan deterministik dari (config, seed).
 * Aturan:
 *  - `targetCount` kotak acak jadi target (lingkaran).
 *  - Sisa kotak jadi distraktor, dibagi rata antar bentuk distraktor.
 *  - Seed sama + config sama → papan identik.
 */
export function generateBoard(config: BoardSpec, seed: number): Board {
  const { rows, cols, targetCount } = config
  const total = rows * cols

  if (targetCount > total) {
    throw new Error(
      `Konfigurasi tidak valid: targetCount (${targetCount}) > jumlah kotak (${total}).`,
    )
  }

  const rng = mulberry32(seed)

  const positions = Array.from({ length: total }, (_, i) => i)
  shuffle(positions, rng)

  const targetPositions = new Set(positions.slice(0, targetCount))

  // Distraktor: putar bentuk-bentuk yang diizinkan supaya jumlahnya seimbang,
  // lalu acak urutannya agar tidak ada pola yang bisa "ditebak".
  const distractorSlots = total - targetCount
  const pool: Shape[] = Array.from(
    { length: distractorSlots },
    (_, i) => config.distractorShapes[i % config.distractorShapes.length],
  )
  shuffle(pool, rng)

  let cursor = 0
  const cells: Cell[] = positions.map((position) => {
    const row = Math.floor(position / cols)
    const col = position % cols
    const isTarget = targetPositions.has(position)
    const shape = isTarget ? TARGET_SHAPE : pool[cursor++]
    return { id: `r${row}c${col}`, row, col, shape, isTarget }
  })

  // Kembalikan urutan baris-mayor supaya enak dibaca & stabil untuk test.
  cells.sort((a, b) => a.row - b.row || a.col - b.col)

  return { seed, rows, cols, midline: config.midline, cells }
}

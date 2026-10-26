/**
 * PRNG kecil yang deterministik (mulberry32).
 * Alasan: papan harus bisa direproduksi dari seed → laporan terapis bisa
 * diulang persis, dan unit test tidak butuh snapshot acak.
 */
export type Rng = () => number

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher–Yates di tempat, memakai rng yang diberikan. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

/** Seed baru untuk sesi berikutnya (bukan dari rng board, supaya tidak berkorelasi). */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0
}

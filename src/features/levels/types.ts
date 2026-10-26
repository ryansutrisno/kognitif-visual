/**
 * Bentuk dasar yang dipakai di papan.
 * MVP: satu-satunya target adalah 'circle' — sisanya distraktor.
 */
export type Shape = 'circle' | 'square' | 'triangle' | 'star'

/** Satu kotak di papan. `index` = urutan baris-mayor (row * cols + col). */
export interface Cell {
  /** Identitas stabil: `r{row}c{col}` — dipakai sebagai key React & kunci skor. */
  id: string
  row: number
  col: number
  shape: Shape
  isTarget: boolean
}

export interface Board {
  /** Seed PRNG — disimpan agar papan bisa direproduksi persis. */
  seed: number
  rows: number
  cols: number
  midline: boolean
  cells: Cell[]
}

export type LevelId = 1 | 2 | 3

export interface LevelConfig {
  id: LevelId
  /** Nama pendek untuk terapis, mis. "Level 1". */
  label: string
  rows: number
  cols: number
  /** Jumlah bentuk target (lingkaran) di papan. */
  targetCount: number
  /** Garis pemisah kiri/kanan. L1 tanpa garis (pemanasan). */
  midline: boolean
  /** Bentuk yang boleh muncul sebagai distraktor. */
  distractorShapes: readonly Shape[]
}

/** Bentuk yang jadi target selama MVP. */
export const TARGET_SHAPE: Shape = 'circle'

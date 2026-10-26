import { generateBoard } from './generateBoard'
import type { Board, BoardSpec } from './types'

/**
 * Papan latihan: 3 kotak saja, tanpa garis tengah, tanpa penilaian.
 * Tujuannya cuma memberi contoh "tap → tanda muncul" sebelum papan dinilai.
 */
export const PRACTICE_SPEC: BoardSpec = {
  rows: 1,
  cols: 3,
  targetCount: 1,
  midline: false,
  distractorShapes: ['square', 'triangle'],
}

export function generatePracticeBoard(seed: number): Board {
  return generateBoard(PRACTICE_SPEC, seed)
}

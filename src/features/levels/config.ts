import type { LevelConfig, LevelId } from './types'

/**
 * Blueprint level (lihat keputusan blueprint):
 * L1 = 3 lingkaran dari 9 kotak (3x3), tanpa garis tengah — pemanasan.
 * L2 = 6 lingkaran dari 48 kotak (6x8), dengan garis tengah.
 * L3 = 11 lingkaran dari 88 kotak (11x8), seluruh lembar.
 *
 * Level baru = tambahkan objek di sini. Tidak ada logika lain yang perlu diubah.
 */
export const LEVELS: Record<LevelId, LevelConfig> = {
  1: {
    id: 1,
    label: 'Level 1',
    rows: 3,
    cols: 3,
    targetCount: 3,
    midline: false,
    distractorShapes: ['square', 'triangle', 'star'],
  },
  2: {
    id: 2,
    label: 'Level 2',
    rows: 6,
    cols: 8,
    targetCount: 6,
    midline: true,
    distractorShapes: ['square', 'triangle', 'star'],
  },
  3: {
    id: 3,
    label: 'Level 3',
    rows: 11,
    cols: 8,
    targetCount: 11,
    midline: true,
    distractorShapes: ['square', 'triangle', 'star'],
  },
}

export const LEVEL_IDS = [1, 2, 3] as const satisfies readonly LevelId[]

export function getLevel(id: LevelId): LevelConfig {
  return LEVELS[id]
}

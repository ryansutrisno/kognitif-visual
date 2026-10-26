import type { Board, Cell } from '../levels/types'

export interface Score {
  /** Jumlah target (lingkaran) di papan. */
  targetsTotal: number
  /** Target yang ditandai pasien. */
  hits: number
  /** Tap pertama pada bukan-target — dihitung jujur walau nanti dibatalkan. */
  falsePositives: number
  /** Target yang terlewat. */
  omissionsTotal: number
  omissionsLeft: number
  omissionsRight: number
  /**
   * Indeks neglect: (kanan − kiri) / (kanan + kiri).
   * `null` bila tidak ada omisi sama sekali (0/0 bukan data, bukan nol).
   */
  neglectIndex: number | null
  /** hits / targetsTotal, 0..1. */
  accuracy: number
}

export interface ScoreInput {
  board: Board
  /** Cell id yang saat ini bertanda (tap aktif). */
  marks: ReadonlySet<string>
  /**
   * Cell id bukan-target yang PERNAH disentuh. Default: turunan dari `marks`.
   * Dipisah agar pasien bisa membatalkan tap tanpa menghapus catatan error.
   */
  falsePositiveIds?: ReadonlySet<string>
}

/** Kolom di separuh kiri papan? (garis tengah secara implisit di `cols / 2`.) */
export function isLeftHalf(col: number, cols: number): boolean {
  return col < cols / 2
}

export function computeScore({ board, marks, falsePositiveIds }: ScoreInput): Score {
  const targets = board.cells.filter((cell) => cell.isTarget)

  let hits = 0
  let omissionsLeft = 0
  let omissionsRight = 0

  for (const target of targets) {
    if (marks.has(target.id)) {
      hits += 1
    } else if (isLeftHalf(target.col, board.cols)) {
      omissionsLeft += 1
    } else {
      omissionsRight += 1
    }
  }

  const falsePositives = falsePositiveIds
    ? countNonTargets(board, falsePositiveIds)
    : board.cells.filter((cell) => !cell.isTarget && marks.has(cell.id)).length

  const omissionsTotal = omissionsLeft + omissionsRight
  const targetsTotal = targets.length

  return {
    targetsTotal,
    hits,
    falsePositives,
    omissionsTotal,
    omissionsLeft,
    omissionsRight,
    neglectIndex:
      omissionsTotal === 0
        ? null
        : (omissionsRight - omissionsLeft) / omissionsTotal,
    accuracy: targetsTotal === 0 ? 0 : hits / targetsTotal,
  }
}

function countNonTargets(board: Board, ids: ReadonlySet<string>): number {
  let count = 0
  for (const cell of board.cells) {
    if (!cell.isTarget && ids.has(cell.id)) count += 1
  }
  return count
}

/** Bintang untuk layar pasien: 3 / 2 / 1. */
export function starsFor(score: Score): 1 | 2 | 3 {
  if (score.accuracy >= 0.9 && score.falsePositives <= 1) return 3
  if (score.accuracy >= 0.7) return 2
  return 1
}

/** Target pertama yang belum ditandai (untuk auto-fokus / test helper). */
export function firstUnmarkedTarget(board: Board, marks: ReadonlySet<string>): Cell | undefined {
  return board.cells.find((cell) => cell.isTarget && !marks.has(cell.id))
}

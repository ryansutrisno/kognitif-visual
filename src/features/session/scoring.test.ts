import { describe, expect, it } from 'vitest'
import { LEVELS } from '../levels/config'
import { generateBoard } from '../levels/generateBoard'
import { computeScore, isLeftHalf, starsFor } from './scoring'

const board = generateBoard(LEVELS[2], 424242) // 6x8, 6 target, ada garis tengah
const targets = board.cells.filter((c) => c.isTarget)

function idsOf(predicate: (index: number) => boolean) {
  return new Set(targets.filter((_, i) => predicate(i)).map((c) => c.id))
}

describe('computeScore', () => {
  it('semua target ditandai → tanpa omisi, neglect null, akurasi 1', () => {
    const score = computeScore({ board, marks: new Set(targets.map((c) => c.id)) })

    expect(score.targetsTotal).toBe(targets.length)
    expect(score.hits).toBe(targets.length)
    expect(score.omissionsTotal).toBe(0)
    expect(score.neglectIndex).toBeNull()
    expect(score.accuracy).toBe(1)
  })

  it('tanpa tanda sama sekali → semua target jadi omisi', () => {
    const score = computeScore({ board, marks: new Set() })

    expect(score.hits).toBe(0)
    expect(score.omissionsTotal).toBe(targets.length)
    expect(score.accuracy).toBe(0)
  })

  it('menghitung omisi kiri dan kanan sesuai separuh papan', () => {
    const leftOnly = idsOf((i) => isLeftHalf(targets[i].col, board.cols))
    const score = computeScore({ board, marks: leftOnly })

    expect(score.omissionsLeft).toBe(0)
    expect(score.omissionsRight).toBe(targets.length - leftOnly.size)
    // Hanya sisi kanan terlewat → indeks neglect positif (mendekati 1).
    expect(score.neglectIndex).toBeCloseTo(1, 5)
  })

  it('neglect negatif bila hanya sisi kiri terlewat', () => {
    const rightOnly = idsOf((i) => !isLeftHalf(targets[i].col, board.cols))
    const score = computeScore({ board, marks: rightOnly })
    expect(score.neglectIndex).toBeCloseTo(-1, 5)
  })

  it('menghitung salah tekan dari tap pertama walau tanda sudah dibatalkan', () => {
    const wrongCell = board.cells.find((c) => !c.isTarget)!
    const score = computeScore({
      board,
      marks: new Set(), // tap sudah dibatalkan
      falsePositiveIds: new Set([wrongCell.id]),
    })

    expect(score.falsePositives).toBe(1)
  })

  it('mengabaikan tanda pada bukan-target saat salah tekan tidak dicatat', () => {
    const wrongCell = board.cells.find((c) => !c.isTarget)!
    const score = computeScore({ board, marks: new Set([wrongCell.id]) })
    expect(score.falsePositives).toBe(1)
  })
})

describe('isLeftHalf', () => {
  it('membelah papan 8 kolom menjadi 4 dan 4', () => {
    expect([0, 1, 2, 3].every((col) => isLeftHalf(col, 8))).toBe(true)
    expect([4, 5, 6, 7].every((col) => isLeftHalf(col, 8))).toBe(false)
  })

  it('papan ganjil menaruh kolom tengah di kiri', () => {
    expect(isLeftHalf(1, 3)).toBe(true)
    expect(isLeftHalf(2, 3)).toBe(false)
  })
})

describe('starsFor', () => {
  const base = {
    targetsTotal: 10,
    omissionsTotal: 0,
    omissionsLeft: 0,
    omissionsRight: 0,
    neglectIndex: null,
  }

  it('3 bintang saat akurasi ≥90% dan salah tekan ≤1', () => {
    expect(starsFor({ ...base, hits: 10, accuracy: 1, falsePositives: 0 })).toBe(3)
    expect(starsFor({ ...base, hits: 9, accuracy: 0.9, falsePositives: 1 })).toBe(3)
  })

  it('2 bintang saat akurasi ≥70%', () => {
    expect(starsFor({ ...base, hits: 7, accuracy: 0.7, falsePositives: 0 })).toBe(2)
  })

  it('1 bintang untuk sisanya', () => {
    expect(starsFor({ ...base, hits: 5, accuracy: 0.5, falsePositives: 0 })).toBe(1)
  })

  it('akurasi tinggi tapi banyak salah tekan tidak dapat 3 bintang', () => {
    expect(starsFor({ ...base, hits: 10, accuracy: 1, falsePositives: 3 })).toBe(2)
  })
})

import { describe, expect, it } from 'vitest'
import type { SessionRecord } from '../../lib/db'
import type { Score } from '../session/scoring'
import { aggregateSession, nextLevel, sessionAccuracy, suggestsLevelUp } from './aggregate'

function score(partial: Partial<Score> = {}): Score {
  const targetsTotal = partial.targetsTotal ?? 3
  const hits = partial.hits ?? targetsTotal
  return {
    targetsTotal,
    hits,
    falsePositives: partial.falsePositives ?? 0,
    omissionsTotal: partial.omissionsTotal ?? targetsTotal - hits,
    omissionsLeft: partial.omissionsLeft ?? 0,
    omissionsRight: partial.omissionsRight ?? 0,
    neglectIndex: partial.neglectIndex ?? null,
    accuracy: targetsTotal === 0 ? 0 : hits / targetsTotal,
  }
}

function record(partial: Partial<SessionRecord> = {}): SessionRecord {
  return {
    sessionId: 'ses-1',
    patientCode: 'PS-001',
    level: 1,
    startedAt: 1_000,
    durationMs: 60_000,
    targetsTotal: 9,
    hits: 9,
    falsePositives: 0,
    omissionsTotal: 0,
    omissionsLeft: 0,
    omissionsRight: 0,
    neglectIndex: null,
    completed: true,
    ...partial,
  }
}

describe('aggregateSession', () => {
  it('menggabungkan tiga papan menjadi satu baris sesi', () => {
    const result = aggregateSession({
      sessionId: 'ses-1',
      patientCode: 'PS-001',
      level: 2,
      startedAt: 1_000,
      durationMs: 90_000,
      boardScores: [
        score({ targetsTotal: 6, hits: 6 }),
        score({ targetsTotal: 6, hits: 5, omissionsTotal: 1, omissionsLeft: 1 }),
        score({ targetsTotal: 6, hits: 4, omissionsTotal: 2, omissionsRight: 2 }),
      ],
      completed: true,
    })

    expect(result.targetsTotal).toBe(18)
    expect(result.hits).toBe(15)
    expect(result.omissionsTotal).toBe(3)
    expect(result.omissionsLeft).toBe(1)
    expect(result.omissionsRight).toBe(2)
    expect(result.durationMs).toBe(90_000)
    expect(result.level).toBe(2)
  })

  it('indeks neglect dihitung dari total, bukan rata-rata indeks per papan', () => {
    const result = aggregateSession({
      sessionId: 'ses-1',
      patientCode: 'PS-001',
      level: 3,
      startedAt: 1_000,
      durationMs: 1_000,
      boardScores: [
        score({ targetsTotal: 11, hits: 10, omissionsTotal: 1, omissionsLeft: 1 }),
        score({ targetsTotal: 11, hits: 8, omissionsTotal: 3, omissionsRight: 3 }),
      ],
      completed: true,
    })

    // (3 - 1) / 4 = 0.5 — kalau dirata-rata per papan hasilnya berbeda.
    expect(result.neglectIndex).toBeCloseTo(0.5, 6)
  })

  it('tanpa omisi sama sekali, indeks neglect null (0/0 bukan data)', () => {
    const result = aggregateSession({
      sessionId: 'ses-1',
      patientCode: 'PS-001',
      level: 1,
      startedAt: 1_000,
      durationMs: 1_000,
      boardScores: [score({ targetsTotal: 3, hits: 3 })],
      completed: true,
    })

    expect(result.omissionsTotal).toBe(0)
    expect(result.neglectIndex).toBeNull()
  })

  it('menandai sesi yang ditinggalkan sebagai belum selesai', () => {
    const result = aggregateSession({
      sessionId: 'ses-9',
      patientCode: 'PS-001',
      level: 1,
      startedAt: 5_000,
      durationMs: 20_000,
      boardScores: [score()],
      completed: false,
    })

    expect(result.completed).toBe(false)
    expect(result.startedAt).toBe(5_000)
  })
})

describe('suggestsLevelUp', () => {
  it('menyarankan naik level setelah dua sesi berturut memenuhi kriteria', () => {
    const sessions = [
      record({ sessionId: 'a', startedAt: 1, targetsTotal: 9, hits: 9 }),
      record({ sessionId: 'b', startedAt: 2, targetsTotal: 9, hits: 9, omissionsTotal: 1 }),
    ]

    expect(suggestsLevelUp(sessions, 1)).toBe(true)
  })

  it('tidak menyarankan kalau salah satu sesi akurasinya rendah', () => {
    const sessions = [
      record({ sessionId: 'a', startedAt: 1, targetsTotal: 9, hits: 9 }),
      record({ sessionId: 'b', startedAt: 2, targetsTotal: 9, hits: 7, omissionsTotal: 2 }),
    ]

    expect(suggestsLevelUp(sessions, 1)).toBe(false)
  })

  it('hanya melihat dua sesi terakhir dan sesi yang selesai', () => {
    const sessions = [
      record({ sessionId: 'a', startedAt: 1, targetsTotal: 9, hits: 9 }),
      record({ sessionId: 'b', startedAt: 2, targetsTotal: 9, hits: 9 }),
      record({ sessionId: 'c', startedAt: 3, targetsTotal: 9, hits: 4, omissionsTotal: 5 }),
      // Sesi terbaru ditinggalkan: tidak boleh merusak maupun membantu penilaian.
      record({ sessionId: 'd', startedAt: 4, completed: false, targetsTotal: 9, hits: 0 }),
    ]

    expect(suggestsLevelUp(sessions, 1)).toBe(false)
  })

  it('butuh dua sesi, bukan satu', () => {
    expect(suggestsLevelUp([record({ startedAt: 1 })], 1)).toBe(false)
  })
})

describe('helper laporan', () => {
  it('menghitung akurasi dari target total', () => {
    expect(sessionAccuracy(record({ targetsTotal: 10, hits: 7 }))).toBeCloseTo(0.7, 6)
    expect(sessionAccuracy(record({ targetsTotal: 0, hits: 0 }))).toBe(0)
  })

  it('level tertinggi tidak punya level berikutnya', () => {
    expect(nextLevel(1)).toBe(2)
    expect(nextLevel(2)).toBe(3)
    expect(nextLevel(3)).toBeNull()
  })
})

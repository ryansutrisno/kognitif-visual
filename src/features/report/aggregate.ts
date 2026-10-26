import type { SessionRecord } from '../../lib/db'
import type { LevelId } from '../levels/types'
import type { Score } from '../session/scoring'

/**
 * Satu sesi = sampai tiga papan. Untuk laporan, papan-papan itu digabung
 * menjadi satu baris (kolom CSV blueprint), bukan tiga baris terpisah.
 */
export interface SessionDraft {
  sessionId: string
  patientCode: string
  level: LevelId
  startedAt: number | null
  durationMs: number
  boardScores: readonly Score[]
  completed: boolean
}

export function aggregateSession(draft: SessionDraft): SessionRecord {
  let targetsTotal = 0
  let hits = 0
  let falsePositives = 0
  let omissionsTotal = 0
  let omissionsLeft = 0
  let omissionsRight = 0

  for (const score of draft.boardScores) {
    targetsTotal += score.targetsTotal
    hits += score.hits
    falsePositives += score.falsePositives
    omissionsTotal += score.omissionsTotal
    omissionsLeft += score.omissionsLeft
    omissionsRight += score.omissionsRight
  }

  const omitted = omissionsLeft + omissionsRight

  return {
    sessionId: draft.sessionId,
    patientCode: draft.patientCode,
    level: draft.level,
    startedAt: draft.startedAt ?? Date.now(),
    durationMs: draft.durationMs,
    targetsTotal,
    hits,
    falsePositives,
    omissionsTotal,
    omissionsLeft,
    omissionsRight,
    // 0/0 bukan data: eksplisit null, bukan 0 yang bisa disalahartikan "seimbang".
    neglectIndex: omitted === 0 ? null : (omissionsRight - omissionsLeft) / omitted,
    completed: draft.completed,
  }
}

/** Akurasi sesi gabungan: target kena / seluruh target. */
export function sessionAccuracy(record: SessionRecord): number {
  if (record.targetsTotal === 0) return 0
  return record.hits / record.targetsTotal
}

/**
 * Saran naik level (blueprint): dua sesi terakhir pada level yang sama,
 * keduanya selesai, akurasi ≥90% dan omisi ≤1.
 * Naik level tetap keputusan terapis — ini cuma saran.
 */
export function suggestsLevelUp(
  sessions: readonly SessionRecord[],
  level: LevelId,
): boolean {
  const recent = sessions
    .filter((record) => record.level === level && record.completed)
    .sort((a, b) => a.startedAt - b.startedAt)
    .slice(-2)

  if (recent.length < 2) return false

  return recent.every(
    (record) => sessionAccuracy(record) >= 0.9 && record.omissionsTotal <= 1,
  )
}

/** Level berikutnya, atau null kalau sudah level tertinggi. */
export function nextLevel(level: LevelId): LevelId | null {
  if (level === 1) return 2
  if (level === 2) return 3
  return null
}

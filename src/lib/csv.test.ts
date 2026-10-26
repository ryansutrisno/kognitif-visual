import { describe, expect, it } from 'vitest'
import { sessionsToCsv } from './csv'
import type { SessionRecord } from './db'

function record(partial: Partial<SessionRecord> = {}): SessionRecord {
  return {
    sessionId: 'PS-001-1',
    patientCode: 'PS-001',
    level: 2,
    startedAt: Date.UTC(2026, 0, 2, 3, 4, 5),
    durationMs: 90_000,
    targetsTotal: 18,
    hits: 16,
    falsePositives: 2,
    omissionsTotal: 2,
    omissionsLeft: 0,
    omissionsRight: 2,
    neglectIndex: 1,
    completed: true,
    ...partial,
  }
}

describe('sessionsToCsv', () => {
  it('memakai header kolom sesuai blueprint', () => {
    const header = sessionsToCsv([]).trim()
    expect(header).toBe(
      'patient_code,session_id,level,started_at,duration_ms,targets_total,hits,false_positives,omissions_total,omissions_left,omissions_right,neglect_index,completed',
    )
  })

  it('menulis satu baris per sesi dengan tanggal ISO', () => {
    const csv = sessionsToCsv([record()])
    const [, row] = csv.trim().split('\n')

    expect(row).toBe(
      'PS-001,PS-001-1,2,2026-01-02T03:04:05.000Z,90000,18,16,2,2,0,2,1.000,true',
    )
  })

  it('mengosongkan indeks neglect kalau tidak ada omisi', () => {
    const csv = sessionsToCsv([record({ neglectIndex: null, omissionsTotal: 0 })])
    const [, row] = csv.trim().split('\n')

    expect(row?.endsWith(',,true')).toBe(true)
  })

  it('meng-escape nilai yang mengandung koma dan kutip', () => {
    const csv = sessionsToCsv([record({ patientCode: 'PS-001,"A"' })])
    expect(csv).toContain('"PS-001,""A"""')
  })
})

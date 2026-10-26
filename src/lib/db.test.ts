import { beforeEach, describe, expect, it } from 'vitest'
import {
  addPatient,
  db,
  deleteAllData,
  deletePatient,
  listPatients,
  listSessions,
  normalizeCode,
  saveSessionRecord,
} from './db'
import type { SessionRecord } from './db'

function record(partial: Partial<SessionRecord>): SessionRecord {
  return {
    sessionId: 'ses-1',
    patientCode: 'PS-001',
    level: 1,
    startedAt: 1,
    durationMs: 1_000,
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

describe('penyimpanan Dexie', () => {
  beforeEach(async () => {
    await db.patients.clear()
    await db.sessions.clear()
  })

  it('menormalkan kode pasien jadi huruf besar', async () => {
    const patient = await addPatient({ code: ' ps-001 ', initials: 'A. S.' })

    expect(normalizeCode(' ps-001 ')).toBe('PS-001')
    expect(patient.code).toBe('PS-001')
    expect(await listPatients()).toHaveLength(1)
  })

  it('menolak kode pasien ganda', async () => {
    await addPatient({ code: 'PS-001', initials: 'A. S.' })
    await expect(addPatient({ code: 'ps-001', initials: 'B. P.' })).rejects.toThrow()
  })

  it('menyimpan sesi dan mengurutkan riwayat per pasien', async () => {
    await saveSessionRecord(record({ sessionId: 'ses-lama', startedAt: 100 }))
    await saveSessionRecord(record({ sessionId: 'ses-baru', startedAt: 300 }))
    await saveSessionRecord(
      record({ sessionId: 'ses-lain', patientCode: 'PS-002', startedAt: 200 }),
    )

    const history = await listSessions('PS-001')
    expect(history.map((item) => item.sessionId)).toEqual(['ses-lama', 'ses-baru'])
  })

  it('menimpa sesi dengan id yang sama (dipakai saat sesi lanjut)', async () => {
    await saveSessionRecord(record({ sessionId: 'ses-1', hits: 5 }))
    await saveSessionRecord(record({ sessionId: 'ses-1', hits: 9 }))

    const history = await listSessions('PS-001')
    expect(history).toHaveLength(1)
    expect(history[0]?.hits).toBe(9)
  })

  it('menghapus satu pasien beserta sesinya, tanpa menyentuh pasien lain', async () => {
    await addPatient({ code: 'PS-001', initials: 'A. S.' })
    await addPatient({ code: 'PS-002', initials: 'B. P.' })
    await saveSessionRecord(record({ sessionId: 'ses-a', patientCode: 'PS-001' }))
    await saveSessionRecord(record({ sessionId: 'ses-b', patientCode: 'PS-002' }))

    await deletePatient('PS-001')

    expect((await listPatients()).map((patient) => patient.code)).toEqual(['PS-002'])
    expect(await listSessions('PS-001')).toHaveLength(0)
    expect(await listSessions('PS-002')).toHaveLength(1)
  })

  it('menghapus seluruh profil dan sesi sekaligus', async () => {
    await addPatient({ code: 'PS-001', initials: 'A. S.' })
    await addPatient({ code: 'PS-002', initials: 'B. P.' })
    await saveSessionRecord(record({ sessionId: 'ses-a' }))

    await deleteAllData()

    expect(await listPatients()).toHaveLength(0)
    expect(await db.sessions.count()).toBe(0)
  })
})

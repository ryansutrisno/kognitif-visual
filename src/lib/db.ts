import Dexie, { type Table } from 'dexie'
import type { LevelId } from '../features/levels/types'

/**
 * Penyimpanan lokal (IndexedDB lewat Dexie). Tidak ada backend: data pasien
 * tidak pernah keluar dari perangkat kecuali lewat ekspor CSV yang disengaja.
 */

export interface Patient {
  /** Kode unik, mis. `PS-001`. Bukan nama lengkap — sengaja. */
  code: string
  /** Inisial, mis. `A. S.` */
  initials: string
  /** Opsional; cukup tahun supaya tidak terasa seperti data sensitif. */
  birthYear: number | null
  createdAt: number
}

export interface SessionRecord {
  sessionId: string
  patientCode: string
  level: LevelId
  startedAt: number
  /** Waktu aktif; jeda tidak dihitung. */
  durationMs: number
  targetsTotal: number
  hits: number
  falsePositives: number
  omissionsTotal: number
  omissionsLeft: number
  omissionsRight: number
  /** null bila tidak ada omisi sama sekali (0/0 bukan data). */
  neglectIndex: number | null
  /** false = sesi ditinggalkan sebelum 3 papan selesai. */
  completed: boolean
}

class KognitifDB extends Dexie {
  patients!: Table<Patient, string>
  sessions!: Table<SessionRecord, string>

  constructor() {
    super('kognitif')
    this.version(1).stores({
      patients: 'code, createdAt',
      sessions: 'sessionId, patientCode, startedAt, [patientCode+startedAt]',
    })
  }
}

export const db = new KognitifDB()

/** PIN laporan klinis. MVP: konstanta, belum bisa diganti dari UI. */
export const REPORT_PIN = '1234'

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase()
}

export async function listPatients(): Promise<Patient[]> {
  return db.patients.orderBy('createdAt').toArray()
}

export async function addPatient(input: {
  code: string
  initials: string
  birthYear?: number | null
}): Promise<Patient> {
  const code = normalizeCode(input.code)
  if (!code) throw new Error('Kode pasien wajib diisi.')

  const existing = await db.patients.get(code)
  if (existing) throw new Error('Kode pasien sudah dipakai.')

  const patient: Patient = {
    code,
    initials: input.initials.trim(),
    birthYear: input.birthYear ?? null,
    createdAt: Date.now(),
  }

  await db.patients.add(patient)
  return patient
}

export async function saveSessionRecord(record: SessionRecord): Promise<void> {
  await db.sessions.put(record)
}

/** Riwayat satu pasien, terlama dulu (enak untuk membaca tren). */
export async function listSessions(patientCode: string): Promise<SessionRecord[]> {
  const rows = await db.sessions.where('patientCode').equals(patientCode).toArray()
  return rows.sort((a, b) => a.startedAt - b.startedAt)
}

export async function listAllSessions(): Promise<SessionRecord[]> {
  const rows = await db.sessions.toArray()
  return rows.sort((a, b) => a.startedAt - b.startedAt)
}

/**
 * Hapus satu pasien beserta seluruh riwayatnya. Sesi ikut dihapus supaya tidak
 * ada baris "yatim" yang muncul di laporan.
 */
export async function deletePatient(code: string): Promise<void> {
  await db.transaction('rw', db.patients, db.sessions, async () => {
    await db.sessions.where('patientCode').equals(code).delete()
    await db.patients.delete(code)
  })
}

/** Hapus semua profil & sesi. Dipakai saat tablet dipinjamkan / reset. */
export async function deleteAllData(): Promise<void> {
  await db.transaction('rw', db.patients, db.sessions, async () => {
    await db.sessions.clear()
    await db.patients.clear()
  })
}

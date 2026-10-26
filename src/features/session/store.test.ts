import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionRecord } from '../../lib/db'
import { getLevel } from '../levels/config'
import type { Cell } from '../levels/types'
import {
  BOARDS_PER_SESSION,
  SOFT_LIMIT_MS,
  boardsRemaining,
  isOverSoftLimit,
  setSessionSaver,
  useSession,
} from './store'

const store = () => useSession.getState()

function cellsByKind(kind: 'target' | 'other'): Cell[] {
  const board = store().board
  if (!board) throw new Error('papan belum disiapkan')
  return board.cells.filter((cell) => (kind === 'target' ? cell.isTarget : !cell.isTarget))
}

function markAllTargets() {
  for (const cell of cellsByKind('target')) store().tap(cell)
}

describe('store sesi', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T09:00:00Z'))
    store().endSession()
    store().selectPatient('PS-TEST')
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('mulai dari layar pilih level tanpa papan', () => {
    expect(store().status).toBe('level-select')
    expect(store().board).toBeNull()
    expect(store().levelId).toBeNull()
  })

  it('memilih level menyiapkan papan sesuai konfigurasi dan menampilkan instruksi', () => {
    store().selectLevel(2)

    const config = getLevel(2)
    const board = store().board

    expect(store().status).toBe('instruction')
    expect(store().levelId).toBe(2)
    expect(board?.rows).toBe(config.rows)
    expect(board?.cols).toBe(config.cols)
    expect(board?.cells.filter((cell) => cell.isTarget)).toHaveLength(config.targetCount)
    expect(store().boardIndex).toBe(0)
  })

  it('instruksi selesai memulai timer papan', () => {
    store().selectLevel(1)
    store().beginBoard()

    expect(store().status).toBe('running')
    expect(store().runStartedAt).not.toBeNull()
    expect(store().sessionStartedAt).not.toBeNull()
  })

  it('tap menandai target dan tap ulang membatalkan', () => {
    store().selectLevel(1)
    store().beginBoard()
    const target = cellsByKind('target')[0]

    store().tap(target)
    expect(store().marks.has(target.id)).toBe(true)
    expect(store().falsePositiveIds.size).toBe(0)

    store().tap(target)
    expect(store().marks.has(target.id)).toBe(false)
  })

  it('tap pada bukan-target tercatat sebagai salah tekan walau dibatalkan', () => {
    store().selectLevel(1)
    store().beginBoard()
    const other = cellsByKind('other')[0]

    store().tap(other)
    store().tap(other)

    expect(store().marks.has(other.id)).toBe(false)
    expect(store().falsePositiveIds.has(other.id)).toBe(true)
  })

  it('tap diabaikan saat papan dijeda', () => {
    store().selectLevel(1)
    store().beginBoard()
    store().pause()

    const target = cellsByKind('target')[0]
    store().tap(target)

    expect(store().marks.has(target.id)).toBe(false)
  })

  it('jeda menghentikan hitungan waktu, lanjut melanjutkannya', () => {
    store().selectLevel(1)
    store().beginBoard()

    vi.advanceTimersByTime(10_000)
    store().pause()
    expect(store().activeMs).toBe(10_000)

    vi.advanceTimersByTime(30_000) // saat dijeda tidak dihitung
    expect(store().activeMs).toBe(10_000)

    store().resume()
    vi.advanceTimersByTime(5_000)
    store().pause()

    expect(store().activeMs).toBe(15_000)
    expect(store().status).toBe('paused')
  })

  it('menyelesaikan papan menghitung skor dan durasi aktif', () => {
    store().selectLevel(1)
    store().beginBoard()
    vi.advanceTimersByTime(4_000)
    markAllTargets()
    store().finishBoard()

    expect(store().status).toBe('finished')
    expect(store().lastScore?.hits).toBe(3)
    expect(store().lastScore?.omissionsTotal).toBe(0)
    expect(store().boardScores).toHaveLength(1)
    expect(store().boardDurationsMs).toEqual([4_000])
    expect(store().runStartedAt).toBeNull()
  })

  it('papan berikutnya memakai papan baru dan mengosongkan tanda', () => {
    store().selectLevel(2)
    store().beginBoard()
    const firstBoard = store().board
    markAllTargets()
    store().finishBoard()

    store().nextBoard()

    expect(store().status).toBe('running')
    expect(store().boardIndex).toBe(1)
    expect(store().marks.size).toBe(0)
    expect(store().board).not.toBe(firstBoard)
  })

  it('sesi dibatasi tiga papan', () => {
    store().selectLevel(1)

    for (let index = 0; index < BOARDS_PER_SESSION; index += 1) {
      store().beginBoard()
      markAllTargets()
      store().finishBoard()
      if (index < BOARDS_PER_SESSION - 1) store().nextBoard()
    }

    expect(boardsRemaining(store())).toBe(0)

    store().nextBoard()
    expect(store().boardIndex).toBe(BOARDS_PER_SESSION - 1)
  })

  it('batas sesi lembut aktif setelah lima menit waktu aktif', () => {
    store().selectLevel(1)
    store().beginBoard()

    expect(isOverSoftLimit(store())).toBe(false)

    vi.advanceTimersByTime(SOFT_LIMIT_MS)
    store().pause()

    expect(isOverSoftLimit(store())).toBe(true)
  })

  it('mengakhiri sesi mengembalikan semuanya ke awal', () => {
    store().selectLevel(3)
    store().beginBoard()
    store().finishBoard()
    store().endSession()

    expect(store().status).toBe('level-select')
    expect(store().board).toBeNull()
    expect(store().lastScore).toBeNull()
    expect(store().boardScores).toHaveLength(0)
    expect(store().activeMs).toBe(0)
  })

  it('istirahat hanya bisa dibuka setelah papan selesai', () => {
    store().selectLevel(1)
    store().beginBoard()
    store().openRest()
    expect(store().status).toBe('running')

    markAllTargets()
    store().finishBoard()
    store().openRest()
    expect(store().status).toBe('rest')
  })

  it('papan berikutnya bisa dimulai dari layar istirahat', () => {
    store().selectLevel(1)
    store().beginBoard()
    markAllTargets()
    store().finishBoard()
    store().openRest()

    store().nextBoard()

    expect(store().status).toBe('running')
    expect(store().boardIndex).toBe(1)
    expect(store().runStartedAt).not.toBeNull()
  })

  it('papan latihan berisi tiga kotak dengan satu lingkaran', () => {
    store().selectLevel(2)
    store().beginPractice()

    const practice = store().practiceBoard
    expect(store().status).toBe('practice')
    expect(practice?.cells).toHaveLength(3)
    expect(practice?.cells.filter((cell) => cell.isTarget)).toHaveLength(1)
    expect(practice?.midline).toBe(false)
    expect(store().practiceMarks.size).toBe(0)
  })

  it('tap di papan latihan tidak menyentuh tanda maupun skor papan dinilai', () => {
    store().selectLevel(1)
    store().beginPractice()

    const cell = store().practiceBoard?.cells[0]
    if (!cell) throw new Error('papan latihan kosong')
    store().tapPractice(cell)

    expect(store().practiceMarks.has(cell.id)).toBe(true)
    expect(store().marks.size).toBe(0)
    expect(store().falsePositiveIds.size).toBe(0)
    expect(store().boardScores).toHaveLength(0)

    store().tapPractice(cell)
    expect(store().practiceMarks.has(cell.id)).toBe(false)
  })

  it('papan latihan tidak bisa dimulai tanpa memilih level', () => {
    store().beginPractice()
    expect(store().status).toBe('level-select')
    expect(store().practiceBoard).toBeNull()
  })

  it('selesai latihan langsung masuk papan dinilai dengan timer berjalan', () => {
    store().selectLevel(3)
    store().beginPractice()
    store().beginBoard()

    expect(store().status).toBe('running')
    expect(store().runStartedAt).not.toBeNull()
    expect(store().marks.size).toBe(0)
    expect(store().boardScores).toHaveLength(0)
  })

  it('memilih level baru membersihkan papan latihan sebelumnya', () => {
    store().selectLevel(1)
    store().beginPractice()
    store().selectLevel(2)

    expect(store().status).toBe('instruction')
    expect(store().practiceBoard).toBeNull()
    expect(store().practiceMarks.size).toBe(0)
  })

  it('menyimpan sesi ke penyimpanan saat keluar, dengan status completed yang jujur', () => {
    const saved: SessionRecord[] = []
    setSessionSaver((record) => {
      saved.push(record as SessionRecord)
    })

    store().selectPatient('PS-001')
    store().selectLevel(1)
    store().beginBoard()
    markAllTargets()
    store().finishBoard()
    store().endSession()
    setSessionSaver(() => {})

    expect(saved).toHaveLength(1)
    expect(saved[0]?.patientCode).toBe('PS-001')
    expect(saved[0]?.level).toBe(1)
    expect(saved[0]?.hits).toBe(saved[0]?.targetsTotal)
    // Baru satu papan dari tiga → sesi ditandai belum selesai.
    expect(saved[0]?.completed).toBe(false)
    expect(store().status).toBe('level-select')
    expect(store().patientCode).toBe('PS-001')
  })

  it('tidak menyimpan apa pun kalau belum ada papan yang dinilai', () => {
    const saved: SessionRecord[] = []
    setSessionSaver((record) => {
      saved.push(record as SessionRecord)
    })

    store().selectPatient('PS-001')
    store().selectLevel(2)
    store().endSession()
    setSessionSaver(() => {})

    expect(saved).toHaveLength(0)
  })

  it('menyimpan sesi berjalan sekali saja walau dipanggil berkali-kali', () => {
    const saved: SessionRecord[] = []
    setSessionSaver((record) => {
      saved.push(record as SessionRecord)
    })

    store().selectPatient('PS-001')
    store().selectLevel(2)
    store().beginBoard()
    markAllTargets()
    store().finishBoard()

    // Kasus tab ditutup / disembunyikan, lalu terapis keluar juga.
    store().saveCurrentSession()
    store().saveCurrentSession()
    store().endSession()
    setSessionSaver(() => {})

    expect(saved).toHaveLength(1)
    expect(saved[0]?.patientCode).toBe('PS-001')
    expect(saved[0]?.completed).toBe(false)
  })
})

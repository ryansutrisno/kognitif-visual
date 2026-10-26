import { create } from 'zustand'
import { getLevel } from '../levels/config'
import { generateBoard } from '../levels/generateBoard'
import { generatePracticeBoard } from '../levels/practice'
import { randomSeed } from '../levels/rng'
import type { Board, Cell, LevelId } from '../levels/types'
import { computeScore, type Score } from './scoring'

/**
 * Status sesi (blueprint): satu union, transisi hanya lewat action.
 * `level-select` = layar pilih level, `rest` = layar istirahat di antara papan,
 * `practice` = papan latihan 3 kotak yang tidak dinilai.
 */
export type SessionStatus =
  | 'level-select'
  | 'instruction'
  | 'practice'
  | 'running'
  | 'paused'
  | 'finished'
  | 'rest'

export const BOARDS_PER_SESSION = 3
export const REST_SECONDS = 30
/** Batas sesi lembut: setelah ini, aplikasi menawarkan istirahat. */
export const SOFT_LIMIT_MS = 5 * 60 * 1000

const EMPTY: ReadonlySet<string> = new Set<string>()

interface SessionState {
  status: SessionStatus
  levelId: LevelId | null
  /** 0-based, papan ke berapa dalam sesi ini. */
  boardIndex: number
  board: Board | null
  marks: ReadonlySet<string>
  falsePositiveIds: ReadonlySet<string>
  /** Skor papan terakhir yang diselesaikan. */
  lastScore: Score | null
  boardScores: Score[]
  /** Durasi aktif per papan (pause tidak dihitung). */
  boardDurationsMs: number[]
  sessionStartedAt: number | null
  /** Total waktu aktif sesi (pause tidak dihitung). */
  activeMs: number
  boardActiveMs: number
  /** Penanda segmen berjalan; null saat tidak menghitung waktu. */
  runStartedAt: number | null

  /** Papan latihan (3 kotak, tidak dinilai) — dimulai dari layar instruksi. */
  practiceBoard: Board | null
  practiceMarks: ReadonlySet<string>

  selectLevel: (levelId: LevelId) => void
  beginPractice: () => void
  tapPractice: (cell: Cell) => void
  beginBoard: () => void
  tap: (cell: Cell) => void
  pause: () => void
  resume: () => void
  finishBoard: () => void
  openRest: () => void
  nextBoard: () => void
  endSession: () => void
}

function makeBoard(levelId: LevelId): Board {
  return generateBoard(getLevel(levelId), randomSeed())
}

function elapsedSince(startedAt: number | null, now: number): number {
  return startedAt === null ? 0 : Math.max(0, now - startedAt)
}

export const useSession = create<SessionState>((set) => ({
  status: 'level-select',
  levelId: null,
  boardIndex: 0,
  board: null,
  marks: EMPTY,
  falsePositiveIds: EMPTY,
  lastScore: null,
  boardScores: [],
  boardDurationsMs: [],
  sessionStartedAt: null,
  activeMs: 0,
  boardActiveMs: 0,
  runStartedAt: null,
  practiceBoard: null,
  practiceMarks: EMPTY,

  /** Terapis memilih level → papan pertama disiapkan, layar instruksi tampil. */
  selectLevel: (levelId) =>
    set({
      status: 'instruction',
      levelId,
      boardIndex: 0,
      board: makeBoard(levelId),
      marks: EMPTY,
      falsePositiveIds: EMPTY,
      lastScore: null,
      boardScores: [],
      boardDurationsMs: [],
      sessionStartedAt: Date.now(),
      activeMs: 0,
      boardActiveMs: 0,
      runStartedAt: null,
      practiceBoard: null,
      practiceMarks: EMPTY,
    }),

  /** Instruksi selesai → papan latihan (tidak dinilai) sebelum papan dinilai. */
  beginPractice: () =>
    set((state) =>
      state.status === 'instruction'
        ? {
            status: 'practice',
            practiceBoard: generatePracticeBoard(randomSeed()),
            practiceMarks: EMPTY,
          }
        : state,
    ),

  /** Tap di papan latihan: hanya untuk merasakan tandanya, tanpa skor. */
  tapPractice: (cell) =>
    set((state) => {
      if (state.status !== 'practice') return state
      const marks = new Set(state.practiceMarks)
      if (marks.has(cell.id)) marks.delete(cell.id)
      else marks.add(cell.id)
      return { practiceMarks: marks }
    }),

  /** Instruksi/latihan selesai → papan berjalan, timer mulai. */
  beginBoard: () =>
    set((state) => {
      if ((state.status !== 'instruction' && state.status !== 'practice') || !state.board) {
        return state
      }
      const now = Date.now()
      return { status: 'running', runStartedAt: now, sessionStartedAt: state.sessionStartedAt ?? now }
    }),

  /** Tap sekali menandai; tap lagi membatalkan. False positive tetap dicatat. */
  tap: (cell) =>
    set((state) => {
      if (state.status !== 'running') return state

      const marks = new Set(state.marks)
      if (marks.has(cell.id)) {
        marks.delete(cell.id)
        return { marks }
      }

      marks.add(cell.id)

      // Tap pertama pada bukan-target tetap dihitung walau nanti dibatalkan.
      if (!cell.isTarget && !state.falsePositiveIds.has(cell.id)) {
        const falsePositiveIds = new Set(state.falsePositiveIds)
        falsePositiveIds.add(cell.id)
        return { marks, falsePositiveIds }
      }

      return { marks }
    }),

  pause: () =>
    set((state) => {
      if (state.status !== 'running') return state
      const now = Date.now()
      const delta = elapsedSince(state.runStartedAt, now)
      return {
        status: 'paused',
        activeMs: state.activeMs + delta,
        boardActiveMs: state.boardActiveMs + delta,
        runStartedAt: null,
      }
    }),

  resume: () =>
    set((state) =>
      state.status === 'paused' ? { status: 'running', runStartedAt: Date.now() } : state,
    ),

  finishBoard: () =>
    set((state) => {
      if (state.status !== 'running' || !state.board) return state

      const now = Date.now()
      const delta = elapsedSince(state.runStartedAt, now)
      const score = computeScore({
        board: state.board,
        marks: state.marks,
        falsePositiveIds: state.falsePositiveIds,
      })

      // Jejak untuk pengembangan; laporan terapis yang rapi masuk F4.
      console.info('[Kognitif] skor papan', score)

      return {
        status: 'finished',
        lastScore: score,
        boardScores: [...state.boardScores, score],
        boardDurationsMs: [...state.boardDurationsMs, state.boardActiveMs + delta],
        activeMs: state.activeMs + delta,
        boardActiveMs: 0,
        runStartedAt: null,
      }
    }),

  openRest: () => set((state) => (state.status === 'finished' ? { status: 'rest' } : state)),

  /** Papan berikutnya dalam sesi yang sama (dari layar hasil atau setelah istirahat). */
  nextBoard: () =>
    set((state) => {
      if (state.status !== 'finished' && state.status !== 'rest') return state
      if (!state.levelId) return state
      if (state.boardScores.length >= BOARDS_PER_SESSION) return state

      const now = Date.now()
      return {
        status: 'running',
        boardIndex: state.boardIndex + 1,
        board: makeBoard(state.levelId),
        marks: EMPTY,
        falsePositiveIds: EMPTY,
        boardActiveMs: 0,
        runStartedAt: now,
      }
    }),

  /** Selesai / keluar → bersihkan sesi, kembali ke pilih level. */
  endSession: () =>
    set({
      status: 'level-select',
      levelId: null,
      boardIndex: 0,
      board: null,
      marks: EMPTY,
      falsePositiveIds: EMPTY,
      lastScore: null,
      boardScores: [],
      boardDurationsMs: [],
      sessionStartedAt: null,
      activeMs: 0,
      boardActiveMs: 0,
      runStartedAt: null,
      practiceBoard: null,
      practiceMarks: EMPTY,
    }),
}))

export function boardsRemaining(state: SessionState): number {
  return Math.max(0, BOARDS_PER_SESSION - state.boardScores.length)
}

export function isOverSoftLimit(state: SessionState): boolean {
  return state.activeMs >= SOFT_LIMIT_MS
}

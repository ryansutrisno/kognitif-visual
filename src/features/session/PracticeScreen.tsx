import { id } from '../../lib/i18n/id'
import { playCorrect, playWrong, unlockAudio } from '../../lib/audio'
import { getLevel } from '../levels/config'
import type { Cell } from '../levels/types'
import { BoardGrid } from './BoardGrid'
import { BOARDS_PER_SESSION, useSession } from './store'

/** Papan latihan tidak menghukum salah tap, jadi tidak ada penanda "pernah salah". */
const NO_IDS: ReadonlySet<string> = new Set<string>()

/**
 * Papan latihan: 3 kotak, tidak dinilai, tidak masuk laporan.
 * Fungsinya memberi rasa "tap → tanda muncul" sebelum papan sesungguhnya.
 */
export function PracticeScreen() {
  const levelId = useSession((state) => state.levelId)
  const boardIndex = useSession((state) => state.boardIndex)
  const practiceBoard = useSession((state) => state.practiceBoard)
  const practiceMarks = useSession((state) => state.practiceMarks)
  const tapPractice = useSession((state) => state.tapPractice)
  const beginBoard = useSession((state) => state.beginBoard)
  const endSession = useSession((state) => state.endSession)

  if (levelId === null || practiceBoard === null) return null
  const config = getLevel(levelId)

  const solved = practiceBoard.cells.some(
    (cell) => cell.isTarget && practiceMarks.has(cell.id),
  )

  const handleToggle = (cell: Cell) => {
    const wasMarked = practiceMarks.has(cell.id)
    unlockAudio()
    tapPractice(cell)
    if (wasMarked) return
    if (cell.isTarget) playCorrect()
    else playWrong()
  }

  return (
    <section className="flex w-full max-w-4xl flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={endSession}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-medium text-ink-soft hover:bg-paper-sunken"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {id.board.back}
        </button>
        <span className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          {config.label} · {id.board.boardOf(boardIndex + 1, BOARDS_PER_SESSION)}
        </span>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-4 py-5 sm:px-6 sm:py-6">
        <h1 className="text-center font-display text-2xl font-semibold tracking-tight text-ink">
          {id.practice.title}
        </h1>
        <p className="mt-2 text-center text-base text-ink-soft">{id.practice.body}</p>

        <div className="mt-6">
          <BoardGrid
            board={practiceBoard}
            marks={practiceMarks}
            falsePositiveIds={NO_IDS}
            onToggle={handleToggle}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <p className="text-base text-ink-soft" aria-live="polite">
            {solved ? id.practice.done : id.practice.hint}
          </p>
          <button
            type="button"
            onClick={beginBoard}
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper"
          >
            {id.practice.next}
          </button>
        </div>
      </div>
    </section>
  )
}

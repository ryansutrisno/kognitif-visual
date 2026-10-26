import { useState } from 'react'
import { Dialog } from '../../components/Dialog'
import { id } from '../../lib/i18n/id'
import { getLevel } from '../levels/config'
import { BoardGrid } from './BoardGrid'
import { BOARDS_PER_SESSION, useSession } from './store'

/**
 * Papan yang sedang dimainkan. Seluruh state (tanda, skor, timer) ada di
 * store sesi; komponen ini hanya merender dan meneruskan tap.
 */
export function BoardScreen() {
  const status = useSession((state) => state.status)
  const levelId = useSession((state) => state.levelId)
  const board = useSession((state) => state.board)
  const boardIndex = useSession((state) => state.boardIndex)
  const marks = useSession((state) => state.marks)
  const falsePositiveIds = useSession((state) => state.falsePositiveIds)
  const tap = useSession((state) => state.tap)
  const pause = useSession((state) => state.pause)
  const resume = useSession((state) => state.resume)
  const finishBoard = useSession((state) => state.finishBoard)
  const endSession = useSession((state) => state.endSession)

  const [confirmExit, setConfirmExit] = useState(false)

  if (levelId === null || board === null) return null

  const config = getLevel(levelId)
  const paused = status === 'paused'
  const found = marks.size
  const targets = board.cells.reduce((count, cell) => (cell.isTarget ? count + 1 : count), 0)
  const compact = board.rows >= 10

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-medium text-ink-soft hover:bg-paper-sunken"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {id.board.back}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium tracking-wide text-ink-muted uppercase">
            {config.label} · {id.board.boardOf(boardIndex + 1, BOARDS_PER_SESSION)}
          </span>
          <button
            type="button"
            onClick={pause}
            disabled={paused}
            className="inline-flex min-h-11 items-center rounded-xl border-2 border-line-soft px-4 text-sm font-medium text-ink-soft hover:border-line disabled:opacity-40"
          >
            {id.board.pause}
          </button>
        </div>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className={compact ? 'font-display text-lg font-semibold' : 'font-display text-2xl font-semibold'}>
            {id.board.instruction}
          </h1>
          {!compact && <p className="text-sm text-ink-muted">{id.board.hint}</p>}
        </div>

        <div className="mt-4">
          <BoardGrid
            board={board}
            marks={marks}
            falsePositiveIds={falsePositiveIds}
            onToggle={tap}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">{found === 0 ? '' : id.board.progress(found, targets)}</p>
          <button
            type="button"
            onClick={finishBoard}
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper"
          >
            {id.board.finish}
          </button>
        </div>
      </div>

      {paused && !confirmExit && (
        <Dialog title={id.pauseOverlay.title} body={id.pauseOverlay.body}>
          <button
            type="button"
            onClick={resume}
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-6 text-lg font-medium text-paper"
          >
            {id.pauseOverlay.resume}
          </button>
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-line px-6 text-base font-medium text-ink"
          >
            {id.pauseOverlay.exit}
          </button>
        </Dialog>
      )}

      {confirmExit && (
        <Dialog title={id.exit.title} body={id.exit.body}>
          <button
            type="button"
            onClick={endSession}
            className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-miss px-6 text-base font-medium text-miss"
          >
            {id.exit.confirm}
          </button>
          <button
            type="button"
            onClick={() => setConfirmExit(false)}
            className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-6 text-lg font-medium text-paper"
          >
            {id.exit.cancel}
          </button>
        </Dialog>
      )}
    </section>
  )
}

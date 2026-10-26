import { useMemo, useState } from 'react'
import { id } from '../../lib/i18n/id'
import { generateBoard } from '../levels/generateBoard'
import { getLevel } from '../levels/config'
import { randomSeed } from '../levels/rng'
import type { Cell, LevelId } from '../levels/types'
import { BoardGrid } from './BoardGrid'
import { computeScore, starsFor, type Score } from './scoring'

interface BoardScreenProps {
  levelId: LevelId
  onExit: () => void
}

/**
 * F1: satu papan yang bisa dimainkan, skor dikirim ke console.
 * F2 akan memakai store Zustand (3 papan, hasil, istirahat) menggantikan
 * state lokal di komponen ini.
 */
export function BoardScreen({ levelId, onExit }: BoardScreenProps) {
  const config = getLevel(levelId)
  const [seed, setSeed] = useState(() => randomSeed())
  const board = useMemo(() => generateBoard(config, seed), [config, seed])

  const [marks, setMarks] = useState<ReadonlySet<string>>(() => new Set<string>())
  const [falsePositiveIds, setFalsePositiveIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  )
  const [score, setScore] = useState<Score | null>(null)

  const finished = score !== null

  function toggleCell(cell: Cell) {
    if (finished) return

    setMarks((prev) => {
      const next = new Set(prev)
      if (next.has(cell.id)) {
        next.delete(cell.id)
        return next
      }

      next.add(cell.id)

      // Tap pertama pada bukan-target tetap dicatat walau nanti dibatalkan.
      if (!cell.isTarget) {
        setFalsePositiveIds((prevWrong) => {
          if (prevWrong.has(cell.id)) return prevWrong
          const nextWrong = new Set(prevWrong)
          nextWrong.add(cell.id)
          return nextWrong
        })
      }

      return next
    })
  }

  function finish() {
    const result = computeScore({ board, marks, falsePositiveIds })
    setScore(result)
    console.info('[Kognitif] skor papan', result, 'bintang:', starsFor(result))
  }

  function playAgain() {
    setSeed(randomSeed())
    setMarks(new Set<string>())
    setFalsePositiveIds(new Set<string>())
    setScore(null)
  }

  const found = marks.size

  return (
    <section className="flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-medium text-ink-soft hover:bg-paper-sunken"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {id.board.back}
        </button>
        <span className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          {config.label}
        </span>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-5 py-6 sm:px-8 sm:py-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{id.board.instruction}</h1>
        <p className="mt-2 text-base text-ink-muted">{id.board.hint}</p>

        <div className="mt-6">
          <BoardGrid
            board={board}
            marks={marks}
            falsePositiveIds={falsePositiveIds}
            onToggle={toggleCell}
          />
        </div>

        {!finished && (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {found === 0 ? '' : id.board.progress(found, board.cells.filter((c) => c.isTarget).length)}
            </p>
            <button
              type="button"
              onClick={finish}
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper"
            >
              {id.board.finish}
            </button>
          </div>
        )}

        {score && (
          <ScorePanel score={score} onPlayAgain={playAgain} onExit={onExit} />
        )}
      </div>
    </section>
  )
}

interface ScorePanelProps {
  score: Score
  onPlayAgain: () => void
  onExit: () => void
}

/** Panel sementara F1 — F2 menggantinya dengan layar hasil (bintang) untuk pasien. */
function ScorePanel({ score, onPlayAgain, onExit }: ScorePanelProps) {
  const neglect =
    score.neglectIndex === null ? id.result.neglectEmpty : score.neglectIndex.toFixed(2)

  return (
    <div className="mt-8 rounded-xl bg-paper-sunken px-5 py-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">{id.result.title}</h2>
        <span className="text-xs tracking-wide text-ink-muted uppercase">
          {id.result.temporaryLabel}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <Row label={id.result.targets} value={score.targetsTotal} />
        <Row label={id.result.hits} value={score.hits} />
        <Row label={id.result.falsePositives} value={score.falsePositives} />
        <Row label={id.result.omissions} value={score.omissionsTotal} />
        <Row label={id.result.omissionsSplit} value={`${score.omissionsLeft} / ${score.omissionsRight}`} />
        <Row label={id.result.neglect} value={neglect} />
        <Row label={id.result.accuracy} value={`${Math.round(score.accuracy * 100)}%`} />
      </dl>

      <p className="mt-4 text-xs text-ink-muted">{id.result.temporaryNote}</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-7 text-base font-medium text-paper"
        >
          {id.result.playAgain}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-line px-7 text-base font-medium text-ink"
        >
          {id.result.finish}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line-soft pb-1">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium tabular-nums text-ink">{value}</dd>
    </div>
  )
}

import { id } from '../../lib/i18n/id'
import { LEVELS, LEVEL_IDS } from '../levels/config'
import type { LevelId } from '../levels/types'
import { useSession } from './store'

/** Layar pilih level — titik masuk aplikasi, dipakai terapis. */
export function LevelSelectScreen() {
  const selectLevel = useSession((state) => state.selectLevel)

  return (
    <section className="flex w-full max-w-3xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {id.levels.title}
        </h1>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink-soft">
          {id.levels.body}
        </p>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-6 py-7 sm:px-8 sm:py-8">
        <h2 className="font-display text-xl font-semibold text-ink">{id.levels.choose}</h2>
        <p className="mt-1 text-sm text-ink-muted">{id.levels.chooseHint}</p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {LEVEL_IDS.map((levelId) => (
            <LevelCard key={levelId} levelId={levelId} onSelect={selectLevel} />
          ))}
        </ul>
      </div>
    </section>
  )
}

interface LevelCardProps {
  levelId: LevelId
  onSelect: (levelId: LevelId) => void
}

function LevelCard({ levelId, onSelect }: LevelCardProps) {
  const config = LEVELS[levelId]
  const cells = config.rows * config.cols

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(levelId)}
        className="flex h-full w-full flex-col items-start gap-2 rounded-2xl border-2 border-line-soft bg-paper px-5 py-6 text-left transition-colors hover:border-line hover:bg-paper-sunken"
      >
        <span className="font-display text-2xl font-semibold text-ink">{config.label}</span>
        <span className="text-base text-ink-soft">{id.levels.targetNote(config.targetCount, cells)}</span>
        <span className="text-sm text-ink-muted">
          {config.rows} × {config.cols}
          {config.midline ? ` · ${id.levels.midlineNote}` : ''}
        </span>
        <span className="mt-3 inline-flex min-h-11 items-center text-base font-medium text-ink underline decoration-2 underline-offset-4">
          {id.levels.start(config.label)}
        </span>
      </button>
    </li>
  )
}

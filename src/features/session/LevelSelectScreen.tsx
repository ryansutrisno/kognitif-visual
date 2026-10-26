import { useEffect, useState } from 'react'
import { listSessions, type SessionRecord } from '../../lib/db'
import { id } from '../../lib/i18n/id'
import { LEVELS, LEVEL_IDS } from '../levels/config'
import type { LevelId } from '../levels/types'
import { nextLevel, suggestsLevelUp } from '../report/aggregate'
import { ReportLink } from '../report/ReportLink'
import { useSession } from './store'

/**
 * Layar pilih level — rumah kedua setelah profil dipilih.
 * Di sini juga muncul saran naik level (tetap keputusan terapis).
 */
export function LevelSelectScreen() {
  const patientCode = useSession((state) => state.patientCode)
  const selectLevel = useSession((state) => state.selectLevel)
  const changePatient = useSession((state) => state.changePatient)

  const [sessions, setSessions] = useState<SessionRecord[]>([])

  useEffect(() => {
    if (!patientCode) return
    let alive = true

    listSessions(patientCode)
      .then((rows) => {
        if (alive) setSessions(rows)
      })
      .catch(() => {
        if (alive) setSessions([])
      })

    return () => {
      alive = false
    }
  }, [patientCode])

  const suggestedLevel = (() => {
    for (const levelId of LEVEL_IDS) {
      const target = nextLevel(levelId)
      if (target && suggestsLevelUp(sessions, levelId)) return target
    }
    return null
  })()

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          {id.patients.current}:{' '}
          <span className="text-ink">{patientCode ?? '—'}</span>
        </p>
        <button
          type="button"
          onClick={changePatient}
          className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink-soft underline decoration-2 underline-offset-4 hover:bg-paper-sunken"
        >
          {id.patients.change}
        </button>
        <ReportLink />
      </div>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {id.levels.title}
        </h1>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink-soft">
          {id.levels.body}
        </p>
      </div>

      {suggestedLevel !== null && (
        <p
          role="status"
          className="rounded-2xl border-2 border-[color:var(--color-hit)] bg-hit-tint px-5 py-4 text-base font-medium text-hit"
        >
          {id.levels.suggest(suggestedLevel)}
        </p>
      )}

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

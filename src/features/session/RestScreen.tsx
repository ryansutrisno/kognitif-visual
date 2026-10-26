import { useEffect, useState } from 'react'
import { id } from '../../lib/i18n/id'
import { REST_SECONDS, useSession } from './store'

/** Layar istirahat 30 detik di antara papan — bisa dilewati. */
export function RestScreen() {
  const nextBoard = useSession((state) => state.nextBoard)
  const endSession = useSession((state) => state.endSession)
  const [seconds, setSeconds] = useState(REST_SECONDS)

  useEffect(() => {
    if (seconds <= 0) {
      nextBoard()
      return
    }

    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds, nextBoard])

  return (
    <section className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
      <div className="w-full rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-7 py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {id.rest.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-soft">{id.rest.body}</p>

        <p className="mt-8 font-display text-6xl font-semibold tabular-nums text-ink" aria-live="off">
          {Math.max(seconds, 0)}
        </p>
        <p className="mt-1 text-sm text-ink-muted">{id.rest.seconds(Math.max(seconds, 0))}</p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={nextBoard}
            className="inline-flex min-h-16 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper"
          >
            {id.rest.skip}
          </button>
          <button
            type="button"
            onClick={endSession}
            className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-line px-8 text-base font-medium text-ink"
          >
            {id.result.finish}
          </button>
        </div>
      </div>
    </section>
  )
}

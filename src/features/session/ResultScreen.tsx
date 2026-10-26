import { id } from '../../lib/i18n/id'
import { starsFor } from './scoring'
import { boardsRemaining, isOverSoftLimit, useSession } from './store'

/**
 * Layar hasil untuk pasien: bintang + satu kalimat positif.
 * Sengaja TANPA angka omisi dan tanpa kata "salah".
 */
export function ResultScreen() {
  const lastScore = useSession((state) => state.lastScore)
  const done = useSession((state) => state.boardScores.length)
  const remaining = useSession(boardsRemaining)
  const softLimit = useSession(isOverSoftLimit)
  const total = useSession((state) => state.boardScores.length + boardsRemaining(state))
  const nextBoard = useSession((state) => state.nextBoard)
  const openRest = useSession((state) => state.openRest)
  const endSession = useSession((state) => state.endSession)

  if (lastScore === null) return null

  const stars = starsFor(lastScore)
  const suggestRest = remaining > 0 && softLimit

  return (
    <section className="flex w-full max-w-2xl flex-col items-center gap-6 text-center">
      <div className="w-full rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-7 py-9">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {id.result.title}
        </h1>

        <div
          className="mt-5 flex items-center justify-center gap-2"
          role="img"
          aria-label={id.result.stars(stars)}
        >
          {[1, 2, 3].map((index) => (
            <Star key={index} filled={index <= stars} />
          ))}
        </div>

        <p className="mt-5 text-xl leading-relaxed text-ink-soft">{id.result.message[stars]}</p>
        <p className="mt-2 text-sm text-ink-muted">{id.result.progress(done, total)}</p>

        {suggestRest && (
          <p className="mt-6 rounded-xl bg-paper-sunken px-4 py-3 text-base text-ink-soft">
            {id.result.restSuggest}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {remaining > 0 ? (
            <>
              <button
                type="button"
                onClick={suggestRest ? openRest : nextBoard}
                className="inline-flex min-h-16 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper"
              >
                {suggestRest ? id.result.rest : id.result.next}
              </button>
              <button
                type="button"
                onClick={endSession}
                className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-line px-8 text-base font-medium text-ink"
              >
                {id.result.finish}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={endSession}
              className="inline-flex min-h-16 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper"
            >
              {id.result.finish}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={filled ? 'size-16 text-hit' : 'size-16 text-line-soft'}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="5"
      strokeLinejoin="round"
    >
      <path d="M50 8l13.2 26.8 29.6 4.3-21.4 20.8 5.1 29.5L50 75.5 23.5 89.4l5.1-29.5L7.2 39.1l29.6-4.3z" />
    </svg>
  )
}

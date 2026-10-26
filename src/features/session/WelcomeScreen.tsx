import { id } from '../../lib/i18n/id'

interface WelcomeScreenProps {
  onStart: () => void
}

/** Layar pembuka: penjelasan singkat + tombol mulai (Level 1). */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <section className="flex w-full max-w-2xl flex-col gap-8">
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl border-2 border-line bg-paper-raised text-ink">
          <span className="font-display text-xl font-semibold">K</span>
        </span>
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">
            {id.app.name}
          </p>
          <p className="text-sm text-ink-muted">{id.app.tagline}</p>
        </div>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-8 py-9 sm:px-10 sm:py-11">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {id.welcome.title}
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-soft">
          {id.welcome.body}
        </p>

        <div className="mt-9 flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex min-h-16 items-center justify-center rounded-xl bg-ink px-10 text-lg font-medium text-paper"
          >
            {id.welcome.start}
          </button>
          <p className="text-sm text-ink-muted">{id.welcome.startHint}</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">
        {id.welcome.therapistNote}
      </p>
    </section>
  )
}

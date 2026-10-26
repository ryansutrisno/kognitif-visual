import { useEffect, useMemo } from 'react'
import { ShapeGlyph } from '../../components/ShapeGlyph'
import { id } from '../../lib/i18n/id'
import { speak, stopSpeaking, useVoiceAvailable } from '../../lib/speech'
import { getLevel } from '../levels/config'
import { useSession } from './store'

/**
 * Layar instruksi sebelum papan pertama: tiga langkah singkat + satu contoh
 * visual + suara Bahasa Indonesia (kalau perangkat punya voice-nya).
 */
export function InstructionScreen() {
  const levelId = useSession((state) => state.levelId)
  const boardIndex = useSession((state) => state.boardIndex)
  const beginPractice = useSession((state) => state.beginPractice)
  const endSession = useSession((state) => state.endSession)
  const voiceAvailable = useVoiceAvailable()

  const script = useMemo(
    () => `${id.guide.step1} ${id.guide.step2} ${id.guide.step3}`,
    [],
  )

  // Baca instruksi otomatis sekali; berhenti kalau layar ditinggalkan.
  useEffect(() => {
    if (!voiceAvailable) return
    speak(script)
    return () => stopSpeaking()
  }, [voiceAvailable, script])

  if (levelId === null) return null
  const config = getLevel(levelId)

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6">
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
          {config.label} · {id.board.boardOf(boardIndex + 1, 3)}
        </span>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-6 py-7 sm:px-8 sm:py-9">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {id.guide.title}
        </h1>

        <ol className="mt-5 space-y-3 text-lg leading-relaxed text-ink-soft">
          <li>{id.guide.step1}</li>
          <li>{id.guide.step2}</li>
          <li>{id.guide.step3}</li>
        </ol>

        <div className="mt-7 flex flex-wrap items-center gap-4 rounded-2xl bg-paper-sunken px-5 py-5">
          <DemoCell shape="circle" marked />
          <DemoCell shape="square" />
          <DemoCell shape="triangle" />
          <p className="text-base text-ink-soft">{id.guide.demo}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={beginPractice}
            className="inline-flex min-h-16 items-center justify-center rounded-xl bg-ink px-10 text-lg font-medium text-paper"
          >
            {id.guide.start}
          </button>

          <button
            type="button"
            onClick={() => speak(script)}
            disabled={!voiceAvailable}
            title={voiceAvailable ? undefined : id.guide.listenUnavailable}
            className="inline-flex min-h-16 items-center gap-2 rounded-xl border-2 border-[color:var(--color-line-soft)] px-6 text-base font-medium text-ink-soft disabled:opacity-45"
          >
            <SpeakerIcon />
            {id.guide.listenAgain}
          </button>
        </div>

        {!voiceAvailable && (
          <p className="mt-3 text-sm text-ink-muted">{id.guide.listenUnavailable}</p>
        )}
      </div>
    </section>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  )
}

interface DemoCellProps {
  shape: 'circle' | 'square' | 'triangle'
  marked?: boolean
}

function DemoCell({ shape, marked = false }: DemoCellProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        'relative grid size-16 place-items-center rounded-xl border-2',
        marked
          ? 'border-hit bg-hit-tint text-hit'
          : 'border-line-soft bg-paper-raised text-ink',
      ].join(' ')}
    >
      <ShapeGlyph shape={shape} className="size-[62%]" />
      {marked && (
        <span className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-hit text-paper">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,13 10,18 19,7" />
          </svg>
        </span>
      )}
    </span>
  )
}

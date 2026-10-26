import { id } from '../lib/i18n/id'
import { useSound } from '../lib/audio'

/**
 * Tombol suara besar yang selalu terlihat: terapis bisa mematikan nada
 * seketika tanpa masuk menu. Preferensi disimpan di perangkat.
 */
export function SoundToggle() {
  const soundOn = useSound((state) => state.soundOn)
  const toggle = useSound((state) => state.toggle)

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={soundOn}
      aria-label={soundOn ? id.sound.mute : id.sound.unmute}
      className={[
        'inline-flex min-h-12 items-center gap-2 rounded-xl border-2 px-4 text-sm font-medium',
        soundOn
          ? 'border-[color:var(--color-line)] bg-paper-raised text-ink'
          : 'border-[color:var(--color-line-soft)] bg-paper-sunken text-ink-muted',
      ].join(' ')}
    >
      {soundOn ? <SpeakerIcon /> : <SpeakerMutedIcon />}
      <span className="hidden sm:inline">{soundOn ? id.sound.on : id.sound.off}</span>
    </button>
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

function SpeakerMutedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z" />
      <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" />
    </svg>
  )
}

import { useState, type ReactNode } from 'react'
import { useSound } from '../lib/audio'
import { id } from '../lib/i18n/id'
import { useInstallPrompt } from '../lib/install'
import { useSettings } from '../lib/settings'
import { Dialog } from './Dialog'

/**
 * Pengaturan tampilan & pemasangan PWA. Tiga sakelar besar (teks, kontras,
 * suara) — cukup jelas untuk terapis, cukup besar untuk jari yang tremor.
 */
export function SettingsSheet() {
  const [open, setOpen] = useState(false)

  const largeText = useSettings((state) => state.textScale === 'large')
  const toggleTextScale = useSettings((state) => state.toggleTextScale)
  const highContrast = useSettings((state) => state.highContrast)
  const toggleHighContrast = useSettings((state) => state.toggleHighContrast)

  const soundOn = useSound((state) => state.soundOn)
  const toggleSound = useSound((state) => state.toggle)

  const { canInstall, installed, install } = useInstallPrompt()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={id.settings.open}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-[color:var(--color-line-soft)] bg-paper-raised px-3 text-sm font-medium text-ink"
      >
        <span aria-hidden="true" className="font-display text-lg leading-none">
          Aa
        </span>
        <span className="hidden sm:inline">{id.settings.title}</span>
      </button>

      {open && (
        <Dialog title={id.settings.title} body={id.settings.body}>
          <ToggleRow
            label={id.settings.largeText}
            hint={id.settings.largeTextHint}
            checked={largeText}
            onChange={toggleTextScale}
          />
          <ToggleRow
            label={id.settings.contrast}
            hint={id.settings.contrastHint}
            checked={highContrast}
            onChange={toggleHighContrast}
          />
          <ToggleRow
            label={id.settings.sound}
            hint={id.settings.soundHint}
            checked={soundOn}
            onChange={toggleSound}
          />

          <div className="mt-2 rounded-xl bg-paper-sunken px-4 py-4">
            {installed ? (
              <p className="text-sm text-ink-soft">{id.settings.installed}</p>
            ) : canInstall ? (
              <>
                <button
                  type="button"
                  onClick={() => void install()}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-ink px-5 text-base font-medium text-paper"
                >
                  {id.settings.install}
                </button>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  {id.settings.installHint}
                </p>
              </>
            ) : (
              <p className="text-xs leading-relaxed text-ink-soft">
                {id.settings.installManual}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-base font-medium text-ink-soft"
          >
            {id.settings.close}
          </button>
        </Dialog>
      )}
    </>
  )
}

interface ToggleRowProps {
  label: string
  hint: string
  checked: boolean
  onChange: () => void
}

function ToggleRow({ label, hint, checked, onChange }: ToggleRowProps): ReactNode {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-line-soft)] pb-3">
      <span className="flex flex-col">
        <span className="text-base font-medium text-ink">{label}</span>
        <span className="text-xs leading-relaxed text-ink-muted">{hint}</span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={[
          'inline-flex min-h-12 min-w-24 shrink-0 items-center justify-center rounded-xl border-2 px-4 text-sm font-semibold',
          checked
            ? 'border-[color:var(--color-hit)] bg-hit-tint text-hit'
            : 'border-[color:var(--color-line-soft)] bg-paper text-ink-muted',
        ].join(' ')}
      >
        {checked ? id.settings.on : id.settings.off}
      </button>
    </div>
  )
}

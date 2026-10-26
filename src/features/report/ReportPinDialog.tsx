import { useState, type FormEvent } from 'react'
import { Dialog } from '../../components/Dialog'
import { REPORT_PIN } from '../../lib/db'
import { id } from '../../lib/i18n/id'
import { useSession } from '../session/store'

interface ReportPinDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Gerbang PIN laporan klinis. Dipakai dari dua tempat: tahan logo di header
 * dan tautan "Laporan terapis" di layar profil/level.
 */
export function ReportPinDialog({ open, onClose }: ReportPinDialogProps) {
  const openReport = useSession((state) => state.openReport)
  const [digits, setDigits] = useState('')
  const [wrong, setWrong] = useState(false)

  if (!open) return null

  const close = () => {
    setDigits('')
    setWrong(false)
    onClose()
  }

  const verify = (value: string) => {
    if (value === REPORT_PIN) {
      setDigits('')
      setWrong(false)
      onClose()
      openReport()
      return
    }
    setWrong(true)
    setDigits('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    verify(digits)
  }

  const handleChange = (value: string) => {
    const next = value.replace(/\D/g, '').slice(0, 4)
    setDigits(next)
    setWrong(false)
    if (next.length === 4) verify(next)
  }

  return (
    <Dialog title={id.report.pinTitle} body={id.report.pinBody}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
          {id.report.pinLabel}
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={digits}
            onChange={(event) => handleChange(event.target.value)}
            className="min-h-14 rounded-xl border-2 border-[color:var(--color-line-soft)] bg-paper px-3 text-center text-2xl tracking-[0.5em] text-ink"
          />
        </label>

        {wrong && (
          <p role="alert" className="text-sm font-medium text-miss">
            {id.report.pinWrong}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-6 text-lg font-medium text-paper"
        >
          {id.report.pinSubmit}
        </button>
        <button
          type="button"
          onClick={close}
          className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 text-base font-medium text-ink-soft"
        >
          {id.report.cancel}
        </button>
      </form>
    </Dialog>
  )
}

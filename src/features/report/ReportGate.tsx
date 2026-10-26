import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Dialog } from '../../components/Dialog'
import { LogoMark } from '../../components/LogoMark'
import { REPORT_PIN } from '../../lib/db'
import { id } from '../../lib/i18n/id'
import { useSession } from '../session/store'

const HOLD_MS = 1500

/**
 * Logo di header sekaligus pintu ke laporan klinis: tahan ±1,5 detik lalu
 * masukkan PIN 4 angka. Tombol biasa tidak ada supaya pasien tidak sengaja
 * masuk ke data.
 */
export function ReportGate() {
  const openReport = useSession((state) => state.openReport)

  const [pinOpen, setPinOpen] = useState(false)
  const [digits, setDigits] = useState('')
  const [wrong, setWrong] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const clearHold = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  const startHold = () => {
    clearHold()
    timer.current = window.setTimeout(() => {
      timer.current = null
      setDigits('')
      setWrong(false)
      setPinOpen(true)
    }, HOLD_MS)
  }

  const close = () => {
    setPinOpen(false)
    setDigits('')
    setWrong(false)
  }

  const verify = (value: string) => {
    if (value === REPORT_PIN) {
      close()
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
    <>
      <button
        type="button"
        aria-label={id.report.open}
        onPointerDown={startHold}
        onPointerUp={clearHold}
        onPointerLeave={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setDigits('')
            setPinOpen(true)
          }
        }}
        className="rounded-xl p-1 text-ink"
      >
        <LogoMark className="size-8" />
      </button>

      {pinOpen && (
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
      )}
    </>
  )
}

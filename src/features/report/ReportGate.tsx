import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '../../components/LogoMark'
import { id } from '../../lib/i18n/id'
import { ReportPinDialog } from './ReportPinDialog'

const HOLD_MS = 1500

/**
 * Logo di header = pintu tersembunyi ke laporan: tahan ±1,5 detik lalu PIN.
 * Pasien tidak akan menemukannya tanpa sengaja; terapis tetap bisa lewat
 * tautan "Laporan terapis" di layar profil.
 */
export function ReportGate() {
  const [pinOpen, setPinOpen] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

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
      setPinOpen(true)
    }, HOLD_MS)
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
            setPinOpen(true)
          }
        }}
        className="rounded-xl p-1 text-ink"
      >
        <LogoMark className="size-8" />
      </button>

      <ReportPinDialog open={pinOpen} onClose={() => setPinOpen(false)} />
    </>
  )
}

import { useState } from 'react'
import { id } from '../../lib/i18n/id'
import { ReportPinDialog } from './ReportPinDialog'

/**
 * Tautan biasa ke laporan (masih di balik PIN). Disimpan di layar terapis
 * supaya tidak perlu menebak-nebak gestur tahan logo.
 */
export function ReportLink() {
  const [pinOpen, setPinOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setPinOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-soft underline decoration-2 underline-offset-4 hover:bg-paper-sunken"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 20V10M12 20V4M19 20v-6" />
        </svg>
        {id.report.open}
      </button>

      <ReportPinDialog open={pinOpen} onClose={() => setPinOpen(false)} />
    </>
  )
}

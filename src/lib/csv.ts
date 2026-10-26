import type { SessionRecord } from './db'

/**
 * Kolom CSV mengikuti blueprint apa adanya, supaya bisa langsung dibuka di
 * Excel/Sheets dan diolah terapis tanpa renaming.
 */
const COLUMNS = [
  'patient_code',
  'session_id',
  'level',
  'started_at',
  'duration_ms',
  'targets_total',
  'hits',
  'false_positives',
  'omissions_total',
  'omissions_left',
  'omissions_right',
  'neglect_index',
  'completed',
] as const

function cell(value: string | number | boolean | null): string {
  if (value === null) return ''
  const text = String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function sessionsToCsv(records: readonly SessionRecord[]): string {
  const lines = [COLUMNS.join(',')]

  for (const record of records) {
    lines.push(
      [
        cell(record.patientCode),
        cell(record.sessionId),
        cell(record.level),
        cell(new Date(record.startedAt).toISOString()),
        cell(record.durationMs),
        cell(record.targetsTotal),
        cell(record.hits),
        cell(record.falsePositives),
        cell(record.omissionsTotal),
        cell(record.omissionsLeft),
        cell(record.omissionsRight),
        // null = tidak ada omisi; dikosongkan, bukan ditulis 0.
        cell(record.neglectIndex === null ? null : record.neglectIndex.toFixed(3)),
        cell(record.completed),
      ].join(','),
    )
  }

  return `${lines.join('\n')}\n`
}

/** Unduh CSV di browser. Nama file menyertakan kode pasien supaya tidak tertukar. */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof document === 'undefined') return

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

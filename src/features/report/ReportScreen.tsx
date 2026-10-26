import { useEffect, useState } from 'react'
import { listPatients, listSessions, type Patient, type SessionRecord } from '../../lib/db'
import { downloadCsv, sessionsToCsv } from '../../lib/csv'
import { id } from '../../lib/i18n/id'
import { useSession } from '../session/store'
import { sessionAccuracy } from './aggregate'

const TREND_LIMIT = 8

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Laporan terapis: hanya bisa dibuka lewat PIN. Isinya angka klinis yang
 * sengaja disembunyikan dari pasien (omisi kiri/kanan, indeks neglect).
 */
export function ReportScreen() {
  const patientCode = useSession((state) => state.patientCode)
  const closeReport = useSession((state) => state.closeReport)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [sessions, setSessions] = useState<SessionRecord[] | null>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      if (!patientCode) {
        if (alive) setSessions([])
        return
      }

      try {
        const [rows, patients] = await Promise.all([listSessions(patientCode), listPatients()])
        if (!alive) return
        setSessions(rows)
        setPatient(patients.find((item) => item.code === patientCode) ?? null)
      } catch {
        if (alive) setSessions([])
      }
    }

    void load()
    return () => {
      alive = false
    }
  }, [patientCode])

  const newest = sessions === null ? [] : [...sessions].reverse()

  return (
    <section className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={closeReport}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl px-3 text-base font-medium text-ink-soft hover:bg-paper-sunken"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {id.report.close}
        </button>

        <span className="text-sm font-medium tracking-wide text-ink-muted uppercase">
          {patientCode
            ? id.report.patient(patientCode, patient?.initials ?? '')
            : id.report.title}
        </span>
      </div>

      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
        {id.report.title}
      </h1>

      {sessions === null && <p className="text-base text-ink-muted">{id.patients.loading}</p>}

      {sessions !== null && sessions.length === 0 && (
        <div className="rounded-card border-2 border-[color:var(--color-line-soft)] bg-paper-raised px-5 py-6">
          <p className="text-base text-ink-soft">{id.report.empty}</p>
        </div>
      )}

      {sessions !== null && sessions.length > 0 && (
        <>
          <Trend sessions={newest.slice(0, TREND_LIMIT)} />

          <div className="overflow-x-auto rounded-card border-2 border-[color:var(--color-line-soft)] bg-paper-raised">
            <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
              <caption className="sr-only">{id.report.title}</caption>
              <thead>
                <tr className="border-b border-[color:var(--color-line-soft)] text-ink-muted">
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.date}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.level}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.hits}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.omissions}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.split}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.neglect}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.duration}</th>
                  <th scope="col" className="px-4 py-3 font-medium">{id.report.columns.status}</th>
                </tr>
              </thead>
              <tbody>
                {newest.map((record) => (
                  <tr
                    key={record.sessionId}
                    className="border-b border-[color:var(--color-line-soft)] last:border-0"
                  >
                    <td className="px-4 py-3 text-ink">{formatDate(record.startedAt)}</td>
                    <td className="px-4 py-3 text-ink">{record.level}</td>
                    <td className="px-4 py-3 text-ink">
                      {record.hits}/{record.targetsTotal}
                      <span className="ml-2 text-ink-muted">
                        {Math.round(sessionAccuracy(record) * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">{record.omissionsTotal}</td>
                    <td className="px-4 py-3 text-ink">
                      {record.omissionsLeft} / {record.omissionsRight}
                    </td>
                    <td className="px-4 py-3 text-ink tabular-nums">
                      {record.neglectIndex === null
                        ? id.report.noValue
                        : record.neglectIndex.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {id.report.duration(record.durationMs / 1000)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {record.completed ? id.report.completed : id.report.incomplete}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  `kognitif-${patientCode ?? 'semua'}.csv`,
                  sessionsToCsv([...sessions].reverse()),
                )
              }
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-[color:var(--color-line)] px-6 text-base font-medium text-ink"
            >
              {id.report.export}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

/** Tren omisi kiri vs kanan: dua batang per sesi, terbaru di kanan. */
function Trend({ sessions }: { sessions: readonly SessionRecord[] }) {
  if (sessions.length === 0) return null

  const max = Math.max(1, ...sessions.flatMap((s) => [s.omissionsLeft, s.omissionsRight]))
  const ordered = [...sessions].reverse()

  return (
    <div className="rounded-card border-2 border-[color:var(--color-line-soft)] bg-paper-raised px-5 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
          {id.report.trend}
        </h2>
        <p className="text-xs text-ink-muted">{id.report.trendHint}</p>
      </div>

      <ul className="mt-4 flex items-end gap-4">
        {ordered.map((record) => (
          <li key={record.sessionId} className="flex flex-col items-center gap-1">
            <div className="flex h-24 items-end gap-1" aria-hidden="true">
              <span
                className="w-3 rounded-t bg-ink"
                style={{ height: `${Math.max(2, (record.omissionsLeft / max) * 100)}%` }}
              />
              <span
                className="w-3 rounded-t bg-ink-muted"
                style={{ height: `${Math.max(2, (record.omissionsRight / max) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-ink-muted">L{record.level}</span>
            <span className="sr-only">
              {id.report.legendLeft} {record.omissionsLeft}, {id.report.legendRight}{' '}
              {record.omissionsRight}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

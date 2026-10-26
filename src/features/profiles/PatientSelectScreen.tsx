import { useEffect, useState, type FormEvent } from 'react'
import { addPatient, listPatients, normalizeCode, type Patient } from '../../lib/db'
import { id } from '../../lib/i18n/id'
import { ReportLink } from '../report/ReportLink'
import { useSession } from '../session/store'

/** Kode berikutnya: PS-001, PS-002, … (hanya saran, tetap bisa diganti). */
function suggestCode(patients: readonly Patient[]): string {
  let highest = 0
  for (const patient of patients) {
    const match = /^PS-(\d+)$/.exec(patient.code)
    if (match) highest = Math.max(highest, Number.parseInt(match[1], 10))
  }
  return `PS-${String(highest + 1).padStart(3, '0')}`
}

/**
 * Layar pertama: pilih profil pasien. Identitas sengaja minimal (kode +
 * inisial) supaya data yang tersimpan di tablet tidak berisi nama lengkap.
 */
export function PatientSelectScreen() {
  const selectPatient = useSession((state) => state.selectPatient)

  const [patients, setPatients] = useState<Patient[] | null>(null)
  const [code, setCode] = useState('')
  const [initials, setInitials] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true

    listPatients()
      .then((rows) => {
        if (!alive) return
        setPatients(rows)
        setCode((current) => (current ? current : suggestCode(rows)))
      })
      .catch(() => {
        // IndexedDB bisa diblokir (mode privat). Aplikasi tetap bisa dipakai
        // asal terapis mengetik profil baru, jadi jangan tampilkan error keras.
        if (alive) setPatients([])
      })

    return () => {
      alive = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const year = Number.parseInt(birthYear, 10)
      const patient = await addPatient({
        code: normalizeCode(code),
        initials,
        birthYear: Number.isFinite(year) ? year : null,
      })
      selectPatient(patient.code)
    } catch {
      setError(id.patients.addError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex w-full max-w-3xl flex-col gap-6">
      <div className="flex justify-end">
        <ReportLink />
      </div>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {id.patients.title}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">{id.patients.body}</p>
      </div>

      <div className="rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-5 py-6 sm:px-7">
        <h2 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
          {id.patients.current}
        </h2>

        {patients === null && <p className="mt-3 text-base text-ink-muted">{id.patients.loading}</p>}

        {patients !== null && patients.length === 0 && (
          <p className="mt-3 text-base text-ink-soft">{id.patients.empty}</p>
        )}

        {patients !== null && patients.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {patients.map((patient) => (
              <li key={patient.code}>
                <button
                  type="button"
                  onClick={() => selectPatient(patient.code)}
                  className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border-2 border-[color:var(--color-line-soft)] px-4 text-left hover:border-[color:var(--color-line)]"
                >
                  <span className="flex flex-col">
                    <span className="text-lg font-semibold text-ink">{patient.code}</span>
                    <span className="text-sm text-ink-muted">
                      {patient.initials || '—'}
                      {patient.birthYear ? ` · ${patient.birthYear}` : ''}
                    </span>
                  </span>
                  <span className="text-base font-medium text-ink-soft">
                    {id.patients.use(patient.code)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-card border-2 border-[color:var(--color-line-soft)] bg-paper-raised px-5 py-6 sm:px-7"
      >
        <h2 className="text-sm font-semibold tracking-wide text-ink-muted uppercase">
          {id.patients.formTitle}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            {id.patients.code}
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={id.patients.codePlaceholder}
              required
              autoComplete="off"
              className="min-h-12 rounded-xl border-2 border-[color:var(--color-line-soft)] bg-paper px-3 text-base text-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            {id.patients.initials}
            <input
              value={initials}
              onChange={(event) => setInitials(event.target.value)}
              placeholder={id.patients.initialsPlaceholder}
              autoComplete="off"
              className="min-h-12 rounded-xl border-2 border-[color:var(--color-line-soft)] bg-paper px-3 text-base text-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-soft">
            {id.patients.birthYear}
            <input
              value={birthYear}
              onChange={(event) => setBirthYear(event.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              placeholder="1958"
              autoComplete="off"
              className="min-h-12 rounded-xl border-2 border-[color:var(--color-line-soft)] bg-paper px-3 text-base text-ink"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 text-sm font-medium text-miss" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex min-h-14 items-center justify-center rounded-xl bg-ink px-8 text-lg font-medium text-paper disabled:opacity-40"
        >
          {id.patients.add}
        </button>
      </form>
    </section>
  )
}

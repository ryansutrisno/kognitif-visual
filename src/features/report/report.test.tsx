// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/App'
import { db } from '../../lib/db'
import { useSession } from '../session/store'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
}

const store = () => useSession.getState()

let container: HTMLDivElement
let root: Root

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120))
  })
}

/**
 * Regresi: sesi yang selesai harus benar-benar tersimpan DAN muncul di layar
 * laporan. Dulu penyimpanan di-wire sekali di main.tsx, sehingga hot-reload
 * store mengembalikannya ke no-op dan laporan kosong tanpa error apa pun.
 */
describe('laporan terapis', () => {
  beforeEach(async () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    await db.patients.clear()
    await db.sessions.clear()

    store().endSession()
    store().changePatient()

    vi.spyOn(console, 'info').mockImplementation(() => {})

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('menyimpan sesi ke IndexedDB lalu menampilkannya di tabel', async () => {
    act(() => store().selectPatient('PS-001'))
    act(() => store().selectLevel(1))
    act(() => store().beginBoard())

    const targets = (store().board?.cells ?? []).filter((cell) => cell.isTarget)
    act(() => {
      for (const cell of targets) store().tap(cell)
    })

    act(() => store().finishBoard())
    act(() => store().endSession())
    await flush()

    const saved = await db.sessions.toArray()
    expect(saved).toHaveLength(1)
    expect(saved[0]?.patientCode).toBe('PS-001')
    expect(saved[0]?.hits).toBe(saved[0]?.targetsTotal)
    expect(saved[0]?.omissionsTotal).toBe(0)

    act(() => store().openReport())
    await flush()

    const text = container.textContent ?? ''
    expect(text).toContain('Laporan sesi')
    expect(text).toContain('1 sesi tersimpan')
    expect(text).not.toContain('Belum ada sesi tersimpan untuk pasien ini.')
  })

  it('menampilkan pesan jelas kalau memang belum ada sesi', async () => {
    act(() => store().openReport())
    await flush()

    expect(container.textContent).toContain('Belum ada profil pasien')
  })
})

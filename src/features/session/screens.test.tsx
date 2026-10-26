// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/App'
import { useSession } from './store'

declare global {
  // React 19 memakai flag ini untuk mendukung act() di luar test runner library.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
}

const store = () => useSession.getState()

let container: HTMLDivElement
let root: Root

function mount() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(<App />)
  })
}

function text(): string {
  return container.textContent ?? ''
}

/** Smoke test: setiap status sesi bisa dirender dan tombol utamanya ada. */
describe('layar sesi', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    store().endSession()
    // Layar level butuh profil aktif; profilnya diisi langsung ke store.
    store().selectPatient('PS-TEST')
    vi.spyOn(console, 'info').mockImplementation(() => {})
    mount()
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.restoreAllMocks()
  })

  it('menampilkan pilihan tiga level', () => {
    expect(text()).toContain('Pilih level')
    expect(text()).toContain('Level 1')
    expect(text()).toContain('Level 2')
    expect(text()).toContain('Level 3')
  })

  it('menampilkan layar instruksi setelah level dipilih', () => {
    act(() => store().selectLevel(2))

    expect(text()).toContain('Cara bermain')
    expect(text()).toContain('Siap, mulai')
    expect(text()).toContain('Papan 1 dari 3')
  })

  it('menampilkan papan dengan satu tombol per kotak', () => {
    act(() => {
      store().selectLevel(3)
      store().beginBoard()
    })

    const cells = store().board?.cells.length ?? 0
    expect(text()).toContain('Tandai semua lingkaran.')
    // Tombol di header (suara) juga punya aria-pressed, jadi hitung di dalam main saja.
    expect(container.querySelectorAll('main button[aria-pressed]')).toHaveLength(cells)
  })

  it('menampilkan papan latihan tiga kotak sebelum papan dinilai', () => {
    act(() => {
      store().selectLevel(1)
      store().beginPractice()
    })

    expect(text()).toContain('Coba dulu, ya')
    expect(text()).toContain('Lanjut ke papan')
    expect(container.querySelectorAll('main button[aria-pressed]')).toHaveLength(3)
  })

  it('tombol suara selalu tersedia di header', () => {
    const sound = container.querySelector('header button[aria-pressed]')
    expect(sound).not.toBeNull()
  })

  it('pengaturan tampilan bisa dibuka dari header dan punya tiga sakelar', () => {
    const trigger = container.querySelector('header button[aria-label="Pengaturan tampilan"]')
    expect(trigger).not.toBeNull()

    act(() => (trigger as HTMLButtonElement).click())

    expect(text()).toContain('Teks besar')
    expect(text()).toContain('Kontras tinggi')
    expect(container.querySelectorAll('[role="switch"]')).toHaveLength(3)
  })

  it('layar profil pasien muncul saat ganti pasien', () => {    act(() => store().changePatient())

    expect(text()).toContain('Pilih profil')
    expect(text()).toContain('Kode pasien')
    expect(text()).toContain('Tambah profil')
  })

  it('laporan terapis hanya berisi data klinis, dibuka lewat PIN', async () => {
    act(() => store().openReport())
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80))
    })

    expect(text()).toContain('Laporan sesi')
    expect(text()).toContain('Belum ada sesi tersimpan untuk pasien ini.')
  })

  it('menampilkan layar hasil tanpa angka omisi dan tanpa kata salah', () => {
    act(() => {
      store().selectLevel(1)
      store().beginBoard()
      store().finishBoard()
    })

    expect(text()).toContain('Papan selesai')
    const starLabels = [...container.querySelectorAll('[role="img"]')].map((element) =>
      element.getAttribute('aria-label'),
    )
    expect(starLabels).toContain('1 dari 3 bintang')
    expect(text()).toContain('Ayo coba lagi pelan-pelan')
    expect(text()).toContain('Papan berikutnya')
    expect(text()).not.toContain('Terlewat')
    expect(text()).not.toContain('salah')
  })

  it('menampilkan layar istirahat dengan hitungan detik', () => {
    act(() => {
      store().selectLevel(1)
      store().beginBoard()
      store().finishBoard()
      store().openRest()
    })

    expect(text()).toContain('Istirahat sebentar')
    expect(text()).toContain('30 detik')
    expect(text()).toContain('Sudah siap')
  })

  it('jeda menampilkan dialog lanjutkan', () => {
    act(() => {
      store().selectLevel(1)
      store().beginBoard()
      store().pause()
    })

    expect(text()).toContain('Latihan dijeda')
    expect(container.querySelector('[role="alertdialog"]')).not.toBeNull()

    const resume = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Lanjutkan'),
    )
    act(() => resume?.click())

    expect(store().status).toBe('running')
  })
})

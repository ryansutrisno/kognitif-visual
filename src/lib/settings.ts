import { create } from 'zustand'

/**
 * Preferensi tampilan yang disimpan di perangkat (bukan di profil pasien):
 * ukuran teks dan kontras tinggi. Suara punya store sendiri di `audio.ts`
 * karena dipakai juga oleh pemutar nada.
 */

const STORAGE_KEY = 'kognitif.settings'

export type TextScale = 'normal' | 'large'

interface PersistedSettings {
  textScale: TextScale
  highContrast: boolean
}

interface SettingsState extends PersistedSettings {
  toggleTextScale: () => void
  toggleHighContrast: () => void
  setTextScale: (scale: TextScale) => void
  setHighContrast: (on: boolean) => void
}

const DEFAULTS: PersistedSettings = { textScale: 'normal', highContrast: false }

function read(): PersistedSettings {
  if (typeof window === 'undefined') return DEFAULTS

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS

    const parsed = JSON.parse(raw) as Partial<PersistedSettings>
    return {
      textScale: parsed.textScale === 'large' ? 'large' : 'normal',
      highContrast: parsed.highContrast === true,
    }
  } catch {
    return DEFAULTS
  }
}

function persist(settings: PersistedSettings): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Mode privat: preferensi cukup hidup selama tab terbuka.
  }
}

/** Tempel kelas di <html> supaya rem & variabel warna ikut berubah. */
export function applySettings(settings: PersistedSettings): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.toggle('text-large', settings.textScale === 'large')
  root.classList.toggle('contrast-high', settings.highContrast)
}

export const useSettings = create<SettingsState>((set, get) => {
  const initial = read()

  const commit = (patch: Partial<PersistedSettings>) => {
    const state = get()
    const next: PersistedSettings = {
      textScale: patch.textScale ?? state.textScale,
      highContrast: patch.highContrast ?? state.highContrast,
    }
    persist(next)
    applySettings(next)
    set(next)
  }

  return {
    ...initial,
    toggleTextScale: () => commit({ textScale: get().textScale === 'large' ? 'normal' : 'large' }),
    toggleHighContrast: () => commit({ highContrast: !get().highContrast }),
    setTextScale: (textScale) => commit({ textScale }),
    setHighContrast: (highContrast) => commit({ highContrast }),
  }
})

// Terapkan saat modul dimuat: mencegah "kedipan" ukuran/kontras setelah reload.
if (typeof document !== 'undefined') {
  applySettings(useSettings.getState())
}

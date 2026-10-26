import { create } from 'zustand'

/**
 * Nada umpan balik memakai Web Audio (oscillator), bukan file audio:
 * 0 KB tambahan, tetap jalan offline, dan tidak pernah gagal dimuat.
 *
 * Aturan main browser: AudioContext baru boleh berbunyi setelah ada gesture.
 * Karena itu setiap nada diputar dari dalam handler tap/klik pengguna.
 */

const STORAGE_KEY = 'kognitif.sound'

interface SoundState {
  soundOn: boolean
  toggle: () => void
  setSoundOn: (on: boolean) => void
}

function readStored(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function persist(on: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    /* mode privat / storage penuh — preferensi cukup hidup di memori */
  }
}

export const useSound = create<SoundState>((set, get) => ({
  soundOn: readStored(),
  toggle: () => {
    const next = !get().soundOn
    persist(next)
    set({ soundOn: next })
  },
  setSoundOn: (on) => {
    persist(on)
    set({ soundOn: on })
  },
}))

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (context) return context

  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
  if (!Ctor) return null

  try {
    context = new Ctor()
  } catch {
    return null
  }
  return context
}

/** Panggil dari gesture pertama (tap) supaya browser mengizinkan audio. */
export function unlockAudio(): void {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
}

interface ToneOptions {
  from: number
  to?: number
  duration: number
  type?: OscillatorType
  gain?: number
}

function tone(ctx: AudioContext, { from, to, duration, type = 'sine', gain = 0.12 }: ToneOptions): void {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(from, now)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, now + duration)

  amp.gain.setValueAtTime(0.0001, now)
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.02)
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(amp)
  amp.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.05)
}

function play(options: ToneOptions): void {
  if (!useSound.getState().soundOn) return

  const ctx = getContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    void ctx.resume().then(() => tone(ctx, options)).catch(() => {})
    return
  }

  tone(ctx, options)
}

/** "ting" — target kena. */
export function playCorrect(): void {
  play({ from: 880, to: 1174, duration: 0.18, gain: 0.14 })
}

/** "tung" lembut — bukan target / terlewat. Sengaja rendah & pelan, bukan bunyi gagal. */
export function playWrong(): void {
  play({ from: 330, to: 220, duration: 0.26, type: 'triangle', gain: 0.09 })
}

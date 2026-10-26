import { useEffect, useState } from 'react'

/**
 * Instruksi bersuara memakai `speechSynthesis` bawaan perangkat.
 * Tidak ada file audio dan tidak ada jaringan — kalau perangkat tidak punya
 * suara Bahasa Indonesia, teks di layar tetap jadi sumber utama.
 */

const LANG = 'id-ID'

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  if (!('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

function indonesianVoice(): SpeechSynthesisVoice | null {
  const engine = synth()
  if (!engine) return null
  const voices = engine.getVoices()
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith('id')) ?? null
}

/** Apakah perangkat punya voice Bahasa Indonesia? */
export function hasIndonesianVoice(): boolean {
  return indonesianVoice() !== null
}

/**
 * Voice dimuat asinkron oleh browser, jadi statusnya dipantau dari event
 * `voiceschanged` sampai benar-benar muncul.
 */
export function useVoiceAvailable(): boolean {
  const [available, setAvailable] = useState(() => hasIndonesianVoice())

  useEffect(() => {
    const engine = synth()
    if (!engine) return

    const update = () => setAvailable(hasIndonesianVoice())
    update()

    engine.addEventListener?.('voiceschanged', update)
    return () => engine.removeEventListener?.('voiceschanged', update)
  }, [])

  return available
}

/** Ucapkan teks instruksi. Mengembalikan false bila TTS tidak tersedia. */
export function speak(text: string): boolean {
  const engine = synth()
  if (!engine) return false

  const voice = indonesianVoice()
  if (!voice) return false

  engine.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANG
  utterance.voice = voice
  // Sedikit lebih lambat dari default: pasien pasca stroke butuh waktu mencerna.
  utterance.rate = 0.9
  utterance.pitch = 1

  try {
    engine.speak(utterance)
    return true
  } catch {
    return false
  }
}

export function stopSpeaking(): void {
  synth()?.cancel()
}

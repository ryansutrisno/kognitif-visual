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

/**
 * Pilih satu voice Indonesia secara DETERMINISTIK.
 *
 * Kenapa perlu: `getVoices()` sering punya lebih dari satu voice `id-ID`
 * (mis. Google Bahasa Indonesia dan Microsoft Andika/Gadis) dan urutannya
 * bisa berubah antar panggilan / setelah `voiceschanged`. Tanpa pengurutan
 * tetap, suara bisa berganti pria-wanita di tengah sesi.
 */
export function pickIndonesianVoice(
  voices: readonly SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  const candidates = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('id'))
  if (candidates.length === 0) return null

  const rank = (voice: SpeechSynthesisVoice): number => {
    if (/google/i.test(voice.name)) return 0
    if (/female|wanita|perempuan/i.test(voice.name)) return 1
    if (/male|pria|laki/i.test(voice.name)) return 2
    return 3
  }

  // Kunci: urutkan dulu, baru ambil yang pertama → hasil sama setiap kali.
  return [...candidates].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      a.name.localeCompare(b.name) ||
      a.voiceURI.localeCompare(b.voiceURI),
  )[0]
}

/**
 * Voice yang sudah dipilih untuk sesi ini. Disimpan supaya level berikutnya
 * memakai suara yang persis sama.
 */
let chosen: SpeechSynthesisVoice | null = null

function indonesianVoice(): SpeechSynthesisVoice | null {
  if (chosen) return chosen

  const engine = synth()
  if (!engine) return null

  chosen = pickIndonesianVoice(engine.getVoices())
  return chosen
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

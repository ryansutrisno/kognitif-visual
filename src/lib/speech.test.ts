import { describe, expect, it } from 'vitest'
import { pickIndonesianVoice } from './speech'

function voice(name: string, lang = 'id-ID', voiceURI = name.toLowerCase()): SpeechSynthesisVoice {
  return {
    name,
    lang,
    voiceURI,
    default: false,
    localService: true,
  } as SpeechSynthesisVoice
}

describe('pickIndonesianVoice', () => {
  it('mengembalikan null kalau tidak ada voice Indonesia', () => {
    expect(pickIndonesianVoice([])).toBeNull()
    expect(pickIndonesianVoice([voice('Samantha', 'en-US'), voice('Tingting', 'zh-CN')])).toBeNull()
  })

  it('memberi hasil yang sama berapa pun urutan daftar voice', () => {
    const voices = [
      voice('Microsoft Andika', 'id-ID', 'andika'),
      voice('Google Bahasa Indonesia', 'id-ID', 'google-id'),
      voice('Damayanti', 'id-ID', 'damayanti'),
    ]

    const first = pickIndonesianVoice(voices)
    const reversed = pickIndonesianVoice([...voices].reverse())
    const shuffled = pickIndonesianVoice([voices[1], voices[2], voices[0]])

    expect(first?.name).toBe('Google Bahasa Indonesia')
    expect(reversed?.name).toBe(first?.name)
    expect(shuffled?.name).toBe(first?.name)
  })

  it('mengutamakan label wanita, lalu urutan nama yang stabil', () => {
    const withoutGoogle = [voice('Microsoft Andika'), voice('Gadis Female'), voice('Damayanti')]
    expect(pickIndonesianVoice(withoutGoogle)?.name).toBe('Gadis Female')

    const onlyNeutral = [voice('Zahra'), voice('Bima')]
    expect(pickIndonesianVoice(onlyNeutral)?.name).toBe('Bima')
    expect(pickIndonesianVoice([...onlyNeutral].reverse())?.name).toBe('Bima')
  })
})

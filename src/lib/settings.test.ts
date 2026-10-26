// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { applySettings, useSettings } from './settings'

const root = () => document.documentElement

describe('pengaturan tampilan', () => {
  beforeEach(() => {
    window.localStorage.clear()
    root().className = ''
    useSettings.setState({ textScale: 'normal', highContrast: false })
  })

  it('menempel kelas teks besar di <html> dan menyimpannya', () => {
    useSettings.getState().toggleTextScale()

    expect(useSettings.getState().textScale).toBe('large')
    expect(root().classList.contains('text-large')).toBe(true)
    expect(JSON.parse(window.localStorage.getItem('kognitif.settings') ?? '{}')).toMatchObject({
      textScale: 'large',
    })

    useSettings.getState().toggleTextScale()
    expect(root().classList.contains('text-large')).toBe(false)
  })

  it('menempel kelas kontras tinggi secara terpisah', () => {
    useSettings.getState().setHighContrast(true)

    expect(root().classList.contains('contrast-high')).toBe(true)
    expect(root().classList.contains('text-large')).toBe(false)
  })

  it('applySettings bisa memulihkan tampilan saat aplikasi dibuka', () => {
    applySettings({ textScale: 'large', highContrast: true })

    expect(root().classList.contains('text-large')).toBe(true)
    expect(root().classList.contains('contrast-high')).toBe(true)
  })
})

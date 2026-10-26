import { describe, expect, it } from 'vitest'
import { LEVELS } from './config'
import { generateBoard } from './generateBoard'
import { LEVEL_IDS } from './config'

const l1 = LEVELS[1]
const l3 = LEVELS[3]

describe('generateBoard', () => {
  it('menghasilkan papan deterministik untuk seed yang sama', () => {
    const a = generateBoard(l1, 12345)
    const b = generateBoard(l1, 12345)
    expect(a).toEqual(b)
  })

  it('menghasilkan papan berbeda untuk seed berbeda', () => {
    const boards = new Set(
      [1, 2, 3, 4, 5].map((seed) => JSON.stringify(generateBoard(l1, seed).cells.map((c) => c.isTarget))),
    )
    expect(boards.size).toBeGreaterThan(1)
  })

  it('mengisi semua kotak dengan jumlah target sesuai konfigurasi', () => {
    for (const id of LEVEL_IDS) {
      const config = LEVELS[id]
      const board = generateBoard(config, 777)
      expect(board.cells).toHaveLength(config.rows * config.cols)
      expect(board.cells.filter((c) => c.isTarget)).toHaveLength(config.targetCount)
    }
  })

  it('target selalu lingkaran, distraktor tidak pernah lingkaran', () => {
    const board = generateBoard(l3, 2024)
    for (const cell of board.cells) {
      if (cell.isTarget) {
        expect(cell.shape).toBe('circle')
      } else {
        expect(cell.shape).not.toBe('circle')
      }
    }
  })

  it('membagi distraktor secara merata antar bentuk', () => {
    const board = generateBoard(l3, 99)
    const distractors = board.cells.filter((c) => !c.isTarget)
    const counts = l3.distractorShapes.map(
      (shape) => distractors.filter((c) => c.shape === shape).length,
    )
    const min = Math.min(...counts)
    const max = Math.max(...counts)
    expect(max - min).toBeLessThanOrEqual(1)
  })

  it('memberi id unik dan urutan baris-mayor', () => {
    const board = generateBoard(l3, 5)
    const ids = new Set(board.cells.map((c) => c.id))
    expect(ids.size).toBe(board.cells.length)

    const expected = [...board.cells].sort((a, b) => a.row - b.row || a.col - b.col)
    expect(board.cells.map((c) => c.id)).toEqual(expected.map((c) => c.id))
  })

  it('menolak konfigurasi dengan target melebihi jumlah kotak', () => {
    expect(() => generateBoard({ ...l1, targetCount: 10 }, 1)).toThrow(/tidak valid/i)
  })

  it('membawa flag garis tengah dari konfigurasi', () => {
    expect(generateBoard(l1, 1).midline).toBe(false)
    expect(generateBoard(l3, 1).midline).toBe(true)
  })
})

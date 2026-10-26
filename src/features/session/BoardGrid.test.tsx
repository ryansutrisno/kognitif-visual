import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LEVELS } from '../levels/config'
import { generateBoard } from '../levels/generateBoard'
import { BoardGrid } from './BoardGrid'

describe('BoardGrid', () => {
  it('merender satu tombol per kotak dengan label aksesibel', () => {
    const board = generateBoard(LEVELS[1], 11)
    const html = renderToStaticMarkup(
      <BoardGrid
        board={board}
        marks={new Set()}
        falsePositiveIds={new Set()}
        onToggle={() => {}}
      />,
    )

    expect(html.match(/<button/g)).toHaveLength(board.cells.length)
    expect(html).toContain('aria-label="Baris 1, kolom 1')
    expect(html).toContain('aria-pressed="false"')
  })

  it('menandai kotak yang sudah dipilih', () => {
    const board = generateBoard(LEVELS[1], 11)
    const target = board.cells.find((cell) => cell.isTarget)!
    const html = renderToStaticMarkup(
      <BoardGrid
        board={board}
        marks={new Set([target.id])}
        falsePositiveIds={new Set()}
        onToggle={() => {}}
      />,
    )

    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('sudah ditandai')
    // Ikon centang ikut tampil bersama warna (bukan warna saja).
    expect(html).toContain('polyline')
  })

  it('menggambar garis tengah hanya untuk level yang memakainya', () => {
    const l1 = renderToStaticMarkup(
      <BoardGrid
        board={generateBoard(LEVELS[1], 3)}
        marks={new Set()}
        falsePositiveIds={new Set()}
        onToggle={() => {}}
      />,
    )
    const l2 = renderToStaticMarkup(
      <BoardGrid
        board={generateBoard(LEVELS[2], 3)}
        marks={new Set()}
        falsePositiveIds={new Set()}
        onToggle={() => {}}
      />,
    )

    expect(l1).not.toContain('left-1/2')
    expect(l2).toContain('left-1/2')
  })
})

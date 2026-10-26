import type { CSSProperties } from 'react'
import { ShapeGlyph } from '../../components/ShapeGlyph'
import { id } from '../../lib/i18n/id'
import type { Board, Cell } from '../levels/types'

interface BoardGridProps {
  board: Board
  /** Cell id yang sedang bertanda. */
  marks: ReadonlySet<string>
  /** Cell id bukan-target yang pernah tersentuh (tetap ditandai walau dibatalkan). */
  falsePositiveIds: ReadonlySet<string>
  onToggle: (cell: Cell) => void
}

/**
 * Papan = grid DOM + satu SVG per kotak (bukan canvas), tiap kotak sebuah
 * <button> → tap target, keyboard, dan screen reader gratis.
 *
 * Ukuran kotak dihitung CSS dari tinggi & lebar layar: L1 tetap besar,
 * sedangkan L3 (11 baris) otomatis mengecil agar seluruh lembar muat di
 * tablet landscape tanpa perlu scroll.
 */
export function BoardGrid({ board, marks, falsePositiveIds, onToggle }: BoardGridProps) {
  const small = board.cols <= 3
  const gap = small ? '0.75rem' : '0.5rem'
  const cellMax = small ? '7.5rem' : '5.5rem'
  // Ruang vertikal untuk papan: L3 butuh sisa layar lebih banyak (11 baris).
  const verticalBudget = board.rows >= 10 ? '9rem' : '15rem'

  const style = {
    '--cell': [
      `max(2.5rem, min(${cellMax}`,
      `calc((100dvh - ${verticalBudget} - ${board.rows - 1} * ${gap}) / ${board.rows})`,
      `calc((100vw - 3rem - ${board.cols - 1} * ${gap}) / ${board.cols})))`,
    ].join(', '),
    '--gap': gap,
  } as CSSProperties

  return (
    <div className="relative mx-auto w-full" style={style}>
      {board.midline && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-[0.25rem] left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-line"
        />
      )}

      <div
        className="relative mx-auto grid w-fit"
        style={{
          gridTemplateColumns: `repeat(${board.cols}, var(--cell))`,
          gap: 'var(--gap)',
        }}
        role="group"
        aria-label={id.board.instruction}
      >
        {board.cells.map((cell) => (
          <CellButton
            key={cell.id}
            cell={cell}
            marked={marks.has(cell.id)}
            everWrong={falsePositiveIds.has(cell.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

interface CellButtonProps {
  cell: Cell
  marked: boolean
  everWrong: boolean
  onToggle: (cell: Cell) => void
}

function CellButton({ cell, marked, everWrong, onToggle }: CellButtonProps) {
  const wrongNow = marked && !cell.isTarget
  const rightNow = marked && cell.isTarget
  const shapeName = id.shape[cell.shape]

  return (
    <button
      type="button"
      aria-pressed={marked}
      aria-label={id.a11y.cell(cell.row + 1, cell.col + 1, shapeName, marked)}
      onClick={() => onToggle(cell)}
      style={{ width: 'var(--cell)', height: 'var(--cell)' }}
      className={[
        'relative grid place-items-center rounded-xl p-1 transition-colors',
        'active:bg-paper-sunken',
        rightNow ? 'bg-hit-tint text-hit' : '',
        wrongNow ? 'bg-miss-tint text-miss' : '',
        !marked ? 'text-ink' : '',
        !marked && everWrong ? 'ring-2 ring-miss/40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ShapeGlyph shape={cell.shape} className="size-[70%]" />

      {rightNow && <Badge tone="hit" kind="check" />}
      {wrongNow && <Badge tone="miss" kind="cross" />}
    </button>
  )
}

interface BadgeProps {
  tone: 'hit' | 'miss'
  kind: 'check' | 'cross'
}

/** Ikon kecil di pojok: warna SELALU didampingi ikon (tidak buta warna). */
function Badge({ tone, kind }: BadgeProps) {
  const colorClass = tone === 'hit' ? 'bg-hit text-paper' : 'bg-miss text-paper'

  return (
    <span
      aria-hidden="true"
      className={`absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full sm:size-6 ${colorClass}`}
    >
      <svg viewBox="0 0 24 24" className="size-3.5 sm:size-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'check' ? <polyline points="5,13 10,18 19,7" /> : <path d="M6 6l12 12M18 6L6 18" />}
      </svg>
    </span>
  )
}

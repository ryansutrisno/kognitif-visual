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
 */
export function BoardGrid({ board, marks, falsePositiveIds, onToggle }: BoardGridProps) {
  const columnWidth = board.cols === 3 ? '7.5rem' : '5.5rem'

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: `calc(${board.cols} * ${columnWidth} + ${(board.cols - 1) * 0.75}rem)` }}
    >
      {board.midline && (
        <span
          aria-hidden="true"
          className="absolute inset-y-[0.25rem] left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-line"
        />
      )}

      <div
        className="relative grid gap-3"
        style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))` }}
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
      className={[
        'relative grid aspect-square min-h-[4.5rem] place-items-center rounded-xl p-2 transition-colors',
        'active:bg-paper-sunken',
        rightNow ? 'bg-hit-tint text-hit' : '',
        wrongNow ? 'bg-miss-tint text-miss' : '',
        !marked ? 'text-ink' : '',
        !marked && everWrong ? 'ring-2 ring-miss/40' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ShapeGlyph shape={cell.shape} className="size-[68%]" />

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
      className={`absolute top-1 right-1 grid size-6 place-items-center rounded-full ${colorClass}`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'check' ? <polyline points="5,13 10,18 19,7" /> : <path d="M6 6l12 12M18 6L6 18" />}
      </svg>
    </span>
  )
}

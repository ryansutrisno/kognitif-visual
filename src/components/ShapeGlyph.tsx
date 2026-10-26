import type { Shape } from '../features/levels/types'

interface ShapeGlyphProps {
  shape: Shape
  className?: string
}

/**
 * Bentuk-bentuk papan, digambar sebagai inline SVG.
 * Kanvas 100x100, stroke 4 (spesifikasi visual), bentuk mengisi ±65% sel.
 */
export function ShapeGlyph({ shape, className }: ShapeGlyphProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {renderShape(shape)}
    </svg>
  )
}

function renderShape(shape: Shape) {
  switch (shape) {
    case 'circle':
      return <circle cx="50" cy="50" r="32" />
    case 'square':
      return <rect x="17" y="17" width="66" height="66" />
    case 'triangle':
      return <polygon points="50,16 84,80 16,80" />
    case 'star':
      return <polygon points={starPoints()} />
  }
}

/** Bintang lima sudut: radius luar 34, radius dalam 14 — cukup tebal untuk stroke 4. */
function starPoints(): string {
  const cx = 50
  const cy = 51
  const outer = 34
  const inner = 14
  const points: string[] = []

  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (Math.PI / 5) * i - Math.PI / 2
    points.push(
      `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`,
    )
  }

  return points.join(' ')
}

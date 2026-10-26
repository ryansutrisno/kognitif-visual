import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface SelectMenuProps<T extends string> {
  label: string
  value: T | null
  options: readonly Option<T>[]
  onChange: (value: T) => void
}

/**
 * Dropdown kustom sebagai pengganti `<select>` native.
 *
 * Alasan: popup native di Android/iOS muncul sebagai dialog atau bottom sheet
 * yang jauh dari kontrolnya. Panel ini `absolute` terhadap trigger, jadi selalu
 * menempel tepat di bawahnya — dan barisnya bisa dibuat setinggi 48px untuk
 * jari yang tremor.
 */
export function SelectMenu<T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const labelId = useId()

  const current = options.find((option) => option.value === value) ?? null

  // Klik di luar & Escape menutup panel — tidak ada overlay yang menghalangi.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Fokus langsung ke opsi yang sedang terpilih saat panel dibuka.
  useEffect(() => {
    if (!open) return
    const target =
      listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]') ??
      listRef.current?.querySelector<HTMLButtonElement>('[role="option"]')
    target?.focus()
  }, [open])

  const handleListKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== 'Home' && event.key !== 'End') {
      return
    }

    event.preventDefault()
    const nodes = [
      ...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []),
    ]
    if (nodes.length === 0) return

    const index = nodes.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      event.key === 'ArrowDown'
        ? Math.min(nodes.length - 1, index + 1)
        : event.key === 'ArrowUp'
          ? Math.max(0, index - 1)
          : event.key === 'Home'
            ? 0
            : nodes.length - 1

    nodes[next]?.focus()
  }

  return (
    <div ref={rootRef} className="relative flex w-full max-w-sm flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-ink-soft">
        {label}
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
          }
        }}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border-2 border-[color:var(--color-line-soft)] bg-paper px-3 text-left text-base text-ink"
      >
        <span className="truncate">{current?.label ?? '—'}</span>
        <svg
          viewBox="0 0 24 24"
          className={['size-4 shrink-0 text-ink-muted transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          onKeyDown={handleListKeys}
          className="absolute top-full right-0 left-0 z-30 mt-2 max-h-[60dvh] overflow-y-auto rounded-xl border-2 border-[color:var(--color-line)] bg-paper-raised py-1 shadow-lg"
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={[
                  'flex min-h-12 w-full items-center justify-between gap-3 px-3 text-left text-base',
                  active ? 'bg-paper-sunken font-medium text-ink' : 'text-ink hover:bg-paper-sunken',
                ].join(' ')}
              >
                <span className="truncate">{option.label}</span>
                {active && (
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4 shrink-0 text-hit"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="5,13 10,18 19,7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

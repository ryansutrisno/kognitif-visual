import type { ReactNode } from 'react'

interface DialogProps {
  title: string
  body: string
  children: ReactNode
}

/** Dialog sederhana untuk konfirmasi & jeda. Fokus keyboard dikurung di dalamnya. */
export function Dialog({ title, body, children }: DialogProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/45 px-6 py-8">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-card border-2 border-[color:var(--color-line)] bg-paper-raised px-7 py-7 shadow-xl"
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">{body}</p>
        <div className="mt-7 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  )
}

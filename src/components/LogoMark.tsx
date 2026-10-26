type LogoMarkProps = {
  className?: string
}

/**
 * Tanda aplikasi: lingkaran (target latihan) dengan garis tengah,
 * mengacu ke lembar cancellation test.
 */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M16 4.5V11M16 21v6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

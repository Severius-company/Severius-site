/** Bandeiras em SVG inline (sem emoji). */
export function FlagBrazil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className} aria-hidden="true" focusable="false">
      <rect width="28" height="20" fill="#009C3B" />
      <path d="M14 2.2 25.6 10 14 17.8 2.4 10Z" fill="#FFDF00" />
      <circle cx="14" cy="10" r="4.6" fill="#002776" />
      <path d="M9.6 8.9c3-.6 6.4.1 8.8 1.9" stroke="#FFFFFF" strokeWidth="0.9" fill="none" />
    </svg>
  )
}

/** Inglaterra: cruz de São Jorge (branca com cruz vermelha). */
export function FlagEngland({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className} aria-hidden="true" focusable="false">
      <rect width="28" height="20" fill="#FFFFFF" />
      <rect x="11.5" width="5" height="20" fill="#CE1124" />
      <rect y="7.5" width="28" height="5" fill="#CE1124" />
    </svg>
  )
}

import { cx } from '@/lib/cx'

/** Placeholder listrado de mockup (ex.: "web mockup · chic boutique"). */
export function WorkShot({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cx('flex w-full items-center justify-center bg-stripes font-mono text-xs font-medium text-st-text', className)}
    >
      {label}
    </div>
  )
}

import { cx } from '@/lib/cx'

/** Placeholder listrado de mockup (ex.: "web mockup · chic boutique"). Decorativo: o card/página já nomeia o projeto. */
export function WorkShot({ label, className }: { label: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('flex w-full items-center justify-center bg-stripes font-mono text-xs font-medium text-st-text', className)}
    >
      {label}
    </div>
  )
}

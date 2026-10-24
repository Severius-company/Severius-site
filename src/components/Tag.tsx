import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

type Variant = 'solid' | 'muted' | 'outline'

const VARIANTS: Record<Variant, string> = {
  solid: 'glass-control text-text px-3 py-2 text-sm',
  muted: 'border border-white/[0.06] bg-white/[0.055] text-muted px-2.5 py-1.5 text-[13px] backdrop-blur-md',
  outline: 'glass-control border text-text px-3 py-2 text-sm',
}

export function Tag({ children, variant = 'solid', className }: { children: ReactNode; variant?: Variant; className?: string }) {
  return <span className={cx('inline-flex rounded-tag leading-tight', VARIANTS[variant], className)}>{children}</span>
}

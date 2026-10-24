import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'

/** Quadrado surface2 com ícone/número em verde (56/52/48/38px no protótipo). */
export function IconBox({ children, size = 56, className }: { children: ReactNode; size?: 38 | 44 | 48 | 52 | 56; className?: string }) {
  const sizes = {
    38: 'size-[38px] text-[13px] font-semibold',
    44: 'size-11 text-sm font-semibold',
    48: 'size-12 text-[22px]',
    52: 'size-[52px] text-[22px]',
    56: 'size-14 text-2xl',
  }[size]
  return (
    <span aria-hidden="true" className={cx('glass-icon flex flex-none items-center justify-center rounded-rb text-accent', sizes, className)}>
      {children}
    </span>
  )
}

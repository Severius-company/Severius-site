'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '@/lib/cx'

/** Chip/pílula de filtro e seleção (aria-pressed). */
export function Chip({ on, className, ...rest }: { on: boolean } & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={cx(
        'h-[42px] rounded-full border px-[18px] text-[15px] font-medium transition-colors duration-150',
        on ? 'glass-accent border-accent text-on-accent' : 'glass-control border-line2 text-text',
        className,
      )}
      {...rest}
    />
  )
}

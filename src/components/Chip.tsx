'use client'

import type { ComponentPropsWithoutRef } from 'react'
import { Icon } from '@/components/Icon'
import { cx } from '@/lib/cx'

/** Chip/pílula de filtro e seleção (aria-pressed). Marcado = fundo verde + ícone de check. */
export function Chip({ on, className, children, ...rest }: { on: boolean } & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      aria-pressed={on}
      className={cx(
        'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-[18px] text-[15px] font-medium transition-colors duration-150',
        on ? 'glass-accent border-accent text-on-accent' : 'glass-control border-line2 text-text',
        className,
      )}
      {...rest}
    >
      {/* 1.4.1: estado marcado não depende só da cor */}
      {on ? <span aria-hidden="true" className="flex text-base"><Icon name="check" /></span> : null}
      {children}
    </button>
  )
}

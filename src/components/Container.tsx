import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cx } from '@/lib/cx'

type Props<T extends ElementType> = { as?: T; className?: string } & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

/** Coluna de 1280px com gutter clamp(20px,4vw,48px), como no protótipo. */
export function Container<T extends ElementType = 'div'>({ as, className, ...rest }: Props<T>) {
  const Tag = (as ?? 'div') as ElementType
  return <Tag className={cx('mx-auto w-full max-w-[1280px] min-[1800px]:max-w-[1600px] px-[clamp(20px,4vw,48px)]', className)} {...rest} />
}

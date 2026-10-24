import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '@/lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'surface'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-rb text-[15px] transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out whitespace-nowrap active:translate-y-px'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'glass-accent font-semibold',
  secondary: 'glass-control text-text font-medium border',
  surface: 'glass-control text-text font-medium border',
}

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string) {
  return cx(BASE, VARIANTS[variant], className)
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant?: ButtonVariant }

export function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...rest} />
}

type LinkButtonProps = ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonVariant }

export function LinkButton({ variant = 'primary', className, ...rest }: LinkButtonProps) {
  return <Link className={buttonClasses(variant, className)} {...rest} />
}

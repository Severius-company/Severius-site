'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavKey } from '@/content/types'
import { isActiveLink, localePath, stripLocale, type Locale } from '@/lib/i18n'
import { cx } from '@/lib/cx'

export type NavItem = { key: NavKey; href: string; label: string }

export function HeaderNav({ locale, items }: { locale: Locale; items: NavItem[] }) {
  const base = stripLocale(usePathname() ?? '/')
  return (
    <ul className="m-0 flex min-w-0 flex-1 list-none items-center justify-center gap-1 p-0">
      {items.map(link => {
        const active = isActiveLink(base, link.href)
        return (
          <li key={link.key}>
            <Link
              href={localePath(locale, link.href)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex h-[42px] items-center rounded-rb px-4 text-[15px] font-medium whitespace-nowrap transition-colors duration-150',
                active ? 'glass-nav-active text-text' : 'text-hero-muted hover:bg-white/[0.05] hover:text-text',
              )}
            >
              {link.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

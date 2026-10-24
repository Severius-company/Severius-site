'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { buttonClasses } from '@/components/Button'
import type { NavItem } from '@/components/HeaderNav'
import { Icon } from '@/components/Icon'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { NavDict } from '@/content/types'
import { isActiveLink, localePath, stripLocale, type Locale } from '@/lib/i18n'
import { cx } from '@/lib/cx'

/** Menu em tela cheia abaixo de 1024px (inclui o seletor de idioma). */
export function MobileMenu({ locale, items, t }: { locale: Locale; items: NavItem[]; t: NavDict }) {
  const [open, setOpen] = useState(false)
  const base = stripLocale(usePathname() ?? '/')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t.closeMenu : t.openMenu}
        onClick={() => setOpen(o => !o)}
        className="glass-control relative z-50 flex size-11 items-center justify-center rounded-rb border text-2xl text-accent transition-colors duration-150"
      >
        <Icon name={open ? 'x' : 'menu'} />
      </button>
      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 top-[73px] bottom-0 z-40 overflow-y-auto border-t border-white/10 bg-bg/85 backdrop-blur-2xl">
        <nav aria-label={t.mobileAria} className="flex flex-col gap-2 px-5 py-6">
          {items.map(link => {
            const active = isActiveLink(base, link.href)
            return (
              <Link
                key={link.key}
                href={localePath(locale, link.href)}
                onClick={close}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-14 items-center rounded-rb px-4 text-xl font-medium transition-colors duration-150',
                  active ? 'glass-nav-active text-text' : 'text-hero-muted hover:bg-white/[0.06] hover:text-text',
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <Link href={localePath(locale, '/contact')} onClick={close} className={buttonClasses('primary', 'mt-4 h-14 text-base')}>
            {t.contact}
          </Link>
          <LanguageSwitcher locale={locale} labels={t.languages} groupLabel={t.languageAria} onNavigate={close} className="mt-4 justify-center" />
        </nav>
      </div>
    </div>
  )
}

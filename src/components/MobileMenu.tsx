'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { buttonClasses } from '@/components/Button'
import type { NavItem } from '@/components/HeaderNav'
import { Icon } from '@/components/Icon'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { NavDict } from '@/content/types'
import type { ExperienceCopy } from '@/content/homeExperience'
import { isActiveLink, localePath, stripLocale, type Locale } from '@/lib/i18n'
import { cx } from '@/lib/cx'

/** Menu em tela cheia abaixo de 1024px (inclui o seletor de idioma). */
export function MobileMenu({ locale, items, t, services }: { locale: Locale; items: NavItem[]; t: NavDict; services: ExperienceCopy['services'] }) {
  const [open, setOpen] = useState(false)
  const base = stripLocale(usePathname() ?? '/')

  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef(false)

  useEffect(() => {
    if (!open) {
      if (returnFocus.current) toggleRef.current?.focus()
      returnFocus.current = false
      return
    }
    // Fundo inerte (main, footer, skip link) + foco preso entre o botão e o painel.
    const outside = [document.getElementById('main'), document.querySelector('body > footer'), document.querySelector('[data-skip-link]')]
      .filter((el): el is HTMLElement => el instanceof HTMLElement)
    outside.forEach(el => el.setAttribute('inert', ''))
    const focusables = () => [toggleRef.current, ...Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button, summary') ?? [])]
      .filter((el): el is HTMLElement => !!el && el.offsetParent !== null)
    panelRef.current?.querySelector<HTMLElement>('nav > a[href]')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        returnFocus.current = true
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const list = focusables()
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      outside.forEach(el => el.removeAttribute('inert'))
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
        ref={toggleRef}
        onClick={() => {
          returnFocus.current = open
          setOpen(o => !o)
        }}
        className="glass-control relative z-50 flex size-11 items-center justify-center rounded-rb border text-2xl text-accent transition-colors duration-150"
      >
        <Icon name={open ? 'x' : 'menu'} />
      </button>
      <div ref={panelRef} id="mobile-menu" hidden={!open} className="fixed inset-x-0 top-[73px] bottom-0 z-40 overflow-y-auto border-t border-white/10 bg-bg/95 backdrop-blur-2xl">
        <nav aria-label={t.mobileAria} className="flex flex-col gap-2 px-5 py-6">
          <details className="mobile-services">
            <summary>{t.links.services}<span aria-hidden="true">+</span></summary>
            <div>
              {services.items.map(item => <a key={item.id} href={`${localePath(locale, '/')}#capacidades`} onClick={close}><b>{item.number}</b>{item.title}</a>)}
            </div>
          </details>
          {items.map(link => {
            if (link.key === 'services') return null
            const active = isActiveLink(base, link.href)
            return (
              <Link
                key={link.key}
                href={localePath(locale, link.href)}
                onClick={close}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex min-h-14 items-center rounded-rb px-4 text-xl font-medium transition-colors duration-150',
                  active ? 'glass-nav-active text-text' : 'text-hero-muted hover:bg-white/[0.06] hover:text-text',
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <Link href={localePath(locale, '/contact')} onClick={close} className={buttonClasses('primary', 'mt-4 min-h-14 text-base')}>
            {t.contact}
          </Link>
          <LanguageSwitcher locale={locale} labels={t.languages} groupLabel={t.languageAria} onNavigate={close} className="mt-4 justify-center" />
        </nav>
      </div>
    </div>
  )
}

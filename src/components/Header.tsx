'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/lib/site'
import type { SiteCopy } from '@/lib/copy'

export function Header({ locale, text }: { locale: Locale; text: SiteCopy }) {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => { document.documentElement.lang = text.lang }, [text.lang])

  useEffect(() => {
    const update = () => setSolid(window.scrollY > 24)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLElement>('a,button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
      if (event.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>('a,button')]
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const links = [[text.nav.work,'#como-ajudamos'],[text.nav.capabilities,'#capacidades'],[text.nav.process,'#processo'],[text.nav.insights,'#insights']] as const
  const close = () => setOpen(false)
  return <header className="site-header" data-solid={solid}>
    <div className="header-inner">
      <Link href={`/${locale}`} className="wordmark" aria-label={`Severius — ${text.nav.work}`}>Severius<i aria-hidden="true" /></Link>
      <nav className="desktop-nav" aria-label={text.nav.work}>
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <Link className="language" href={`/${text.otherLocale}`} hrefLang={text.otherLocale} aria-label={text.nav.language}>{text.localeName}</Link>
        <a className="button button-small desktop-cta" href="#diagnostico">{text.nav.cta}</a>
        <button ref={trigger} className="menu-trigger" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? text.nav.close : text.nav.open}</button>
      </div>
    </div>
    {open && <div className="mobile-menu" id="mobile-menu" ref={panel} aria-label={text.nav.work}>
      <button className="menu-close" type="button" onClick={() => { close(); trigger.current?.focus() }}>{text.nav.close}</button>
      <nav>{links.map(([label, href]) => <a onClick={close} key={href} href={href}>{label}</a>)}<a onClick={close} href="#diagnostico">{text.nav.cta}</a></nav>
    </div>}
  </header>
}

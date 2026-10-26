'use client'

import Link from 'next/link'
import { useState, type FocusEvent, type KeyboardEvent } from 'react'
import type { ExperienceCopy } from '@/content/homeExperience'
import { localePath, type Locale } from '@/lib/i18n'

export function ServicesMegaMenu({ locale, label, copy }: { locale: Locale; label: string; copy: ExperienceCopy['services'] }) {
  const [open, setOpen] = useState(false)
  const closeAfterFocusLeaves = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }
  const closeWithEscape = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setOpen(false)
      event.currentTarget.querySelector<HTMLButtonElement>('button')?.focus()
    }
  }
  return (
    <div
      className="services-menu"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={closeAfterFocusLeaves}
      onKeyDown={closeWithEscape}
    >
      <button type="button" aria-haspopup="true" aria-expanded={open} aria-controls="services-mega-menu" onClick={() => setOpen(true)}>
        {label}
        <svg aria-hidden="true" viewBox="0 0 12 12">
          <path d="m2.5 4.25 3.5 3.5 3.5-3.5" />
        </svg>
      </button>
      <div id="services-mega-menu" hidden={!open} className="services-mega-panel">
        <div><p className="flow-eyebrow">Severius stack</p><strong>{copy.menuLabel}</strong><span>{copy.menuDescription}</span></div>
        <ul>
          {copy.items.map(item => <li key={item.id}><Link href={`${localePath(locale, '/')}#capacidades`} onClick={() => setOpen(false)}><b>{item.number}</b><span>{item.title}</span><i aria-hidden="true">↗</i></Link></li>)}
        </ul>
      </div>
    </div>
  )
}

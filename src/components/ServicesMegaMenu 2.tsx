'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ExperienceCopy } from '@/content/homeExperience'
import { localePath, type Locale } from '@/lib/i18n'

export function ServicesMegaMenu({ locale, copy }: { locale: Locale; copy: ExperienceCopy['services'] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="services-menu" onPointerLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-controls="services-mega-menu" onClick={() => setOpen(value => !value)}>
        {copy.menuLabel}<span aria-hidden="true">⌄</span>
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localeFromPath } from '@/lib/site'

const text = {
  'pt-br': { title: 'Esta página não foi encontrada.', home: 'Voltar ao início' },
  en: { title: 'This page could not be found.', home: 'Back to the homepage' },
} as const

export default function NotFound() {
  const locale = localeFromPath(usePathname())
  return <main className="state-page"><p className="wordmark">Severius</p><h1>{text[locale].title}</h1><Link className="button" href={`/${locale}`}>{text[locale].home}</Link></main>
}

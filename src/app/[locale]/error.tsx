'use client'

import { usePathname } from 'next/navigation'
import { localeFromPath } from '@/lib/site'

const text = {
  'pt-br': { title: 'Não foi possível carregar esta página.', retry: 'Tentar novamente' },
  en: { title: 'This page could not be loaded.', retry: 'Try again' },
} as const

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = text[localeFromPath(usePathname())]
  return <main className="state-page"><p className="wordmark">Severius</p><h1>{t.title}</h1><button className="button" type="button" onClick={reset}>{t.retry}</button></main>
}

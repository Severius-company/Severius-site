'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { FlagBrazil, FlagEngland } from '@/components/Flags'
import { HTML_LANG, LOCALES, localePath, stripLocale, type Locale } from '@/lib/i18n'
import { cx } from '@/lib/cx'

type Props = { locale: Locale; labels: Record<Locale, string>; groupLabel: string; className?: string; onNavigate?: () => void }

const FLAGS: Record<Locale, typeof FlagBrazil> = { en: FlagEngland, 'pt-br': FlagBrazil }

function Links({ locale, labels, groupLabel, className, onNavigate, search }: Props & { search: string }) {
  const base = stripLocale(usePathname() ?? '/')
  return (
    <ul aria-label={groupLabel} className={cx('m-0 flex list-none items-center gap-1.5 p-0', className)}>
      {LOCALES.map(l => {
        const Flag = FLAGS[l]
        const active = l === locale
        return (
          <li key={l}>
            <Link
              href={`${localePath(l, base)}${search}`}
              prefetch={false}
              hrefLang={HTML_LANG[l]}
              lang={HTML_LANG[l]}
              aria-label={labels[l]}
              aria-current={active ? 'true' : undefined}
              onClick={onNavigate}
              className={cx(
                'flex size-11 items-center justify-center rounded-rb border transition-colors duration-150',
                active ? 'glass-control border-accent ring-2 ring-accent' : 'border-line2 bg-white/[0.025] backdrop-blur-md hover:border-hero-muted hover:bg-white/[0.08]',
              )}
            >
              <Flag className="flag block h-4 w-[22px] rounded-[2px]" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function WithSearch(props: Props) {
  const params = useSearchParams()
  const tab = params.get('tab')
  return <Links {...props} search={tab ? `?tab=${encodeURIComponent(tab)}` : ''} />
}

/** Leva à mesma página no outro idioma, preservando ?tab=. Sem cookie, sem redirecionamento automático. */
export function LanguageSwitcher(props: Props) {
  return (
    <Suspense fallback={<Links {...props} search="" />}>
      <WithSearch {...props} />
    </Suspense>
  )
}

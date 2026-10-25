import Link from 'next/link'
import { LogoMark } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import { getNavRoutes } from '@/content'
import { CONTACT } from '@/content/shared'
import type { Dictionary } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'

export function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer className="border-t border-line">
      <Reveal className="mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] flex-wrap items-center justify-between gap-6 px-[clamp(20px,4vw,48px)] py-10">
        <Link href={localePath(locale, '/')} aria-label={dict.nav.homeAria} className="flex min-h-11 items-center gap-2.5">
          <LogoMark size={32} />
          <span className="text-lg font-semibold">Severius</span>
        </Link>
        <nav aria-label={dict.nav.footerAria}>
          <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
            {getNavRoutes().map(r => (
              <li key={r.key}>
                <Link href={localePath(locale, r.href)} className="flex min-h-11 min-w-11 items-center justify-center text-[15px] text-muted transition-colors duration-150 hover:text-text">
                  {dict.nav.links[r.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap gap-5 text-[15px] text-muted">
          <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-text">{CONTACT.email}</a>
          <a href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`} className="inline-flex min-h-11 items-center transition-colors duration-150 hover:text-text">{CONTACT.phone}</a>
        </div>
      </Reveal>
      <div className="mx-auto max-w-[1280px] min-[1800px]:max-w-[1600px] border-t border-line px-[clamp(20px,4vw,48px)] pt-[18px] pb-7 text-sm text-muted">
        {dict.footer.rights}
      </div>
    </footer>
  )
}

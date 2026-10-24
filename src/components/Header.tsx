import Link from 'next/link'
import { LinkButton } from '@/components/Button'
import { HeaderNav } from '@/components/HeaderNav'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LogoMark } from '@/components/Logo'
import { MobileMenu } from '@/components/MobileMenu'
import { getNavRoutes } from '@/content'
import type { Dictionary } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.nav
  const items = getNavRoutes().map(r => ({ ...r, label: t.links[r.key] }))
  return (
    <header className="sticky top-0 z-20">
      {/* blur numa camada própria: backdrop-filter no <header> viraria containing block do menu fixed */}
      <div aria-hidden="true" className="glass-bar absolute inset-0 -z-10 bg-navbar" />
      <div className="mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] items-center justify-between gap-5 px-[clamp(20px,4vw,48px)] py-3.5">
        <Link href={localePath(locale, '/')} aria-label={t.homeAria} className="flex flex-none items-center gap-2.5">
          <LogoMark size={36} />
          <span className="text-xl font-semibold tracking-[-0.01em]">Severius</span>
        </Link>
        <nav aria-label={t.mainAria} className="hidden min-w-0 flex-1 lg:flex">
          <HeaderNav locale={locale} items={items} />
        </nav>
        <div className="hidden flex-none items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} labels={t.languages} groupLabel={t.languageAria} />
          <LinkButton href={localePath(locale, '/contact')} className="h-11 px-5">{t.contact}</LinkButton>
        </div>
        <MobileMenu locale={locale} items={items} t={t} />
      </div>
    </header>
  )
}

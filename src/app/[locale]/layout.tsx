import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SpotlightGlow } from '@/components/SpotlightGlow'
import { getDictionary } from '@/content'
import { HTML_LANG, LOCALES, isLocale } from '@/lib/i18n'
import { hasApprovedOrigin, siteOrigin } from '@/lib/site'
import '../globals.css'

const barlow = localFont({
  src: [
    { path: '../fonts/barlow-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/barlow-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/barlow-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/barlow-700.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-barlow',
})

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return LOCALES.map(locale => ({ locale }))
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = getDictionary(locale)
  return {
    metadataBase: new URL(siteOrigin),
    title: { default: dict.meta.homeTitle, template: `%s · ${dict.meta.titleSuffix}` },
    description: dict.meta.homeDescription,
    applicationName: 'Severius',
    robots: hasApprovedOrigin ? undefined : { index: false, follow: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#141414',
  colorScheme: 'dark',
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw
  const dict = getDictionary(locale)
  return (
    <html lang={HTML_LANG[locale]} className={`${barlow.variable} ${barlow.className}`}>
      <body className="min-h-screen bg-bg font-sans text-text">
        <SpotlightGlow />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-rb focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
          {dict.nav.skip}
        </a>
        <Header locale={locale} dict={dict} />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} />
      </body>
    </html>
  )
}

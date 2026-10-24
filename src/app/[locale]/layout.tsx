import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import '@fontsource-variable/recursive'
import { copy } from '@/lib/copy'
import { isLocale, locales, ogLocale, siteOrigin } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() { return locales.map(locale => ({ locale })) }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const text = copy[locale]
  return { metadataBase: new URL(siteOrigin), title: text.meta.title, description: text.meta.description, robots: { index: false, follow: false }, alternates: { canonical: `/${locale}`, languages: { 'pt-BR':'/pt-br', en:'/en', 'x-default':'/pt-br' } }, openGraph: { title:text.meta.ogTitle, description:text.meta.ogDescription, type:'website', locale:ogLocale[locale], url:`/${locale}`, siteName:'Severius' } }
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const languageScript = `document.documentElement.lang=${JSON.stringify(copy[locale].lang)}`.replace(/</g, '\\u003c')
  return <><script dangerouslySetInnerHTML={{ __html: languageScript }}/>{children}</>
}

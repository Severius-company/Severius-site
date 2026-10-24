import type { Metadata } from 'next'
import { HTML_LANG, languageAlternates, localePath, type Locale } from '@/lib/i18n'

/** title/description por idioma + canonical + hreflang (en-GB, pt-BR, x-default). */
export function pageMetadata(locale: Locale, path: string, title: string, description: string, absoluteTitle = false): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: localePath(locale, path), languages: languageAlternates(path) },
    openGraph: { title, description, locale: HTML_LANG[locale].replace('-', '_'), siteName: 'Severius', type: 'website' },
  }
}

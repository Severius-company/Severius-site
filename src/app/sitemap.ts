import type { MetadataRoute } from 'next'
import { WORK_BASE } from '@/content/shared'
import { LOCALES, languageAlternates, localePath } from '@/lib/i18n'
import { careersEnabled, siteOrigin } from '@/lib/site'

/** Rotas públicas sem prefixo de idioma (Careers só com a flag ligada). */
export function sitemapPaths(): string[] {
  return [
    '/', '/services', '/work', '/process', '/about', ...(careersEnabled ? ['/careers'] : []), '/contact',
    ...WORK_BASE.map(w => `/work/${w.slug}`),
  ]
}

const abs = (p: string) => `${siteOrigin}${p === '/' ? '' : p}`

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPaths().flatMap(path => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).filter(([k]) => k !== 'x-default').map(([k, v]) => [k, abs(v)]),
    )
    return LOCALES.map(locale => ({
      url: abs(localePath(locale, path)),
      changeFrequency: 'monthly' as const,
      priority: path === '/' ? 1 : path.startsWith('/work/') ? 0.6 : 0.8,
      alternates: { languages },
    }))
  })
}

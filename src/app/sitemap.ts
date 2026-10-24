import type { MetadataRoute } from 'next'
import { insightSlugs, locales, siteOrigin } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap(locale => [{ url:`${siteOrigin}/${locale}`, changeFrequency:'monthly' as const, priority:1 }, { url:`${siteOrigin}/${locale}/insights/${insightSlugs[locale]}`, changeFrequency:'monthly' as const, priority:.7 }])
}

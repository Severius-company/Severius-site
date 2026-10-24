import type { MetadataRoute } from 'next'
import { hasApprovedOrigin, siteOrigin } from '@/lib/site'

/** Prévia privada até existir domínio aprovado (NEXT_PUBLIC_SITE_ORIGIN). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: hasApprovedOrigin ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: `${siteOrigin}/sitemap.xml`,
  }
}

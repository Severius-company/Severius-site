export const LOCALES = ['en', 'pt-br'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

/** Valor de <html lang> / hreflang por locale. */
export const HTML_LANG: Record<Locale, 'en-GB' | 'pt-BR'> = { en: 'en-GB', 'pt-br': 'pt-BR' }

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Caminho público: inglês sem prefixo, pt-BR em /pt-br. Aceita query (ex.: "/services?tab=design"). */
export function localePath(locale: Locale, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  if (locale === 'en') return p
  if (p === '/') return '/pt-br'
  if (p.startsWith('/?')) return `/pt-br${p.slice(1)}`
  return `/pt-br${p}`
}

/** Remove o prefixo de locale ("/en" interno do rewrite ou "/pt-br") e devolve o caminho base. */
export function stripLocale(pathname: string): string {
  for (const prefix of ['/pt-br', '/en']) {
    if (pathname === prefix) return '/'
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length)
  }
  return pathname || '/'
}

export function localeFromPathname(pathname: string): Locale {
  return pathname === '/pt-br' || pathname.startsWith('/pt-br/') ? 'pt-br' : 'en'
}

/** hreflang + canonical de uma rota base (sem prefixo). */
export function languageAlternates(path: string) {
  return {
    'en-GB': localePath('en', path),
    'pt-BR': localePath('pt-br', path),
    'x-default': localePath('en', path),
  }
}

/** Substitui {chave} num template. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''))
}

/** Link ativo do header: "/" só é exato; "/work/*" ativa "Work". Recebe o caminho já sem locale. */
export function isActiveLink(basePath: string, href: string): boolean {
  if (href === '/') return basePath === '/'
  return basePath === href || basePath.startsWith(`${href}/`)
}

export const locales = ['pt-br', 'en'] as const
export type Locale = (typeof locales)[number]
export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://example.invalid'

/** Domínio de produção ainda não aprovado: nenhuma URL absoluta pública deve ser afirmada. */
export const hasApprovedOrigin = Boolean(process.env.NEXT_PUBLIC_SITE_ORIGIN)

export const ogLocale: Record<Locale, string> = { 'pt-br': 'pt_BR', en: 'en_US' }

export function localeFromPath(pathname: string | null): Locale {
  return pathname?.split('/')[1] === 'en' ? 'en' : 'pt-br'
}

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export const insightSlugs: Record<Locale, string> = {
  'pt-br': 'como-tirar-uma-ideia-do-campo-da-incerteza',
  en: 'from-uncertainty-to-a-buildable-software-project',
}

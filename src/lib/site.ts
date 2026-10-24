export const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://example.invalid'

/** Domínio de produção ainda não aprovado: sem origem definida, o robots bloqueia indexação. */
export const hasApprovedOrigin = Boolean(process.env.NEXT_PUBLIC_SITE_ORIGIN)

/**
 * Careers em standby: com `false`, /careers e /pt-br/careers respondem 404 e o link some de
 * header, menu mobile, footer e sitemap. Código e conteúdo (vagas, perks) continuam no projeto:
 * para reativar basta trocar para `true`.
 */
export const careersEnabled = false

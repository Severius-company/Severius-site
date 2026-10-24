import { describe, expect, it } from 'vitest'
import { fill, isActiveLink, languageAlternates, localeFromPathname, localePath, stripLocale } from './i18n'

describe('i18n helpers', () => {
  it('localePath: inglês sem prefixo, pt-BR em /pt-br (com query)', () => {
    expect(localePath('en', '/')).toBe('/')
    expect(localePath('en', '/services?tab=engineering')).toBe('/services?tab=engineering')
    expect(localePath('pt-br', '/')).toBe('/pt-br')
    expect(localePath('pt-br', '/work/chic-boutique')).toBe('/pt-br/work/chic-boutique')
    expect(localePath('pt-br', '/services?tab=design')).toBe('/pt-br/services?tab=design')
  })
  it('stripLocale remove /pt-br e o /en interno do rewrite', () => {
    expect(stripLocale('/pt-br')).toBe('/')
    expect(stripLocale('/pt-br/about')).toBe('/about')
    expect(stripLocale('/en/work/x')).toBe('/work/x')
    expect(stripLocale('/about')).toBe('/about')
    expect(stripLocale('/pt-brx')).toBe('/pt-brx')
    expect(localeFromPathname('/pt-br/contact')).toBe('pt-br')
    expect(localeFromPathname('/contact')).toBe('en')
  })
  it('hreflang alternates', () => {
    expect(languageAlternates('/about')).toEqual({ 'en-GB': '/about', 'pt-BR': '/pt-br/about', 'x-default': '/about' })
  })
  it('link ativo: /work/* ativa Work; / só exato', () => {
    expect(isActiveLink('/work/chic-boutique', '/work')).toBe(true)
    expect(isActiveLink('/work', '/')).toBe(false)
    expect(isActiveLink('/', '/')).toBe(true)
  })
  it('fill', () => {
    expect(fill('Next: {client}', { client: 'EduConnect' })).toBe('Next: EduConnect')
  })
})

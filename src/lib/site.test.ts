import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import robots from '@/app/robots'
import { insightSlugs, isLocale, localeFromPath, locales } from './site'

describe('site', () => {
  it('reconhece somente os idiomas suportados', () => {
    expect(locales).toEqual(['pt-br', 'en'])
    for (const value of ['pt-br', 'en']) expect(isLocale(value)).toBe(true)
    for (const value of ['', 'pt', 'PT-BR', 'es', '../en', 'en/x']) expect(isLocale(value)).toBe(false)
  })

  it('deduz o idioma pelo caminho e cai em PT-BR quando desconhecido', () => {
    expect(localeFromPath('/en/insights/x')).toBe('en')
    expect(localeFromPath('/pt-br')).toBe('pt-br')
    expect(localeFromPath('/xx')).toBe('pt-br')
    expect(localeFromPath(null)).toBe('pt-br')
  })

  it('sitemap lista home e insight de cada idioma, sem duplicatas', () => {
    const urls = sitemap().map(entry => entry.url)
    expect(urls).toHaveLength(4)
    expect(new Set(urls).size).toBe(4)
    for (const locale of locales) {
      expect(urls.some(url => url.endsWith(`/${locale}`))).toBe(true)
      expect(urls.some(url => url.endsWith(`/${locale}/insights/${insightSlugs[locale]}`))).toBe(true)
    }
  })

  it('robots bloqueia indexação enquanto o site é uma prévia privada', () => {
    const { rules } = robots()
    const rule = Array.isArray(rules) ? rules[0] : rules
    expect(rule.userAgent).toBe('*')
    expect(rule.disallow).toBe('/')
  })
})

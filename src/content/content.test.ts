import { describe, expect, it } from 'vitest'
import { sitemapPaths } from '@/app/sitemap'
import { shotLabel } from '@/components/WorkCard'
import { careersEnabled } from '@/lib/site'
import { slugify } from '@/lib/slug'
import { getDictionary, getNavRoutes, getQuotes, getWorks, nextWork } from './index'

/** Estrutura (chaves e tamanhos de listas) igual nos dois idiomas. */
function shape(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(shape)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'locale').map(([k, x]) => [k, shape(x)]))
  return typeof v
}

const en = getDictionary('en')
const pt = getDictionary('pt-br')

describe('dicionários', () => {
  it('en e pt-br têm a mesma estrutura', () => {
    expect(shape(pt)).toEqual(shape(en))
  })
  it('placeholders {x} iguais nos dois idiomas', () => {
    const tokens = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join()
    const walk = (a: unknown, b: unknown, path: string) => {
      if (typeof a === 'string') return expect(tokens(b as string), path).toBe(tokens(a))
      if (a && typeof a === 'object') for (const k of Object.keys(a)) walk((a as never)[k], (b as never)[k], `${path}.${k}`)
    }
    walk(en, pt, 'dict')
  })
  it('inglês britânico (sem grafias americanas comuns)', () => {
    const text = JSON.stringify(en)
    for (const us of ['personalized', 'customization', 'specialize', 'optimize', 'prioritize', 'analyze', 'Color ', 'training programs', 'Modernization', 'recognized', 'travelers', 'inquiries', 'Personalization']) {
      expect(text, us).not.toContain(us)
    }
  })
  it('texto literal do protótipo preservado nos pontos-chave', () => {
    expect(en.hero.trusted).toBe('Trusted by 250+ companies')
    expect(en.cta.title).toBe('Thank you for your Interest in Severius.')
    expect(getQuotes(en)[0].role).toBe('CEO of Chic Boutique')
  })
})

describe('works', () => {
  it('slugs iguais nos dois idiomas e únicos', () => {
    const a = getWorks(en).map(w => w.slug)
    expect(getWorks(pt).map(w => w.slug)).toEqual(a)
    expect(new Set(a).size).toBe(10)
    expect(slugify('Dream Homes Realty')).toBe('dream-homes-realty')
    expect(slugify('  Ação & Cia!  ')).toBe('acao-cia')
  })
  it('next do último volta ao primeiro', () => {
    expect(nextWork(en, 'connectcrm').slug).toBe('chic-boutique')
    expect(nextWork(pt, 'chic-boutique').client).toBe('HungryBites')
  })
  it('placeholder do mockup por idioma', () => {
    const w = getWorks(en)[0]
    expect(shotLabel(en.workUi.shot, w)).toBe('web mockup · chic boutique')
    expect(shotLabel(pt.workUi.shot, w)).toBe('mockup web · chic boutique')
  })
})

describe('careers em standby', () => {
  it('flag desligada tira Careers do nav e do sitemap', () => {
    expect(careersEnabled).toBe(false)
    expect(getNavRoutes().map(r => r.key)).not.toContain('careers')
    expect(sitemapPaths()).not.toContain('/careers')
    expect(sitemapPaths()).toContain('/work/chic-boutique')
  })
  it('conteúdo de careers continua disponível para reativar', () => {
    expect(en.careers.jobs).toHaveLength(12)
    expect(pt.careers.perks).toHaveLength(4)
  })
})

import { describe, expect, it } from 'vitest'
import { copy } from './copy'

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]))
  return typeof value
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

describe('conteúdo bilíngue', () => {
  it('PT-BR e inglês têm a mesma estrutura (nenhum bloco falta em um idioma)', () => {
    expect(shape(copy['pt-br'])).toEqual(shape(copy.en))
  })

  it('preserva a promessa aprovada e o CTA principal', () => {
    expect(copy['pt-br'].hero.title).toBe('Transformamos ideias e operações em software seguro, útil e preparado para evoluir.')
    expect(copy['pt-br'].nav.cta).toBe('Solicitar diagnóstico')
    expect(copy.en.nav.cta).toBe('Request a diagnostic')
  })

  it('organiza as capacidades nos quatro grupos aprovados', () => {
    expect(copy['pt-br'].capabilities.groups.map(([title]) => title)).toEqual(['Definir', 'Construir', 'Conectar', 'Evoluir'])
    expect(copy.en.capabilities.groups.map(([title]) => title)).toEqual(['Define', 'Build', 'Connect', 'Evolve'])
  })

  it('identifica as demonstrações como Severius Labs e conceituais', () => {
    expect(copy['pt-br'].labs.label).toMatch(/Severius Labs.*não projetos de clientes/)
    expect(copy.en.labs.label).toMatch(/Severius Labs.*not client work/)
  })

  it('não contém prova, cliente, estatística, e-mail ou domínio inventados', () => {
    const forbidden = [/\d+\s?%/, /\d+\+?\s?(clientes|clients|anos|years|projetos entregues|projects delivered)/i, /@[a-z0-9-]+\./i, /https?:\/\//i, /www\./i, /depoimento|testimonial|premiad|award-winning|case de sucesso/i]
    for (const locale of ['pt-br', 'en'] as const) {
      for (const text of strings(copy[locale])) for (const pattern of forbidden) expect(text, `${locale}: "${text}"`).not.toMatch(pattern)
    }
  })

  it('nunca menciona o nome do modelo ou de IA de terceiros como atribuição', () => {
    for (const text of strings(copy)) expect(text).not.toMatch(/claude|anthropic|openai|chatgpt|gemini/i)
  })
})

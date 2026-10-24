import { describe, expect, it } from 'vitest'
import { buildRequestSummary, validateDiagnostic } from './form'

const valid = {
  name: '  Pessoa Exemplo  ',
  contact: 'PESSOA@EXAMPLE.COM',
  context: '  Modernizar uma operação interna.\r\nSem dados reais.  ',
  stage: 'defining',
  consent: true,
} as const

describe('validateDiagnostic', () => {
  it('normalizes only safe, predictable fields', () => {
    const result = validateDiagnostic(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({
        ...valid,
        name: 'Pessoa Exemplo',
        contact: 'PESSOA@example.com',
        context: 'Modernizar uma operação interna.\nSem dados reais.',
      })
    }
  })

  it('rejects unknown stages, control characters and oversized values', () => {
    const result = validateDiagnostic({
      ...valid,
      name: 'A\u0000B',
      contact: 'x'.repeat(161),
      context: 'x'.repeat(1501),
      stage: 'unknown',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toMatchObject({ name: 'invalid', contact: 'too_long', context: 'too_long', stage: 'invalid' })
    }
  })

  it('requires explicit local consent', () => {
    const result = validateDiagnostic({ ...valid, consent: false })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors.consent).toBe('required')
  })
})

describe('buildRequestSummary', () => {
  it('creates a local text summary without hidden fields', () => {
    const result = validateDiagnostic(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(buildRequestSummary(result.data, 'pt-br')).toBe(
        'Solicitação de diagnóstico — Severius\nNome: Pessoa Exemplo\nContato: PESSOA@example.com\nMomento: Definindo\nContexto:\nModernizar uma operação interna.\nSem dados reais.',
      )
    }
  })
})

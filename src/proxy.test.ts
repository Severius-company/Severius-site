import { getRedirectUrl, getRewrittenUrl, isRewrite } from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { proxy } from './proxy'

const request = (path: string, country?: string, cookie?: string) => new NextRequest(`https://severius.com${path}`, {
  headers: {
    ...(country ? { 'x-vercel-ip-country': country } : {}),
    ...(cookie ? { cookie: `severius-locale=${cookie}` } : {}),
  },
})

describe('geo locale proxy', () => {
  it('envia visitantes do Brasil para a rota equivalente em português', () => {
    const response = proxy(request('/services?tab=design', 'BR'))
    expect(getRedirectUrl(response)).toBe('https://severius.com/pt-br/services?tab=design')
  })

  it('mantém os demais países em inglês sem prefixo', () => {
    const response = proxy(request('/services', 'US'))
    expect(isRewrite(response)).toBe(true)
    expect(getRewrittenUrl(response)).toBe('https://severius.com/en/services')
  })

  it('respeita a escolha manual acima da geolocalização', () => {
    expect(getRewrittenUrl(proxy(request('/', 'BR', 'en')))).toBe('https://severius.com/en')
    expect(getRedirectUrl(proxy(request('/', 'US', 'pt-br')))).toBe('https://severius.com/pt-br')
  })

  it('usa inglês quando a plataforma não informa o país', () => {
    expect(getRewrittenUrl(proxy(request('/')))).toBe('https://severius.com/en')
  })

  it('ignora uma preferência inválida', () => {
    expect(getRedirectUrl(proxy(request('/', 'BR', 'invalid')))).toBe('https://severius.com/pt-br')
  })
})

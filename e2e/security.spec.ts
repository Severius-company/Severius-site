import { readFileSync } from 'node:fs'
import { expect, test, type Request } from '@playwright/test'
import { ARTICLE, HOME, PAGES, VIEWPORTS, openPage, sameOrigin } from './helpers'

const ROUTES = [...PAGES.map(p => p.path), '/robots.txt', '/sitemap.xml', '/xx', '/pt-br/nada', '/en/nada', '/']

function directives(csp: string) {
  return Object.fromEntries(csp.split(';').map(d => d.trim()).filter(Boolean).map(d => { const [name, ...values] = d.split(/\s+/); return [name, values] }))
}

test.describe('Headers de segurança em cada resposta', () => {
  for (const route of ROUTES) {
    test(`[AC-082] ${route}: CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options e Permissions-Policy`, async ({ request }) => {
      const response = await request.get(route, { maxRedirects: 0 })
      const h = response.headers()
      expect(h['content-security-policy'], 'Content-Security-Policy').toBeTruthy()
      expect(h['x-content-type-options']).toBe('nosniff')
      expect(h['referrer-policy']).toMatch(/strict-origin-when-cross-origin|no-referrer|same-origin|strict-origin/)
      expect(h['x-frame-options']).toMatch(/^(DENY|SAMEORIGIN)$/i)
      expect(h['permissions-policy']).toMatch(/camera=\(\)/)
      expect(h['permissions-policy']).toMatch(/microphone=\(\)/)
      expect(h['permissions-policy']).toMatch(/geolocation=\(\)/)
      expect(h['x-powered-by'], 'x-powered-by não deve vazar').toBeUndefined()
    })
  }

  test('[AC-082] CSP: baseline restritivo (default-src self, sem unsafe-eval, sem curinga, frame-ancestors none, object-src none, base-uri/form-action self)', async ({ request }) => {
    const csp = (await request.get('/pt-br')).headers()['content-security-policy']
    const d = directives(csp)
    expect(d['default-src']).toEqual(["'self'"])
    expect(d['object-src']).toEqual(["'none'"])
    expect(d['frame-ancestors']).toEqual(["'none'"])
    expect(d['base-uri']).toEqual(["'self'"])
    expect(d['form-action']).toEqual(["'self'"])
    expect(d['connect-src']).toEqual(["'self'"])
    expect(d['font-src']).toEqual(["'self'"])
    for (const [name, values] of Object.entries(d)) {
      expect(values, `${name} sem curinga/host externo`).not.toContain('*')
      expect(values.filter(v => /^https?:/.test(v)), `${name} sem hosts externos`).toEqual([])
      expect(values, `${name} sem unsafe-eval em produção`).not.toContain("'unsafe-eval'")
    }
  })

  test("[AC-082] CSP: script-src só usa 'unsafe-inline' se houver exceção EXC-01 registrada em work/exceptions.md (sem curinga)", async ({ request }, testInfo) => {
    const d = directives((await request.get('/pt-br')).headers()['content-security-policy'])
    if (d['script-src'].includes("'unsafe-inline'")) {
      const registry = readFileSync('work/exceptions.md', 'utf8')
      expect(registry, 'EXC-01 precisa existir com status explícito').toMatch(/\| EXC-01 \|[^\n]*(Pendente de aprovação|Aprovado)/)
      testInfo.annotations.push({ type: 'EXC-01', description: "script-src 'unsafe-inline' — exceção registrada, PENDENTE de aprovação humana; bloqueia publicação" })
    }
    expect(d['script-src']).not.toContain('*')
    expect(d['script-src']).not.toContain("'unsafe-eval'")
  })

  test("[AC-082] CSP: style-src com 'unsafe-inline' é exceção registrada (informativo — reporta o valor observado)", async ({ request }, testInfo) => {
    const d = directives((await request.get('/pt-br')).headers()['content-security-policy'])
    testInfo.annotations.push({ type: 'style-src', description: d['style-src'].join(' ') })
    expect(d['style-src']).not.toContain('*')
  })
})

for (const profile of [
  { key: 'desktop', use: { viewport: VIEWPORTS.desktop } },
  { key: 'mobile', use: { viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true } },
]) {
  test.describe(`Nenhuma requisição externa, erro de console ou violação de CSP (${profile.key})`, () => {
    test.use(profile.use)
    for (const p of [...PAGES, { name: '404', path: '/pt-br/nada', kind: 'home' as const, locale: 'pt-br' as const }]) {
      test(`[AC-042][AC-082][AC-086] ${p.path}: só requisições same-origin, fontes locais, sem falhas, sem console error/warn, sem CSP violation, sem cookies`, async ({ page, baseURL, context }) => {
        const requests: Request[] = []
        const failed: string[] = []
        const bad: string[] = []
        const consoleProblems: string[] = []
        const pageErrors: string[] = []
        page.on('request', r => requests.push(r))
        page.on('requestfailed', r => failed.push(`${r.url()} ${r.failure()?.errorText}`))
        page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith(p.path)) bad.push(`${r.status()} ${r.url()}`) })
        page.on('console', m => {
          if (!['error', 'warning'].includes(m.type())) return
          // Ruído do driver GL do host (headless, GPU stall) não é do produto.
          if (/GL Driver Message/.test(m.text())) return
          // EXC-03 (work/exceptions.md): aviso upstream do @react-three/fiber 9.7 com three 0.186; só esta mensagem exata.
          if (m.text() === 'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.') return
          // Log do próprio navegador para o documento 404 intencional.
          if (p.name === '404' && /Failed to load resource: the server responded with a status of 404/.test(m.text())) return
          consoleProblems.push(`${m.type()}: ${m.text()}`)
        })
        page.on('pageerror', e => pageErrors.push(e.message))
        await page.addInitScript(() => {
          const w = window as unknown as { __csp: string[] }
          w.__csp = []
          document.addEventListener('securitypolicyviolation', e => w.__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
        })
        await openPage(page, p.path)
        await page.mouse.wheel(0, 3000) // percorre a página (lazy/observers)
        await page.waitForTimeout(600)

        expect(requests.filter(r => !sameOrigin(r.url(), baseURL!)).map(r => r.url()), 'requisições a outras origens').toEqual([])
        expect(requests.filter(r => r.method() !== 'GET').map(r => `${r.method()} ${r.url()}`)).toEqual([])
        expect(failed, 'requisições falhas').toEqual([])
        expect(bad, 'subrecursos com status >= 400').toEqual([])
        expect(consoleProblems, 'console error/warn (inclui hidratação)').toEqual([])
        expect(pageErrors, 'pageerror').toEqual([])
        expect(await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp), 'violações de CSP').toEqual([])
        expect(await context.cookies(), 'cookies').toEqual([])
        expect(await page.evaluate(() => localStorage.length + sessionStorage.length), 'web storage').toBe(0)

        if (p.path === HOME['pt-br'] || p.path === HOME.en) {
          const fonts = requests.filter(r => r.resourceType() === 'font')
          expect(fonts.length, 'fontes locais carregadas').toBeGreaterThan(0)
          expect(fonts.every(r => sameOrigin(r.url(), baseURL!))).toBe(true)
        }
      })
    }
  })
}

test.describe('Recursos e política de referência', () => {
  test('[AC-081] preview não expõe endpoints de API nem source maps públicos', async ({ request }) => {
    for (const route of ['/api', '/api/contact', '/api/form', '/_next/server', '/.env', '/package.json']) {
      const status = (await request.get(route, { maxRedirects: 0 })).status()
      expect(status, `${route} deve ser 404`).toBe(404)
    }
  })

  test('[AC-080] HTML e chunks públicos não contêm padrões de segredo comuns', async ({ page, request }) => {
    const assets: string[] = []
    page.on('response', r => { if (['script', 'stylesheet', 'document'].includes(r.request().resourceType())) assets.push(r.url()) })
    await openPage(page, ARTICLE['en'])
    await openPage(page, HOME['pt-br'])
    const patterns: [string, RegExp][] = [
      ['AWS key', /AKIA[0-9A-Z]{16}/], ['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/], ['token GitHub', /gh[pousr]_[A-Za-z0-9]{30,}/],
      ['Bearer/JWT', /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/], ['Slack', /xox[baprs]-[A-Za-z0-9-]{10,}/],
      ['sk- key', /\bsk-[A-Za-z0-9]{32,}\b/],
    ]
    const hits: string[] = []
    for (const url of new Set(assets)) {
      const body = await (await request.get(url)).text()
      for (const [label, re] of patterns) if (re.test(body)) hits.push(`${label} em ${new URL(url).pathname}`)
      // source maps referenciados publicamente
      if (/\/\/# sourceMappingURL=/.test(body)) hits.push(`sourceMappingURL em ${new URL(url).pathname}`)
    }
    expect(assets.length).toBeGreaterThan(5)
    expect(hits).toEqual([])
  })
})

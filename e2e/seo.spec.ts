import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { ARTICLE, HOME, HTML_LANG, LOCALES, PAGES } from './helpers'

const ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://example.invalid'

type Head = {
  htmlLang: string
  title: string
  description: string
  robots: string
  canonicals: string[]
  alternates: { hreflang: string; href: string }[]
  og: Record<string, string>
  ldJson: string[]
}

async function readHead(page: Page): Promise<Head> {
  return page.evaluate(() => {
    const meta = (selector: string) => document.querySelector<HTMLMetaElement>(selector)?.content ?? ''
    const og: Record<string, string> = {}
    document.querySelectorAll<HTMLMetaElement>('meta[property^="og:"]').forEach(m => { og[m.getAttribute('property')!] = m.content })
    return {
      htmlLang: document.documentElement.lang,
      title: document.title,
      description: meta('meta[name="description"]'),
      robots: meta('meta[name="robots"]'),
      canonicals: [...document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')].map(l => l.href),
      alternates: [...document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')].map(l => ({ hreflang: l.getAttribute('hreflang')!, href: l.href })),
      og,
      ldJson: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent ?? ''),
    }
  })
}

const pathOf = (url: string) => new URL(url).pathname

test.describe('SEO técnico', () => {
  for (const p of PAGES) {
    test(`[AC-060] ${p.path}: title, description, Open Graph e idioma coerentes`, async ({ page }) => {
      await page.goto(p.path)
      const head = await readHead(page)
      expect(head.htmlLang).toBe(HTML_LANG[p.locale])
      expect(head.title.trim().length).toBeGreaterThan(10)
      expect(head.description.trim().length).toBeGreaterThan(30)
      for (const key of ['og:title', 'og:description', 'og:locale', 'og:url', 'og:site_name', 'og:type']) {
        expect(head.og[key], key).toBeTruthy()
      }
      expect(head.og['og:locale'].toLowerCase().replace('_', '-')).toMatch(p.locale === 'en' ? /^en/ : /^pt-br/)
      expect(head.og['og:site_name']).toBe('Severius')
    })

    test(`[AC-060] ${p.path}: og:url e og:title descrevem ESTA página (não herdam os da home)`, async ({ page }) => {
      await page.goto(p.path)
      const head = await readHead(page)
      expect(pathOf(head.og['og:url']), 'og:url').toBe(p.path)
      if (p.kind === 'article') {
        expect(head.og['og:title'], 'og:title deve refletir o artigo').toContain(head.title.split(' — ')[0].slice(0, 20))
      }
    })

    test(`[AC-061] ${p.path}: canonical único e autorreferente, hreflang pt-BR/en recíprocos apontando para o equivalente`, async ({ page }) => {
      await page.goto(p.path)
      const head = await readHead(page)
      expect(head.canonicals).toHaveLength(1)
      expect(new URL(head.canonicals[0]).origin).toBe(ORIGIN)
      expect(pathOf(head.canonicals[0])).toBe(p.path)
      const byLang = Object.fromEntries(head.alternates.map(a => [a.hreflang, a.href]))
      const targets = p.kind === 'home' ? HOME : ARTICLE
      expect(pathOf(byLang['pt-BR'])).toBe(targets['pt-br'])
      expect(pathOf(byLang['en'])).toBe(targets.en)
      expect(head.title).not.toBe('')
    })

    test(`[AC-061] ${p.path}: hreflang inclui x-default`, async ({ page }) => {
      await page.goto(p.path)
      const head = await readHead(page)
      expect(head.alternates.map(a => a.hreflang)).toContain('x-default')
    })

    test(`[AC-062] ${p.path}: meta robots "noindex, nofollow" (preview privado)`, async ({ page }) => {
      await page.goto(p.path)
      const head = await readHead(page)
      expect(head.robots.toLowerCase()).toContain('noindex')
      expect(head.robots.toLowerCase()).toContain('nofollow')
    })
  }

  test('[AC-060] títulos e descrições diferem entre PT-BR e EN', async ({ page }) => {
    const heads: Record<string, Head> = {}
    for (const locale of LOCALES) { await page.goto(HOME[locale]); heads[locale] = await readHead(page) }
    expect(heads['pt-br'].title).not.toBe(heads.en.title)
    expect(heads['pt-br'].description).not.toBe(heads.en.description)
    expect(heads['pt-br'].og['og:title']).not.toBe(heads.en.og['og:title'])
  })

  test('[AC-062][AC-063] robots.txt parseável, bloqueia tudo no preview e aponta para o sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')
    const lines = (await response.text()).split('\n').map(l => l.trim()).filter(Boolean)
    expect(lines.every(l => /^(user-agent|disallow|allow|sitemap|crawl-delay):\s*\S+/i.test(l)), `linhas inválidas: ${lines.join(' | ')}`).toBe(true)
    expect(lines).toContain('User-Agent: *')
    expect(lines).toContain('Disallow: /')
    expect(lines.some(l => /^Sitemap:\s*https?:\/\/\S+\/sitemap\.xml$/i.test(l))).toBe(true)
  })

  test('[AC-063] sitemap.xml é XML bem-formado e contém somente rotas existentes (200)', async ({ page, request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toMatch(/xml/)
    const xml = await response.text()
    const parsed = await page.evaluate(text => {
      const doc = new DOMParser().parseFromString(text, 'application/xml')
      return { error: doc.querySelector('parsererror')?.textContent ?? null, root: doc.documentElement.nodeName, locs: [...doc.querySelectorAll('url > loc')].map(n => n.textContent ?? '') }
    }, xml)
    expect(parsed.error).toBeNull()
    expect(parsed.root).toBe('urlset')
    expect(parsed.locs.map(pathOf).sort()).toEqual([...Object.values(HOME), ...Object.values(ARTICLE)].sort())
    for (const loc of parsed.locs) {
      expect(new URL(loc).origin).toBe(ORIGIN)
      expect((await request.get(pathOf(loc))).status(), loc).toBe(200)
    }
  })

  for (const locale of LOCALES) {
    test(`[AC-064] ${HOME[locale]}: JSON-LD parseável, Organization, sem "url" sem origem aprovada, sem campos/claims inventados`, async ({ page }) => {
      await page.goto(HOME[locale])
      const head = await readHead(page)
      // A home tem exatamente 2 blocos JSON-LD: Organization e FAQPage (verificado abaixo). Nenhum outro é esperado.
      expect(head.ldJson).toHaveLength(2)
      const parsed = head.ldJson.map(raw => JSON.parse(raw) as Record<string, unknown>)
      const data = parsed.find(d => d['@type'] === 'Organization')
      if (!data) throw new Error('bloco Organization ausente no JSON-LD')
      expect(data['@context']).toBe('https://schema.org')
      expect(data.name).toBe('Severius')
      if (!process.env.NEXT_PUBLIC_SITE_ORIGIN) expect(data, 'JSON-LD não pode afirmar url sem origem aprovada').not.toHaveProperty('url')
      for (const forbidden of ['email', 'telephone', 'address', 'founder', 'founders', 'aggregateRating', 'review', 'award', 'awards', 'employee', 'numberOfEmployees', 'sameAs', 'logo', 'foundingDate']) {
        expect(data, `propriedade não autorizada: ${forbidden}`).not.toHaveProperty(forbidden)
      }
      expect(data.description).toBe(head.description)
      for (const raw of head.ldJson) expect(raw).not.toMatch(/<\/?script/i)
    })

    test(`[AC-064] ${HOME[locale]}: JSON-LD FAQPage corresponde exatamente às perguntas e respostas visíveis`, async ({ page }) => {
      await page.goto(HOME[locale])
      const head = await readHead(page)
      const faqLd = head.ldJson.map(raw => JSON.parse(raw) as Record<string, unknown>).find(d => d['@type'] === 'FAQPage')
      if (!faqLd) throw new Error('bloco FAQPage ausente no JSON-LD')
      expect(faqLd['@context']).toBe('https://schema.org')
      const mainEntity = faqLd.mainEntity as { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[]
      expect(Array.isArray(mainEntity) && mainEntity.length).toBeGreaterThan(0)
      for (const item of mainEntity) {
        expect(item['@type']).toBe('Question')
        expect(item.acceptedAnswer['@type']).toBe('Answer')
      }
      const visible = await page.locator('.faq-list details').evaluateAll(nodes => nodes.map(n => ({
        question: n.querySelector('summary span')?.textContent?.trim() ?? '',
        answer: n.querySelector('p')?.textContent?.trim() ?? '',
      })))
      expect(mainEntity.map(m => ({ question: m.name, answer: m.acceptedAnswer.text }))).toEqual(visible)
    })
  }

  const CLAIMS: [string, RegExp][] = [
    ['clientes atendidos', /clientes\s+atendidos/i],
    ['%', /%/],
    ['anos de experiência', /anos\s+de\s+experi[eê]ncia/i],
    ['case', /\bcases?\b/i],
    ['depoimento', /depoiment/i],
    ['prêmio/premiado', /pr[eê]mi(o|ad)/i],
    ['clients served', /clients?\s+served/i],
    ['years of experience', /years\s+of\s+experience/i],
    ['testimonial', /testimonial/i],
    ['award', /\baward/i],
    ['case study', /case\s+stud/i],
  ]
  for (const p of PAGES) {
    test(`[AC-064][AC-014] ${p.path}: sem afirmações de cliente, estatística ou prêmio (JSON-LD, texto visível e metadados)`, async ({ page }) => {
      await page.goto(p.path)
      const corpus = await page.evaluate(() => {
        const metas = [...document.querySelectorAll<HTMLMetaElement>('meta[content]')].map(m => m.content).join('\n')
        const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent ?? '').join('\n')
        return [document.title, metas, ld, document.body.innerText, [...document.querySelectorAll('[alt],[aria-label],[title]')].map(e => `${e.getAttribute('alt') ?? ''} ${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''}`).join('\n')].join('\n')
      })
      const hits = CLAIMS.flatMap(([label, re]) => {
        const m = corpus.match(re)
        return m ? [`${label}: …${corpus.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + 40).replace(/\s+/g, ' ')}…`] : []
      })
      expect(hits, 'termos de claim encontrados').toEqual([])
    })
  }

  for (const p of PAGES) {
    test(`[AC-066] ${p.path}: âncoras internas existem, links internos respondem 200 e não há links externos`, async ({ page, request }) => {
      await page.goto(p.path)
      const links = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map(a => ({ href: a.getAttribute('href')!, abs: a.href, text: (a.textContent ?? '').trim().slice(0, 40) })))
      expect(links.length).toBeGreaterThanOrEqual(2)
      const external = links.filter(l => !l.abs.startsWith(new URL(page.url()).origin))
      expect(external.map(l => l.href), 'links externos (devem ser intencionais)').toEqual([])
      const anchors = links.filter(l => l.href.startsWith('#') && l.href.length > 1)
      for (const l of anchors) {
        expect(await page.locator(`[id="${l.href.slice(1)}"]`).count(), `âncora ${l.href} sem destino`).toBe(1)
      }
      await checkInternal(request, links.filter(l => !l.href.startsWith('#')).map(l => l.abs))
    })
  }
})

async function checkInternal(request: APIRequestContext, urls: string[]) {
  for (const url of new Set(urls.map(u => u.split('#')[0]))) {
    expect((await request.get(url)).status(), url).toBe(200)
  }
}

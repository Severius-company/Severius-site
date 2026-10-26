import { expect, test, type Page } from '@playwright/test'

type Lang = 'en' | 'pt'
const PREFIX: Record<Lang, string> = { en: '', pt: '/pt-br' }
const HTML_LANG: Record<Lang, string> = { en: 'en-GB', pt: 'pt-BR' }

const ROUTES: { path: string; h1: Record<Lang, string> }[] = [
  { path: '/', h1: { en: 'Technology that untangles complex operations.', pt: 'Tecnologia que desenrola operações complexas.' } },
  { path: '/services', h1: { en: 'Our Services', pt: 'Nossos serviços' } },
  { path: '/work', h1: { en: 'Our Works', pt: 'Nossos projetos' } },
  { path: '/work/chic-boutique', h1: { en: 'Chic Boutique', pt: 'Chic Boutique' } },
  { path: '/process', h1: { en: 'Process of Starting the Project', pt: 'Como começamos um projeto' } },
  { path: '/about', h1: { en: 'About Us', pt: 'Sobre nós' } },
  { path: '/contact', h1: { en: 'Contact Us', pt: 'Fale conosco' } },
]

const url = (lang: Lang, path: string) => (lang === 'en' ? path : `${PREFIX.pt}${path === '/' ? '' : path}`)

/** Coleta erros de console/página e requisições a outros hosts. */
function watch(page: Page) {
  const errors: string[] = []
  const external: string[] = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${new URL(r.url()).pathname}${new URL(r.url()).search}`) })
  page.on('request', r => {
    const u = new URL(r.url())
    if (!['http:', 'https:', 'ws:', 'wss:'].includes(u.protocol)) return
    if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') external.push(r.url())
  })
  return { errors, external }
}

const h1Text = (page: Page) => page.locator('h1').evaluate(el => el.textContent?.replace(/\s+/g, ' ').trim())

for (const lang of ['en', 'pt'] as const) {
  test.describe(`rotas ${lang}`, () => {
    for (const r of ROUTES) {
      test(`${url(lang, r.path)} 200, lang ${HTML_LANG[lang]}, h1, hreflang, sem erros nem hosts externos`, async ({ page }) => {
        const w = watch(page)
        const res = await page.goto(url(lang, r.path))
        expect(res?.status()).toBe(200)
        await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANG[lang])
        await expect(page.locator('h1')).toHaveCount(1)
        expect(await h1Text(page)).toBe(r.h1[lang])
        const base = r.path === '/' ? '' : r.path
        await expect(page.locator('link[rel="alternate"][hreflang="en-GB"]')).toHaveAttribute('href', new RegExp(`${r.path === '/' ? '/?' : base}$`))
        await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute('href', new RegExp(`/pt-br${base}$`))
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${url(lang, r.path) === '/' ? '/?' : url(lang, r.path)}$`))
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForLoadState('networkidle')
        expect(w.errors).toEqual([])
        expect(w.external).toEqual([])
      })
    }
  })
}

test('em /pt-br todo link interno tem o prefixo /pt-br', async ({ page }) => {
  for (const path of ['/pt-br', '/pt-br/work', '/pt-br/work/hungrybites', '/pt-br/contact']) {
    await page.goto(path)
    const hrefs = await page.locator('a[href^="/"]').evaluateAll(as => as.map(a => a.getAttribute('href') as string))
    const bad = hrefs.filter(h => !h.startsWith('/pt-br') && !['/'].includes(h) )
    // o único link sem prefixo permitido é o da bandeira inglesa (troca de idioma)
    const englishSwitch = await page.locator('a[hreflang="en-GB"]').evaluateAll(as => as.map(a => a.getAttribute('href')))
    expect(bad.filter(h => !englishSwitch.includes(h)), path).toEqual([])
    expect(hrefs.filter(h => h === '/' && !englishSwitch.includes('/')), path).toEqual([])
  }
})

test.describe('404 e careers em standby', () => {
  for (const [path, lang, h1] of [
    ['/careers', 'en-GB', 'Page not found'],
    ['/pt-br/careers', 'pt-BR', 'Página não encontrada'],
    ['/nao-existe', 'en-GB', 'Page not found'],
    ['/pt-br/nao-existe', 'pt-BR', 'Página não encontrada'],
    ['/work/nao-existe', 'en-GB', 'Page not found'],
    ['/pt-br/work/nao-existe', 'pt-BR', 'Página não encontrada'],
  ] as const) {
    test(`${path} responde 404 no idioma certo`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(404)
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
      await expect(page.getByRole('heading', { level: 1, name: h1 })).toBeVisible()
    })
  }

  test('/en/* redireciona para a URL sem prefixo', async ({ page }) => {
    await page.goto('/en/about')
    await expect(page).toHaveURL('/about')
  })

  test('Careers não aparece no header, footer, menu mobile nem sitemap', async ({ page, request }) => {
    for (const path of ['/', '/pt-br']) {
      await page.goto(path)
      await expect(page.locator('a[href$="/careers"]')).toHaveCount(0)
      await expect(page.getByRole('link', { name: /^(Careers|Carreiras)$/ })).toHaveCount(0)
    }
    const xml = await (await request.get('/sitemap.xml')).text()
    expect(xml).not.toContain('/careers')
    expect(xml).toContain('/pt-br/work/chic-boutique</loc>')
    expect(xml).toContain('hreflang="pt-BR"')
    expect(xml.match(/<url>/g)?.length).toBe(32)
  })
})

test('CtaBand some só em /contact', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { name: 'Thank you for your Interest in Severius.' })).toHaveCount(1)
  await page.goto('/pt-br/about')
  await expect(page.getByRole('heading', { name: 'Obrigado pelo seu interesse na Severius.' })).toHaveCount(1)
  await page.goto('/contact')
  await expect(page.locator('#cta-band-title')).toHaveCount(0)
})

test('navegação do header com link ativo (en)', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
  for (const [label, path, h1] of [['Services', '/services', 'Our Services'], ['Process', '/process', 'Process of Starting the Project'], ['Work', '/work', 'Our Works']]) {
    await nav.getByRole('link', { name: label }).click()
    await expect(page).toHaveURL(path)
    await expect(page.locator('h1')).toHaveText(h1)
    await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page')
  }
  await page.getByRole('link', { name: /HungryBites/ }).click()
  await expect(page).toHaveURL('/work/hungrybites')
  await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('link', { name: 'Next: EventMasters' }).click()
  await expect(page.locator('h1')).toHaveText('EventMasters')
  await page.getByRole('banner').getByRole('link', { name: 'Contact Us' }).click()
  await expect(page).toHaveURL('/contact')
})

test('navegação pt-BR preserva o locale (header, cards, Next, CTA, Contact)', async ({ page }) => {
  await page.goto('/pt-br')
  const nav = page.getByRole('navigation', { name: 'Principal' })
  await nav.getByRole('link', { name: 'Projetos' }).click()
  await expect(page).toHaveURL('/pt-br/work')
  await expect(nav.getByRole('link', { name: 'Projetos' })).toHaveAttribute('aria-current', 'page')
  await page.getByRole('link', { name: /HungryBites/ }).click()
  await expect(page).toHaveURL('/pt-br/work/hungrybites')
  await expect(page.getByText('mockup mobile · hungrybites')).toBeVisible()
  await page.getByRole('link', { name: 'Próximo: EventMasters' }).click()
  await expect(page).toHaveURL('/pt-br/work/eventmasters')
  await page.getByRole('link', { name: 'Todos os projetos' }).click()
  await expect(page).toHaveURL('/pt-br/work')
  await page.getByRole('main').getByRole('link', { name: 'Iniciar projeto' }).last().click()
  await expect(page).toHaveURL('/pt-br/contact')
  await page.getByRole('contentinfo').getByRole('link', { name: 'Sobre' }).click()
  await expect(page).toHaveURL('/pt-br/about')
  await page.getByRole('banner').getByRole('link', { name: 'Fale conosco' }).click()
  await expect(page).toHaveURL('/pt-br/contact')
  await page.getByRole('link', { name: 'Página inicial da Severius' }).first().click()
  await expect(page).toHaveURL('/pt-br')
})

test('seletor de idioma leva à mesma página e preserva ?tab=', async ({ page }) => {
  await page.goto('/process')
  const en = page.getByRole('banner').getByRole('link', { name: 'English (UK)' })
  const pt = page.getByRole('banner').getByRole('link', { name: 'Português (Brasil)' })
  await expect(en).toHaveAttribute('aria-current', 'true')
  await expect(pt).not.toHaveAttribute('aria-current', /.*/)
  await expect(pt).toHaveAttribute('hreflang', 'pt-BR')
  const box = await pt.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(40)
  expect(box!.height).toBeGreaterThanOrEqual(40)
  await pt.click()
  await expect(page).toHaveURL('/pt-br/process')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByRole('banner').getByRole('link', { name: 'Português (Brasil)' })).toHaveAttribute('aria-current', 'true')

  await page.goto('/services?tab=engineering')
  await expect(page.getByRole('tab', { name: 'Engineering' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('banner').getByRole('link', { name: 'Português (Brasil)' }).click()
  await expect(page).toHaveURL('/pt-br/services?tab=engineering')
  await expect(page.getByRole('tab', { name: 'Engenharia' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'Gestão de projetos' }).click()
  await page.getByRole('banner').getByRole('link', { name: 'English (UK)' }).click()
  await expect(page).toHaveURL('/services?tab=project-management')
  await expect(page.getByRole('tab', { name: 'Project Management' })).toHaveAttribute('aria-selected', 'true')

  await page.goto('/pt-br/work/wanderwise')
  await page.getByRole('banner').getByRole('link', { name: 'English (UK)' }).click()
  await expect(page).toHaveURL('/work/wanderwise')
  await expect(page.getByText('Personalisation')).toBeVisible()
})

test('filtros do Work', async ({ page }) => {
  await page.goto('/pt-br/work')
  const cards = page.locator('main ul > li a[href^="/pt-br/work/"]')
  await expect(cards).toHaveCount(10)
  await page.getByRole('button', { name: 'Mobile' }).click()
  await expect(page.getByRole('button', { name: 'Mobile' })).toHaveAttribute('aria-pressed', 'true')
  await expect(cards).toHaveCount(3)
  await page.getByRole('button', { name: 'Web' }).click()
  await expect(cards).toHaveCount(4)
  await page.getByRole('button', { name: 'Todos' }).click()
  await expect(cards).toHaveCount(10)
})

test('abas de Services (inclusive via Learn More da home)', async ({ page }) => {
  await page.goto('/services')
  await expect(page.getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'Engineering' }).click()
  await expect(page.getByText('Web Development')).toBeVisible()
  await page.goto('/')
  await page.getByRole('link', { name: 'Learn More about Project Management' }).click()
  await expect(page).toHaveURL('/services?tab=project-management')
  await expect(page.getByRole('tab', { name: 'Project Management' })).toHaveAttribute('aria-selected', 'true')
  await page.goto('/pt-br')
  await page.getByRole('link', { name: 'Saiba mais sobre Engenharia' }).click()
  await expect(page).toHaveURL('/pt-br/services?tab=engineering')
  await expect(page.getByText('Desenvolvimento web')).toBeVisible()
})

test('FAQ acordeão: um aberto por vez', async ({ page }) => {
  await page.goto('/contact')
  const q1 = page.getByRole('button', { name: /What services does Severius provide\?/ })
  const q2 = page.getByRole('button', { name: /How can Severius help my business\?/ })
  await expect(q1).toHaveAttribute('aria-expanded', 'true')
  await q2.click()
  await expect(q2).toHaveAttribute('aria-expanded', 'true')
  await expect(q1).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Severius offers a range of services')).toBeHidden()
  await q2.click()
  await expect(q2).toHaveAttribute('aria-expanded', 'false')
})

for (const [lang, t] of [
  ['en', { path: '/contact', name: 'Full Name', email: 'Email', send: 'Send Message', errName: 'Please add your name.', errEmail: 'Please enter a valid email address.', eng: 'Engineering', under: 'Under $5k', mid: '$15k – $50k', ok: 'Message received', sent: 'Thanks, Ana. A producer from our team will reply to ana@example.com within one business day.', again: 'Send another' }],
  ['pt', { path: '/pt-br/contact', name: 'Nome completo', email: 'E-mail', send: 'Enviar mensagem', errName: 'Informe seu nome.', errEmail: 'Informe um e-mail válido.', eng: 'Engenharia', under: 'Até $5k', mid: '$15k – $50k', ok: 'Mensagem recebida', sent: 'Obrigado, Ana! Alguém do nosso time vai responder para ana@example.com em até um dia útil.', again: 'Enviar outra' }],
] as const) {
  test(`Contact (${lang}): validação e sucesso`, async ({ page }) => {
    await page.goto(t.path)
    const alert = page.locator('#contact-error[role="alert"]')
    const send = page.getByRole('button', { name: t.send })
    await send.click()
    await expect(alert).toHaveText(t.errName)
    await expect(page.getByLabel(t.name)).toBeFocused()
    await page.getByLabel(t.name).fill('Ana Souza')
    await page.getByRole('textbox', { name: new RegExp(`^${t.email}`) }).fill('ana@invalid')
    await send.click()
    await expect(alert).toHaveText(t.errEmail)
    await expect(page.getByRole('textbox', { name: new RegExp(`^${t.email}`) })).toHaveAttribute('aria-invalid', 'true')
    await page.getByRole('textbox', { name: new RegExp(`^${t.email}`) }).fill('ana@example.com')
    await page.getByRole('button', { name: t.eng }).click()
    await expect(page.getByRole('button', { name: t.eng })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: t.under }).click()
    await expect(page.getByRole('button', { name: t.mid })).toHaveAttribute('aria-pressed', 'false')
    await send.click()
    await expect(page.getByRole('heading', { name: t.ok })).toBeVisible()
    await expect(page.getByText(t.sent)).toBeVisible()
    await page.getByRole('button', { name: t.again }).click()
    await expect(page.getByLabel(t.name)).toHaveValue('')
  })
}

test.describe('mobile 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const lang of ['en', 'pt'] as const) {
    test(`sem overflow horizontal e header íntegro (${lang})`, async ({ page }) => {
      for (const r of ROUTES) {
        await page.goto(url(lang, r.path))
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, r.path).toBe(0)
        const header = await page.getByRole('banner').boundingBox()
        expect(header!.height, r.path).toBeLessThanOrEqual(74)
      }
    })
  }

  test('menu hambúrguer com seletor de idioma', async ({ page }) => {
    await page.goto('/pt-br/about')
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeHidden()
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    const menu = page.getByRole('navigation', { name: 'Navegação mobile' })
    await expect(menu).toBeVisible()
    const box = await page.locator('#mobile-menu').boundingBox()
    expect(box?.width).toBe(390)
    await expect(menu.getByRole('link', { name: 'Português (Brasil)' })).toHaveAttribute('aria-current', 'true')
    await menu.getByRole('link', { name: 'English (UK)' }).click()
    await expect(page).toHaveURL('/about')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB')
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Process' }).click()
    await expect(page).toHaveURL('/process')
    await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden()
  })
})

test('header não quebra em 1440 nos dois idiomas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const path of ['/', '/pt-br']) {
    await page.goto(path)
    const header = await page.getByRole('banner').boundingBox()
    expect(header!.height).toBeLessThanOrEqual(74)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Português (Brasil)' })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBe(0)
  }
})

test.describe('fade-in ao rolar', () => {
  test('elemento abaixo da dobra começa com opacity 0 e fica 1 após rolar', async ({ page }) => {
    await page.goto('/pt-br')
    const target = page.locator('#quotes-title')
    await expect(target).toHaveAttribute('data-reveal', 'hidden')
    expect(await target.evaluate(el => getComputedStyle(el).opacity)).toBe('0')
    await target.scrollIntoViewIfNeeded()
    await expect(target).toHaveAttribute('data-reveal', 'shown')
    await expect.poll(() => target.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  })

  test('conteúdo vem visível no HTML do servidor (sem JS)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/')
    const target = page.locator('#quotes-title')
    await expect(target).not.toHaveAttribute('data-reveal', /.*/)
    expect(await target.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
    await ctx.close()
  })

  test('com reduced motion tudo fica visível', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(await page.locator('#quotes-title').evaluate(el => getComputedStyle(el).opacity)).toBe('1')
    expect(await page.locator('[data-reveal="hidden"]').count()).toBe(0)
    await ctx.close()
  })
})

test('headers de segurança presentes', async ({ request }) => {
  const res = await request.get('/pt-br')
  const csp = res.headers()['content-security-policy']
  expect(csp).toContain("default-src 'self'")
  expect(csp).toContain("font-src 'self'")
  expect(res.headers()['x-frame-options']).toBe('DENY')
})

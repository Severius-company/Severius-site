import { expect, test } from '@playwright/test'
import { ARTICLE, HOME, HTML_LANG, LOCALES, openPage, type Locale } from './helpers'

test.describe('Rotas, idioma e estados de rota', () => {
  for (const locale of LOCALES) {
    test(`[AC-020][AC-050] ${HOME[locale]} responde 200, lang ${HTML_LANG[locale]}, h1 único e main único`, async ({ page }) => {
      const response = await openPage(page, HOME[locale])
      expect(response?.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANG[locale])
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('main')).toHaveCount(1)
    })

    test(`[AC-020][AC-065] artigo ${locale} responde 200, lang correto, h1 único e sem script no conteúdo MDX`, async ({ page }) => {
      const response = await openPage(page, ARTICLE[locale])
      expect(response?.status()).toBe(200)
      await expect(page.locator('html')).toHaveAttribute('lang', HTML_LANG[locale])
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('main')).toHaveCount(1)
      await expect(page.locator('main script')).toHaveCount(0)
    })
  }

  test('[AC-020] "/" redireciona para /pt-br sem loop', async ({ page, request }) => {
    const raw = await request.get('/', { maxRedirects: 0 })
    expect([301, 302, 307, 308]).toContain(raw.status())
    expect(new URL(raw.headers().location, 'http://x').pathname).toBe('/pt-br')

    const hops: string[] = []
    page.on('response', r => { if (r.status() >= 300 && r.status() < 400) hops.push(`${r.status()} ${r.url()}`) })
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    expect(new URL(page.url()).pathname).toBe('/pt-br')
    expect(hops).toHaveLength(1)
  })

  for (const path of ['/xx', '/pt-br/nada', '/en/nada']) {
    test(`[AC-092] ${path} devolve status 404 com estado de erro legível`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(404)
      const heading = page.getByRole('heading', { level: 1 })
      await expect(heading).toBeVisible()
      const message = ((await page.locator('body').innerText()) ?? '').trim()
      expect(message.length).toBeGreaterThan(10)
      expect(message).toMatch(/n[aã]o foi encontrada|could not be found|not found/i)
    })
  }

  // O 404 raiz não conhece o idioma da URL: é aceito 404 bilíngue (plano AC-092), desde que tenha html[lang],
  // mensagem nos dois idiomas e link de retorno para as duas homes.
  for (const path of ['/pt-br/nada', '/en/nada', '/xx']) {
    test(`[AC-092] ${path}: 404 coerente e bilíngue, com html[lang], mensagem PT/EN e link de retorno às homes`, async ({ page }) => {
      await page.goto(path)
      expect(await page.locator('html').getAttribute('lang')).toMatch(/^(pt-BR|en)$/)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const text = await page.locator('body').innerText()
      expect(text).toMatch(/n[aã]o foi encontrada/i)
      expect(text).toMatch(/could not be found/i)
      await expect(page.locator('a[href="/pt-br"]').first()).toBeVisible()
      await expect(page.locator('a[href="/en"]').first()).toBeVisible()
    })
  }

  test('[AC-022] seletor de idioma: nome acessível, hreflang, navega PT→EN e o histórico volta', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    const link = page.locator('a.language')
    await expect(link).toHaveAttribute('href', '/en')
    await expect(link).toHaveAttribute('hreflang', 'en')
    expect((await link.getAttribute('aria-label'))?.length ?? 0).toBeGreaterThan(2)
    await link.click()
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await page.goBack()
    await expect(page).toHaveURL(/\/pt-br$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
    await page.goForward()
    await expect(page).toHaveURL(/\/en$/)
  })

  for (const locale of LOCALES) {
    const other: Locale = locale === 'pt-br' ? 'en' : 'pt-br'
    test(`[AC-022] artigo ${locale}: oferece link para o artigo equivalente em ${other}`, async ({ page }) => {
      await openPage(page, ARTICLE[locale])
      await expect(page.locator(`a[href="${ARTICLE[other]}"]`).first()).toBeVisible()
    })
  }

  test('[AC-023] âncoras da navegação levam ao destino e voltar/avançar funcionam', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    for (const id of ['como-ajudamos', 'capacidades', 'processo', 'insights']) {
      await page.locator(`nav.desktop-nav a[href="#${id}"]`).click()
      await expect(page).toHaveURL(new RegExp(`#${id}$`))
      await expect(page.locator(`#${id}`)).toBeInViewport({ ratio: 0.05 })
    }
    await page.goBack()
    await expect(page).toHaveURL(/#processo$/)
    await page.goForward()
    await expect(page).toHaveURL(/#insights$/)
  })

  test('[AC-011][AC-012] home pt-br: CTA primário, seções, 16 capacidades em 4 grupos', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await expect(page.locator('.hero-actions a.button')).toHaveText('Solicitar diagnóstico')
    for (const id of ['inicio', 'como-ajudamos', 'capacidades', 'processo', 'labs', 'insights', 'diagnostico']) {
      await expect(page.locator(`main #${id}`)).toHaveCount(1)
    }
    await expect(page.locator('header.site-header nav')).toHaveCount(1)
    await expect(page.locator('footer.site-footer')).toHaveCount(1)
    await expect(page.locator('.capability-group')).toHaveCount(4)
    await expect(page.locator('.capability-group li')).toHaveCount(16)
  })

  test('[AC-013] método na ordem Mapear, Desenhar, Construir, Evoluir (e equivalente em EN)', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await expect(page.locator('.process-line li h3')).toHaveText(['Mapear', 'Desenhar', 'Construir', 'Evoluir'])
    await openPage(page, HOME.en)
    await expect(page.locator('.process-line li h3')).toHaveText(['Map', 'Design', 'Build', 'Evolve'])
  })

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false })
    for (const locale of LOCALES) {
      test(`[AC-024] ${HOME[locale]} mantém promessa, capacidades e CTA com JS desativado`, async ({ page }) => {
        await page.goto(HOME[locale])
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('.hero-actions a.button')).toBeVisible()
        await expect(page.locator('.hero-actions a.button')).toHaveAttribute('href', '#diagnostico')
        await expect(page.locator('.capability-group li')).toHaveCount(16)
        await expect(page.locator('.process-line li')).toHaveCount(4)
        await expect(page.locator('.signal-svg')).toBeVisible()
      })
    }
  })
})

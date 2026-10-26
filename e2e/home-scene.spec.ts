import { expect, test } from '@playwright/test'

test.describe('experiência Severius', () => {
  test('hero usa arte gerada em código e a corda cinética é decorativa', async ({ page }) => {
    await page.goto('/pt-br')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tecnologia que desenrola operações complexas.')
    await expect(page.locator('.flow-console')).toBeVisible()
    await expect(page.locator('.kinetic-rope')).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('main video, main img')).toHaveCount(0)
  })

  test('submenu de serviços abre por hover e expõe as quatro capacidades', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Services' })
    await trigger.hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('#services-mega-menu a')).toHaveCount(4)
    await page.locator('#services-mega-menu a').first().hover()
    await expect(page.locator('#services-mega-menu')).toBeVisible()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work', exact: true }).hover()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await trigger.focus()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
  })

  test('pipeline demonstra mudança de etapa com mouse ou teclado', async ({ page }) => {
    await page.goto('/pt-br')
    await page.getByRole('button', { name: 'Mover Portal Atlas para Em descoberta' }).click()
    await expect(page.locator('#pipeline-column-0')).toContainText('1')
    await expect(page.locator('#pipeline-column-1')).toContainText('2')
    await expect(page.getByText('Demonstração interativa — dados e oportunidades são fictícios.')).toBeVisible()
  })

  test('projetos são identificados como referências demonstrativas', async ({ page }) => {
    await page.goto('/pt-br')
    await expect(page.getByText(/Não representam clientes ou resultados comerciais da Severius/)).toBeVisible()
  })

  test('mobile mantém reflow, menu e cards de método em fluxo', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/pt-br')
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(page.locator('#mobile-menu')).toBeVisible()
    expect(await page.locator('.method-cards li').first().evaluate(element => getComputedStyle(element).position)).toBe('relative')
  })

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })
    test('remove movimentos contínuos e deixa o método em fluxo', async ({ page }) => {
      await page.goto('/')
      expect(await page.locator('.flow-orbit').first().evaluate(element => getComputedStyle(element).animationName)).toBe('none')
      expect(await page.locator('.flow-console').evaluate(element => getComputedStyle(element).transform)).toBe('none')
      expect(await page.locator('.method-sticky').evaluate(element => getComputedStyle(element).position)).toBe('relative')
      expect(await page.locator('header .severius-logo-mark svg').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
    })
  })

  test('sem JavaScript mantém conteúdo e CTAs no HTML', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', '/contact')
    await expect(page.locator('.rope-service-card')).toHaveCount(4)
    await context.close()
  })

  test('CTA final da ScrollStory preserva idioma e destino', async ({ page }) => {
    await page.goto('/pt-br')
    await expect(page.locator('.story-cta')).toHaveAttribute('href', '/pt-br/contact')
    await expect(page.locator('.story-cta')).toHaveText('Iniciar projeto')
  })

  test('marquee é contínuo mesmo em telas ultrawide', async ({ page }) => {
    await page.setViewportSize({ width: 2920, height: 900 })
    await page.goto('/pt-br')
    const groups = page.locator('.flow-marquee-group')
    await expect(groups).toHaveCount(2)
    const widths = await groups.evaluateAll(elements => elements.map(element => element.getBoundingClientRect().width))
    expect(widths[0]).toBeGreaterThanOrEqual(2920)
    expect(Math.abs(widths[0] - widths[1])).toBeLessThan(1)
    expect(await page.locator('.flow-marquee-track').evaluate(element => getComputedStyle(element).animationName)).toBe('flow-marquee')
  })

  test('âncora rola suavemente, header compacta e manifesto acompanha o scroll', async ({ page }) => {
    await page.goto('/pt-br')
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('smooth')
    await page.getByRole('link', { name: 'Explorar capacidades' }).click()
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeGreaterThan(400)
    await expect(page.getByRole('banner')).toHaveAttribute('data-compact', '')

    const manifesto = page.locator('#manifesto-flow')
    await manifesto.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8))
    await expect.poll(async () => Number(await manifesto.evaluate(element => getComputedStyle(element).getPropertyValue('--manifesto-progress'))), { timeout: 5000 }).toBeGreaterThan(0)
  })

  test('logo vetorial e formulário de projeto aparecem na home', async ({ page }) => {
    await page.goto('/pt-br')
    const logo = page.locator('header .severius-logo-mark')
    await expect(logo.locator('svg')).toBeVisible()
    await expect(logo.locator('path')).toHaveCount(6)
    await expect(logo.locator('path').first()).toHaveAttribute('stroke', '#9EFF00')
    expect(await logo.locator('path').first().evaluate(element => getComputedStyle(element).animationName)).toBe('severius-logo-draw')
    const band = page.locator('.cta-form-band')
    await band.scrollIntoViewIfNeeded()
    await expect(band.getByRole('textbox', { name: /^Nome completo/ })).toBeVisible()
    await expect(band.getByRole('button', { name: 'Enviar mensagem' })).toBeVisible()
  })
})

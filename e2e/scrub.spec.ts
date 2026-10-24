import { expect, test, type Page } from '@playwright/test'
import { HOME, LOCALES, openPage, hasWebGL, trackScripts } from './helpers'

/** Comprimento do pin do hero (mesma regra de src/components/Signal.tsx: 2,6 viewports no desktop, 1,8 no modo leve). */
const pinLength = (page: Page, short: boolean) => page.evaluate(short => Math.round(window.innerHeight * (short ? 1.8 : 2.6)), short)

const heroState = (page: Page) => page.evaluate(() => {
  const opacity = (selector: string) => Number(getComputedStyle(document.querySelector(selector)!).opacity)
  const cta = document.querySelector('.hero-actions a.button')!.getBoundingClientRect()
  return {
    y: Math.round(scrollY),
    phase: document.querySelector('.signal')!.getAttribute('data-phase'),
    h1: opacity('.hero h1'), payoff: opacity('.hero-payoff'),
    ctaVisible: cta.top >= 0 && cta.bottom <= innerHeight && cta.width > 0,
    bodyPosition: getComputedStyle(document.body).position,
    progress: Math.round((document.querySelector('.hero-progress span')!.getBoundingClientRect().width / document.querySelector('.hero-progress')!.getBoundingClientRect().width) * 100),
  }
})

test.describe('Hero pinado — a rolagem nativa conduz o Signal', () => {
  for (const locale of LOCALES) {
    test(`[AC-031][AC-035][AC-036] ${HOME[locale]}: as 4 fases avançam com a rolagem, o CTA fica visível e o body nunca é travado`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await openPage(page, HOME[locale])
      test.skip(!(await hasWebGL(page)), 'sem WebGL: modo full inatingível')
      await expect(page.locator('#inicio')).toHaveAttribute('data-scrub', 'on', { timeout: 15000 })
      const length = await pinLength(page, false)

      const start = await heroState(page)
      expect(start.phase).toBe('0')
      expect(start.h1).toBe(1)
      expect(start.payoff, 'a frase final só aparece no fim').toBe(0)
      expect(start.ctaVisible, 'CTA acima da dobra ao carregar').toBe(true)

      const seen: string[] = []
      for (const fraction of [0.3, 0.55, 0.8, 1]) {
        await page.evaluate(y => window.scrollTo(0, y), Math.round(length * fraction))
        await page.waitForTimeout(1500) // scrub: 0.6 s de suavização
        const state = await heroState(page)
        seen.push(state.phase ?? '?')
        expect(state.bodyPosition, 'o body nunca é travado (sem position:fixed)').not.toBe('fixed')
        expect(state.ctaVisible, `CTA visível em ${fraction * 100}%`).toBe(true)
        if (fraction === 0.55) expect(state.h1, 'o título já saiu de foco no meio').toBeLessThan(0.1)
        if (fraction === 1) { expect(state.payoff, 'frase final revelada').toBeGreaterThan(0.95); expect(state.progress).toBeGreaterThan(95) }
      }
      expect(seen, 'fases em ordem crescente').toEqual(['1', '2', '3', '3'])
    })
  }

  test('[AC-034][AC-035] o teclado rola o hero nativamente e a página segue depois do pin', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openPage(page, HOME['pt-br'])
    test.skip(!(await hasWebGL(page)), 'sem WebGL: modo full inatingível')
    await expect(page.locator('#inicio')).toHaveAttribute('data-scrub', 'on', { timeout: 15000 })
    await page.locator('body').click({ position: { x: 700, y: 450 } })
    const before = await page.evaluate(() => scrollY)
    await page.keyboard.press('PageDown')
    await page.waitForTimeout(900)
    expect(await page.evaluate(() => scrollY), 'PageDown rola a página').toBeGreaterThan(before)
    // Depois do pin, a próxima seção chega ao topo (o hero solta a página).
    const length = await pinLength(page, false)
    await page.evaluate(y => window.scrollTo(0, y), length + 900)
    await page.waitForTimeout(1200)
    const next = await page.evaluate(() => document.querySelector('#como-ajudamos')!.getBoundingClientRect().top)
    expect(next, 'a seção seguinte já está na tela').toBeLessThan(900)
  })

  test('[AC-032][AC-054] sem espaço no viewport (paisagem curta) o hero não é pinado e nada é cortado', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 })
    await openPage(page, HOME['pt-br'])
    await page.waitForTimeout(2500)
    await expect(page.locator('#inicio')).not.toHaveAttribute('data-scrub', 'on')
    const clipped = await page.evaluate(() => { const h = document.getElementById('inicio')!; const a = document.querySelector('.hero-actions')!.getBoundingClientRect(); return { fits: a.bottom <= h.getBoundingClientRect().bottom, pinned: !!h.closest('.pin-spacer') } })
    expect(clipped.pinned).toBe(false)
    expect(clipped.fits, 'o CTA continua dentro do hero (não é cortado pelo overflow)').toBe(true)
  })
})

test.describe('Capacidades — movimento de entrada', () => {
  test('[AC-034] ao rolar até a seção, todos os grupos e itens ficam revelados e legíveis', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await openPage(page, HOME['pt-br'])
    await page.waitForTimeout(1500)
    await page.locator('#capacidades').scrollIntoViewIfNeeded()
    await page.evaluate(() => document.querySelector('#capacidades .contextual-link')!.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await page.waitForTimeout(3000)
    const revealed = await page.evaluate(() => [...document.querySelectorAll('#capacidades h3, #capacidades li, #capacidades header p, .contextual-link')].every(el => Number(getComputedStyle(el).opacity) === 1))
    expect(revealed, 'nenhum item da seção ficou oculto depois da entrada').toBe(true)
    expect(await page.evaluate(() => document.querySelectorAll('#capacidades .connection-mark.is-live').length), 'os 4 marcadores acenderam').toBe(4)
  })

  test('[AC-036] com movimento reduzido: conteúdo visível sem rolar, sem GSAP e sem animação', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    const scripts = trackScripts(page)
    await openPage(page, HOME['pt-br'])
    await page.waitForTimeout(1500)
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll('#capacidades h3, #capacidades li')].filter(el => Number(getComputedStyle(el).opacity) !== 1).length,
      live: document.querySelectorAll('.connection-mark.is-live').length,
      pinned: !!document.getElementById('inicio')!.closest('.pin-spacer'),
    }))
    expect(state).toEqual({ hidden: 0, live: 0, pinned: false })
    expect((await scripts.result()).filter(s => s.gsap), 'GSAP não é carregado').toHaveLength(0)
    await context.close()
  })
})

import { expect, test, type Page } from '@playwright/test'
import { HOME, LOCALES, hasWebGL, openPage, signalMode, trackScripts, waitHydrated } from './helpers'

/** Falha total de WebGL: getContext('webgl'|'webgl2'|'experimental-webgl') passa a devolver null. */
const noWebGL = () => {
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (/webgl/i.test(type)) return null
    return (original as (...args: unknown[]) => unknown).call(this, type, ...rest)
  } as typeof HTMLCanvasElement.prototype.getContext
}

/** WebGL "existe" na detecção (canvas fora do DOM), mas falha ao criar o renderer do canvas já montado. */
const webglFailsOnMountedCanvas = () => {
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    if (/webgl/i.test(type) && this.isConnected) return null
    return (original as (...args: unknown[]) => unknown).call(this, type, ...rest)
  } as typeof HTMLCanvasElement.prototype.getContext
}

async function expectUsable(page: Page) {
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('.state-page')).toHaveCount(0)
  await expect(page.locator('.signal-svg')).toBeVisible()
  await expect(page.locator('.hero-actions a.button')).toBeVisible()
  await page.locator('.hero-actions a.button').click()
  await expect(page).toHaveURL(/#diagnostico$/)
  await expect(page.locator('form.diagnostic-form')).toBeVisible()
  await expect(page.locator('#name')).toBeVisible()
}

/** Geometria do hero: o Signal é o fundo em tela cheia; o texto e o CTA ficam por cima, e a legenda de fases não colide com o h1. */
async function heroLayout(page: Page) {
  return page.evaluate(() => {
    const rect = (selector: string) => { const r = document.querySelector(selector)!.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom } }
    const signal = document.querySelector('.signal')!
    document.querySelector('.hero-actions a.button')!.scrollIntoView({ block: 'center', behavior: 'instant' })
    const cta = document.querySelector('.hero-actions a.button')!.getBoundingClientRect()
    const top = document.elementFromPoint(cta.x + cta.width / 2, cta.y + cta.height / 2)
    const h1Box = document.querySelector('.hero h1')!.getBoundingClientRect()
    const h1Top = document.elementFromPoint(h1Box.x + 8, h1Box.y + h1Box.height / 2)
    const h1 = rect('.hero h1')
    const states = rect('.signal-states')
    const overlap = !(h1.right <= states.x || states.x + states.w <= h1.x || h1.bottom <= states.y || states.y + states.h <= h1.y)
    return {
      signalPosition: getComputedStyle(signal).position,
      signalClass: signal.className,
      signal: rect('.signal'),
      h1,
      states,
      h1OverlapsSignalStates: overlap,
      ctaTopmostIsCta: !!top && !!top.closest('.hero-actions'),
      h1TopmostIsH1: !!h1Top && !!h1Top.closest('h1'),
      hero: rect('#inicio'),
      ctaInViewport: cta.bottom <= window.innerHeight && cta.top >= 0,
    }
  })
}

test.describe('Signal — modos e degradação', () => {
  for (const [label, use] of [['modo full (WebGL)', {}], ['modo static (reduced motion) — controle', { reducedMotion: 'reduce' as const }]] as const) {
    test.describe(label, () => {
      test.use(use)
      test(`[AC-031][AC-033][AC-073] desktop 1440×900, ${label}: o Signal é o fundo do hero e não cobre o h1 nem o CTA`, async ({ page }) => {
        await openPage(page, HOME['pt-br'])
        await page.waitForTimeout(800)
        if (label.startsWith('modo full')) test.skip(!(await hasWebGL(page)), 'sem WebGL: modo full inatingível')
        const layout = await heroLayout(page)
        expect(layout.signalPosition, `.signal class="${layout.signalClass}"`).toBe('absolute')
        expect(Math.abs(layout.signal.w - layout.hero.w), 'o Signal ocupa a largura do hero (sem deslocar layout)').toBeLessThan(2)
        expect(layout.h1TopmostIsH1, 'h1 coberto pelo Signal').toBe(true)
        expect(layout.h1OverlapsSignalStates, 'h1 sobrepõe a legenda de fases').toBe(false)
        expect(layout.ctaTopmostIsCta, 'CTA do hero coberto por outro elemento').toBe(true)
      })
    })
  }

  test('[AC-033][AC-070] desktop sem reduced motion: modo full quando há WebGL (senão registra o observado); Three/GSAP só carregam depois', async ({ page }, testInfo) => {
    const scripts = trackScripts(page)
    await openPage(page, HOME['pt-br'])
    const webgl = await hasWebGL(page)
    const mode = await signalMode(page)
    testInfo.annotations.push({ type: 'observado', description: `webgl=${webgl} data-mode=${mode}` })
    if (webgl) {
      expect(mode).toBe('full')
      await expect(page.locator('.signal-layer canvas')).toBeVisible()
      await expect(page.locator('.signal')).toHaveAttribute('data-phase', '0')
      const loaded = await scripts.result()
      expect(loaded.some(s => s.three), 'chunk three/R3F carregado no modo full (valida o detector)').toBe(true)
      expect(loaded.some(s => s.gsap), 'chunk GSAP carregado no modo full (valida o detector)').toBe(true)
    } else {
      expect(mode).toBe('static')
    }
    // O conteúdo crítico existe independentemente da cena.
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.signal-states li')).toHaveCount(4)
  })

  test.describe('prefers-reduced-motion: reduce', () => {
    test.use({ reducedMotion: 'reduce' })
    for (const locale of LOCALES) {
      test(`[AC-036][AC-037] ${HOME[locale]}: data-mode="static", sem data-phase, sem canvas e SEM requisitar three/gsap`, async ({ page }) => {
        const scripts = trackScripts(page)
        await openPage(page, HOME[locale])
        await page.waitForTimeout(1200)
        await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'static')
        await expect(page.locator('.signal')).not.toHaveAttribute('data-phase', /.*/)
        await expect(page.locator('canvas')).toHaveCount(0)
        await expect(page.locator('.signal-svg')).toBeVisible()
        await expect(page.locator('.signal-states li')).toHaveCount(4) // informação preservada
        const loaded = await scripts.result()
        expect(loaded.length).toBeGreaterThan(3) // detector viu scripts (evita falso negativo)
        expect(loaded.filter(s => s.three).map(s => s.url), 'chunks com three/R3F').toEqual([])
        expect(loaded.filter(s => s.gsap).map(s => s.url), 'chunks com gsap').toEqual([])
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
      })
    }
    test('[AC-036][AC-034] com reduce a página segue utilizável (CTA → formulário)', async ({ page }) => {
      await openPage(page, HOME['pt-br'])
      await expectUsable(page)
    })
  })

  test('[AC-036] ativar reduce durante a sessão derruba o modo full para static e remove o canvas', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    test.skip(!(await hasWebGL(page)), 'sem WebGL neste ambiente: modo full inatingível')
    await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'full')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'static')
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test.describe('mobile 390×844', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    for (const locale of LOCALES) {
      test(`[AC-033][AC-037] ${HOME[locale]}: data-mode="lite", sem canvas e sem three/R3F`, async ({ page }) => {
        const scripts = trackScripts(page)
        await openPage(page, HOME[locale])
        await page.waitForTimeout(800)
        await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'lite')
        await expect(page.locator('.signal')).toHaveAttribute('data-phase', /^[0-3]$/)
        await expect(page.locator('canvas')).toHaveCount(0)
        await expect(page.locator('.signal-svg')).toBeVisible()
        const loaded = await scripts.result()
        expect(loaded.filter(s => s.three).map(s => s.url), 'chunks com three/R3F no modo lite').toEqual([])
      })
    }
  })

  test.describe('WebGL indisponível (getContext → null)', () => {
    for (const locale of LOCALES) {
      test(`[AC-034][AC-093] ${HOME[locale]}: cai para static, sem three, sem erro de página, página utilizável`, async ({ page }) => {
        const errors: string[] = []
        page.on('pageerror', e => errors.push(e.message))
        await page.addInitScript(noWebGL)
        const scripts = trackScripts(page)
        await openPage(page, HOME[locale])
        await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'static')
        await expect(page.locator('canvas')).toHaveCount(0)
        expect((await scripts.result()).filter(s => s.three).map(s => s.url)).toEqual([])
        await expectUsable(page)
        expect(errors, 'pageerror').toEqual([])
      })
    }

    test('[AC-034][AC-093] em 390px, sem WebGL, também é static (não lite)', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.addInitScript(noWebGL)
      await openPage(page, HOME['pt-br'])
      await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'static')
    })
  })

  test('[AC-093] WebGL detectado mas o contexto do canvas falha: degrada para static sem derrubar a página', async ({ page }) => {
    const hasGl = await (async () => { await page.goto(HOME['pt-br']); return hasWebGL(page) })()
    test.skip(!hasGl, 'sem WebGL neste ambiente: cenário inatingível')
    await page.addInitScript(webglFailsOnMountedCanvas)
    await openPage(page, HOME['pt-br'])
    await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'static', { timeout: 15_000 })
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('.signal-fallback[role="status"]')).toBeVisible()
    await expectUsable(page)
  })

  test('[AC-093] falha de carregamento do chunk da cena (three/R3F abortado): degrada para static sem estado de erro da página', async ({ page }) => {
    await page.route('**/_next/static/chunks/*.js', async route => {
      const response = await route.fetch()
      const body = await response.text()
      if (/THREE\.WebGLRenderer/.test(body)) return route.abort('failed')
      return route.fulfill({ response, body })
    })
    await openPage(page, HOME['pt-br'])
    test.skip(!(await hasWebGL(page)), 'sem WebGL neste ambiente: cenário inatingível')
    await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'static', { timeout: 15_000 })
    await expect(page.locator('.signal-fallback[role="status"]')).toBeVisible()
    await expectUsable(page)
  })

  test('[AC-035] usar o hero durante a cena não prende histórico: voltar/avançar depois de âncora', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.locator('.hero-actions a.button').click()
    await expect(page).toHaveURL(/#diagnostico$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/pt-br$/)
    await waitHydrated(page)
    await expect(page.locator('h1')).toBeVisible()
  })
})

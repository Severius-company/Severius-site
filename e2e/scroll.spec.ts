import { expect, test, type Page } from '@playwright/test'
import { HOME, hasWebGL, openPage } from './helpers'

type ListenerLog = { type: string; target: string; passive: boolean | undefined; origin?: string }

/** Registra listeners de wheel/touch em alvos "raiz" (window/document/html/body): onde scroll-jacking se instala. */
const recordScrollListeners = () => {
  const log: ListenerLog[] = []
  ;(window as unknown as { __scrollListeners: ListenerLog[] }).__scrollListeners = log
  const original = EventTarget.prototype.addEventListener
  EventTarget.prototype.addEventListener = function (this: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
    if (['wheel', 'mousewheel', 'DOMMouseScroll', 'touchstart', 'touchmove'].includes(type)) {
      const name = this === window ? 'window' : this === document ? 'document' : this === document.documentElement ? 'html' : this === document.body ? 'body' : 'element'
      const passiveOption = typeof options === 'object' && options ? options.passive : undefined
      const origin = (new Error().stack ?? '').split('\n').slice(2, 4).map(l => l.trim().replace(/^at /, '').slice(0, 90)).join(' <- ')
      log.push({ type, target: name, passive: passiveOption, origin })
    }
    return original.call(this, type, listener, options)
  } as typeof EventTarget.prototype.addEventListener
}

const phase = (page: Page) => page.locator('.signal').getAttribute('data-phase')

async function wheelUntilPhase3(page: Page, step = 60, maxSteps = 120) {
  const size = page.viewportSize()!
  await page.mouse.move(size.width / 2, size.height / 2)
  const seen: string[] = [(await phase(page)) ?? 'none']
  for (let i = 0; i < maxSteps; i++) {
    await page.mouse.wheel(0, step)
    await page.waitForTimeout(60)
    seen.push((await phase(page)) ?? 'none')
    if (seen.at(-1) === '3') break
  }
  return [...new Set(seen)]
}

test.describe('Scroll nativo e progresso do hero', () => {
  test('[AC-035] sem scroll-jacking: wheel move window.scrollY, html/body não travam e não há listeners de wheel/touch não-passivos nas raízes', async ({ page }) => {
    await page.addInitScript(recordScrollListeners)
    await openPage(page, HOME['pt-br'])
    await page.waitForTimeout(1000) // deixa GSAP/ScrollTrigger registrarem
    const styles = await page.evaluate(() => {
      const pick = (el: Element) => { const s = getComputedStyle(el); return { overflow: s.overflow, overflowX: s.overflowX, overflowY: s.overflowY, position: s.position, height: s.height, touchAction: s.touchAction, overscrollBehavior: s.overscrollBehavior, scrollSnapType: s.scrollSnapType } }
      return { html: pick(document.documentElement), body: pick(document.body) }
    })
    for (const [name, s] of Object.entries(styles)) {
      expect(s.overflow, `${name} overflow`).not.toMatch(/hidden|clip/)
      expect(s.overflowY, `${name} overflow-y`).not.toMatch(/hidden|clip/)
      expect(s.position, `${name} position`).not.toBe('fixed')
      expect(s.scrollSnapType, `${name} scroll-snap`).toBe('none')
    }

    await page.mouse.move(720, 450)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    await page.mouse.wheel(0, 500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    const y1 = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 500)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y1 + 300)
    await page.mouse.wheel(0, -2000)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

    const listeners = await page.evaluate(() => (window as unknown as { __scrollListeners: ListenerLog[] }).__scrollListeners)
    // Ignora o interceptor de hit-target do PRÓPRIO Playwright (InjectedScript), que não faz parte do produto.
    const rootBlocking = listeners.filter(l => l.target !== 'element' && l.passive === false && !/InjectedScript|HitTarget/.test(l.origin ?? ''))
    expect(rootBlocking, 'listeners não-passivos de wheel/touch em window/document/html/body').toEqual([])
    test.info().annotations.push({ type: 'listeners wheel/touch registrados', description: JSON.stringify(listeners) })
  })

  test('[AC-035] teclado rola a página (End/PageDown) e Home volta ao topo', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.keyboard.press('PageDown')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200)
    await page.keyboard.press('End')
    await expect.poll(() => page.evaluate(() => window.scrollY + window.innerHeight)).toBeGreaterThanOrEqual(await page.evaluate(() => document.documentElement.scrollHeight) - 4)
    await page.keyboard.press('Home')
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('[AC-033][AC-035] desktop (full): rolar pelo hero avança data-phase de 0 a 3 e é reversível', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    test.skip(!(await hasWebGL(page)), 'sem WebGL neste ambiente: modo full inatingível')
    await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'full')
    await page.waitForTimeout(1000)
    const seen = await wheelUntilPhase3(page)
    expect(seen).toEqual(expect.arrayContaining(['0', '1', '2', '3']))
    await page.mouse.wheel(0, -5000)
    await expect.poll(() => phase(page)).toBe('0')
  })

  test.describe('mobile 390×844 (lite)', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    test('[AC-033][AC-035] lite: rolar pelo hero avança data-phase de 0 a 3 e é reversível', async ({ page }) => {
      await openPage(page, HOME['pt-br'])
      await expect(page.locator('.signal')).toHaveAttribute('data-mode', 'lite')
      await page.waitForTimeout(1000)
      const seen = await wheelUntilPhase3(page, 80, 160)
      expect(seen).toEqual(expect.arrayContaining(['0', '1', '2', '3']))
      await page.mouse.wheel(0, -8000)
      await expect.poll(() => phase(page)).toBe('0')
    })
  })
})

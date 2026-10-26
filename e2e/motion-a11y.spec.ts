import { expect, test, type Page } from '@playwright/test'

const storyWords = (page: Page) => page.locator('#scroll-story-title > span[aria-hidden="true"]')
/** Canal vermelho 0-255 de uma cor computada (rgb() ou color(srgb ...)). */
const channel = (c: string) => {
  const n = Number(c.match(/[\d.]+/)?.[0])
  return n <= 1 && !c.startsWith('rgb') ? Math.round(n * 255) : n
}
const wordChannels = (page: Page) => storyWords(page).evaluateAll(els => els.map(e => getComputedStyle(e).color))

test.describe('ScrollStory', () => {
  test('sem JS: frase toda legível e números finais no HTML (en, britânico)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('#scroll-story-title .sr-only')).toHaveText('You should not need to check every detail to know the project is moving forward. Our process is quiet, transparent and outcome-led: one focused team turning complexity into solid software.')
    expect(Math.min(...(await wordChannels(page)).map(channel))).toBe(255)
    await expect(page.locator('.scroll-story-stats')).toContainText('250+')
    expect(await page.locator('.scroll-story-stats').evaluate(e => getComputedStyle(e).opacity)).toBe('1')
    await ctx.close()
  })

  test('pt-BR traduzido', async ({ page }) => {
    await page.goto('/pt-br')
    await expect(page.locator('#scroll-story-title .sr-only')).toContainText('Você não precisa acompanhar cada detalhe')
    await expect(page.locator('.scroll-story-stats')).toContainText('empresas confiam na Severius')
  })

  test('com JS: palavras acendem com a rolagem e a contagem termina no valor final', async ({ page }) => {
    await page.goto('/')
    const words = storyWords(page)
    // no topo a frase ainda está "apagada", mas nunca abaixo de #8a8a8a (AAA para texto grande)
    await expect.poll(async () => channel(await words.last().evaluate(e => getComputedStyle(e).color))).toBeLessThan(255)
    expect(channel(await words.last().evaluate(e => getComputedStyle(e).color))).toBeGreaterThanOrEqual(0x8a)
    await page.locator('.scroll-story-stats').scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
    await expect.poll(async () => channel(await words.last().evaluate(e => getComputedStyle(e).color)), { timeout: 8000 }).toBe(255)
    await expect(page.locator('.scroll-story-stats [data-value="250"]')).toHaveText('250+', { timeout: 8000 })
    // leitor de tela sempre recebe o valor final
    await expect(page.locator('.scroll-story-stats .sr-only').first()).toHaveText('250+ companies trust Severius')
  })

  test('sem CLS ao rolar pela home', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver(list => {
        for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value
        }
      }).observe({ type: 'layout-shift', buffered: true })
    })
    for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(60) }
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls).toBeLessThan(0.05)
  })
})

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('sem animação, sem parallax, sem spotlight; texto estático e legível', async ({ page }) => {
    await page.goto('/pt-br')
    expect(Math.min(...(await wordChannels(page)).map(channel))).toBe(255)
    await expect(page.locator('.scroll-story-stats [data-value="250"]')).toHaveText('250+')
    expect(await page.locator('.scroll-story-sticky').evaluate(e => getComputedStyle(e).position)).toBe('relative')
    expect(await page.locator('.flow-console').evaluate(e => getComputedStyle(e).transform)).toBe('none')
    expect(await page.locator('.kinetic-rope').evaluate(e => getComputedStyle(e).opacity)).toBe('0.5')
    await page.mouse.move(400, 300)
    await page.mouse.move(600, 420)
    const spot = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--spotlight-x').trim())
    expect(spot).toBe('-1000px')
    expect(await page.locator('[data-reveal="hidden"]').count()).toBe(0)
  })
})

test('spotlight segue o ponteiro (fine pointer) e é limpo', async ({ page }) => {
  await page.goto('/')
  await page.mouse.move(300, 200)
  await page.mouse.move(320, 210)
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--spotlight-x'))).toBe('320.00px')
})

test.describe('teclado e foco', () => {
  test('skip link é o primeiro focável e leva ao main', async ({ page }) => {
    for (const [path, label] of [['/', 'Skip to content'], ['/pt-br', 'Pular para o conteúdo']]) {
      await page.goto(path)
      await page.keyboard.press('Tab')
      const skip = page.locator('[data-skip-link]')
      await expect(skip).toBeFocused()
      await expect(skip).toHaveText(label)
      const box = await skip.boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      await page.keyboard.press('Enter')
      await expect(page.locator('#main')).toBeFocused()
    }
  })

  test('foco nunca fica escondido sob o header sticky', async ({ page }) => {
    await page.goto('/contact')
    const q3 = page.locator('#faq-q-2')
    await page.locator('#faq-q-1').focus()
    await q3.evaluate(el => window.scrollTo(0, window.scrollY + el.getBoundingClientRect().top - 10))
    await page.keyboard.press('Tab')
    await expect(q3).toBeFocused()
    const header = await page.getByRole('banner').boundingBox()
    const box = await q3.boundingBox()
    expect(box!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1)
  })

  test('foco visível com contorno de 2px', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const outline = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement as Element)
      return { w: s.outlineWidth, style: s.outlineStyle }
    })
    expect(outline.style).toBe('solid')
    expect(parseFloat(outline.w)).toBeGreaterThanOrEqual(2)
  })
})

test.describe('menu mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('foco preso, Esc fecha e devolve o foco, fundo inerte', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Open menu' })
    await toggle.click()
    await expect(page.locator('#main')).toHaveAttribute('inert', '')
    await expect(page.locator('body > footer')).toHaveAttribute('inert', '')
    const menu = page.locator('#mobile-menu')
    await expect(menu.getByRole('link').first()).toBeFocused()
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => {
        const a = document.activeElement
        return !!a && (!!a.closest('#mobile-menu') || a.getAttribute('aria-controls') === 'mobile-menu')
      })
      expect(inside).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
    await expect(page.locator('#main')).not.toHaveAttribute('inert', /.*/)
  })
})

test.describe('tamanho de alvo >= 44x44 (2.5.5)', () => {
  const SELECTORS = [
    'header a', 'header button', 'footer a', 'main button', 'main a',
  ]
  for (const [path, vw] of [['/', 1440], ['/contact', 1440], ['/services', 1440], ['/work', 1440], ['/pt-br/contact', 390], ['/pt-br', 390]] as const) {
    test(`${path} @${vw}`, async ({ page }) => {
      await page.setViewportSize({ width: vw, height: 900 })
      await page.goto(path)
      const small = await page.evaluate(sels => {
        const out: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>(sels.join(','))) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0 || el.closest('[hidden]')) continue
          if (el.matches('[data-skip-link]')) continue
          if (r.width < 44 || r.height < 44) out.push(`${el.tagName} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`)
        }
        return out
      }, SELECTORS)
      expect(small).toEqual([])
    })
  }
})

test.describe('reflow e espaçamento de texto', () => {
  const PATHS = ['/', '/services', '/work', '/work/chic-boutique', '/process', '/about', '/contact']
  for (const prefix of ['', '/pt-br']) {
    test(`320px sem rolagem horizontal (1.4.10) e com text-spacing (1.4.12) ${prefix || 'en'}`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 })
      for (const p of PATHS) {
        await page.goto(prefix + (p === '/' && prefix ? '' : p))
        await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-bottom: 2em !important }' })
        const res = await page.evaluate(() => {
          const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth
          const clipped = [...document.querySelectorAll<HTMLElement>('a, button, h1, h2, h3, label, input')]
            .filter(el => el.offsetParent && !el.matches('[data-skip-link], .sr-only') && el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY === 'hidden')
            .map(el => el.textContent?.trim().slice(0, 30))
          return { overflowX, clipped }
        })
        expect(res.overflowX, p).toBe(0)
        expect(res.clipped, p).toEqual([])
      }
    })
  }
})

test('títulos de página únicos por rota e idioma', async ({ page }) => {
  const titles = new Set<string>()
  const paths = ['/', '/services', '/work', '/work/chic-boutique', '/process', '/about', '/contact']
  for (const p of [...paths, ...paths.map(x => (x === '/' ? '/pt-br' : `/pt-br${x}`))]) {
    await page.goto(p)
    titles.add(await page.title())
  }
  expect(titles.size).toBe(14)
})

test('formulário: required, autocomplete, hint e erro ligados ao campo', async ({ page }) => {
  await page.goto('/pt-br/contact')
  const name = page.getByRole('textbox', { name: /^Nome completo/ })
  const email = page.getByRole('textbox', { name: /^E-mail/ })
  await expect(name).toHaveAttribute('required', '')
  await expect(name).toHaveAttribute('autocomplete', 'name')
  await expect(email).toHaveAttribute('autocomplete', 'email')
  await expect(email).toHaveAccessibleDescription('Por exemplo: nome@empresa.com')
  await name.fill('Ana')
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()
  await expect(email).toBeFocused()
  await expect(email).toHaveAttribute('aria-invalid', 'true')
  await expect(email).toHaveAccessibleDescription(/Informe um e-mail válido\./)
})

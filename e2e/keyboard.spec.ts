import { expect, test, type Page } from '@playwright/test'
import { HOME, LOCALES, openPage } from './helpers'

type FocusInfo = {
  label: string
  outlineStyle: string
  outlineWidth: number
  outlineOffset: number
  contrast: number
  covered: boolean
}

/** Descreve o elemento focado: outline computado, contraste do indicador contra o fundo ao redor e se está coberto. */
function readFocus(): FocusInfo | null {
  const el = document.activeElement as HTMLElement | null
  if (!el || el === document.body || el === document.documentElement) return null
  const cs = getComputedStyle(el)
  const parse = (value: string) => {
    const m = value.match(/rgba?\(([^)]+)\)/)
    if (!m) return [0, 0, 0, 0]
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
  }
  const composite = (layers: number[][]): number[] => {
    // layers: do topo para a base; mistura até achar uma camada opaca
    let result = [255, 255, 255]
    for (let i = layers.length - 1; i >= 0; i--) { const c = layers[i]; result = [0, 1, 2].map(k => c[k] * c[3] + result[k] * (1 - c[3])) }
    return result
  }
  const lum = (rgb: number[]) => {
    const [r, g, b] = rgb.map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const outline = parse(cs.outlineColor)
  // Fundo real ao redor: amostra um ponto logo fora da borda do elemento e empilha as camadas de fundo visíveis
  // naquele ponto (o cabeçalho é absoluto sobre o hero escuro, então a cadeia de ancestrais não basta).
  const r0 = el.getBoundingClientRect()
  const px = Math.max(1, r0.left - 3)
  const py = r0.top + r0.height / 2
  const stack = document.elementsFromPoint(px, py).filter(n => n !== el && !el.contains(n))
  const layers: number[][] = []
  for (const n of stack) { const c = parse(getComputedStyle(n).backgroundColor); if (c[3] > 0) layers.push(c); if (c[3] >= 0.99) break }
  const surround = composite(layers)
  const [hi, lo] = [lum(outline.slice(0, 3)), lum(surround)].sort((a, b) => b - a)
  const rect = el.getBoundingClientRect()
  const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
  const covered = !top || !(el.contains(top) || top.contains(el))
  const label = `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''}${el.id ? '#' + el.id : ''} "${(el.textContent ?? '').trim().slice(0, 30)}"`
  return { label, outlineStyle: cs.outlineStyle, outlineWidth: parseFloat(cs.outlineWidth), outlineOffset: parseFloat(cs.outlineOffset), contrast: (hi + 0.05) / (lo + 0.05), covered }
}

/** html tem scroll-behavior:smooth: espera a rolagem do foco terminar antes de medir geometria/contraste. */
async function settleScroll(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    let last = -1
    let stable = 0
    const tick = () => { const y = window.scrollY; stable = y === last ? stable + 1 : 0; last = y; if (stable >= 6) resolve(); else requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }))
}

async function tabThrough(page: Page, max = 140) {
  const seen: FocusInfo[] = []
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    await settleScroll(page)
    const info = await page.evaluate(readFocus)
    if (!info) break
    seen.push(info)
    if (seen.length > 1 && info.label === seen[0].label) break
  }
  return seen
}

test.describe('Teclado e foco (desktop)', () => {
  test('[AC-051] skip link é o primeiro Tab e ativá-lo leva o teclado ao conteúdo (#conteudo)', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.keyboard.press('Tab')
    const first = await page.evaluate(() => ({ cls: document.activeElement?.className, href: document.activeElement?.getAttribute('href') }))
    expect(first.cls).toContain('skip-link')
    expect(first.href).toBe('#conteudo')
    const box = await page.locator('.skip-link').boundingBox()
    expect(box && box.y >= 0 && box.y < 200).toBe(true) // visível ao receber foco
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#conteudo$/)
    await page.keyboard.press('Tab')
    const insideMain = await page.evaluate(() => !!document.activeElement?.closest('#conteudo'))
    expect(insideMain).toBe(true)
  })

  test('[AC-051] após ativar o skip link, document.activeElement é o próprio #conteudo', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    const id = await page.evaluate(() => document.activeElement?.id)
    expect(id).toBe('conteudo')
  })

  for (const locale of LOCALES) {
    test(`[AC-052] ${HOME[locale]}: todo elemento focável mostra outline computado ≠ none e não fica coberto`, async ({ page }) => {
      await openPage(page, HOME[locale])
      const seen = await tabThrough(page)
      expect(seen.length).toBeGreaterThan(15)
      const noOutline = seen.filter(s => s.outlineStyle === 'none' || s.outlineWidth <= 0).map(s => s.label)
      expect(noOutline, 'elementos focados sem outline').toEqual([])
      expect(seen.filter(s => s.covered).map(s => s.label), 'elementos focados cobertos por outro').toEqual([])
    })

    test(`[AC-052] ${HOME[locale]}: indicador de foco tem contraste ≥ 3:1 contra o fundo ao redor (fundos claros e escuros)`, async ({ page }) => {
      await openPage(page, HOME[locale])
      const seen = await tabThrough(page)
      const low = seen.filter(s => s.contrast < 3).map(s => `${s.label} → ${s.contrast.toFixed(2)}:1`)
      expect(low, 'indicadores de foco com contraste < 3:1').toEqual([])
    })
  }

  test('[AC-051] Shift+Tab percorre a ordem inversa a partir do skip link sem prender o foco', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    expect(await page.evaluate(() => document.activeElement?.className)).toContain('skip-link')
  })
})

test.describe('Menu mobile (390×844)', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  for (const locale of LOCALES) {
    test(`[AC-051] ${HOME[locale]}: menu abre, foco entra, Tab cicla (trap), Shift+Tab cicla, Esc fecha e devolve foco ao botão`, async ({ page }) => {
      await openPage(page, HOME[locale])
      const trigger = page.locator('button.menu-trigger')
      await expect(trigger).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await trigger.focus()
      await page.keyboard.press('Enter') // abertura só por teclado

      const menu = page.locator('#mobile-menu')
      await expect(menu).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      const inside = () => page.evaluate(() => !!document.activeElement?.closest('#mobile-menu'))
      expect(await inside()).toBe(true) // foco entra no painel

      const count = await menu.locator('a,button').count()
      expect(count).toBeGreaterThanOrEqual(5)
      const visited = new Set<string>()
      for (let i = 0; i < count * 2 + 2; i++) {
        await page.keyboard.press('Tab')
        expect(await inside(), `Tab #${i + 1} saiu do painel`).toBe(true)
        visited.add(await page.evaluate(() => (document.activeElement?.textContent ?? '').trim()))
      }
      expect(visited.size).toBe(count) // percorreu todos os itens, ciclicamente

      // Shift+Tab a partir do primeiro item vai para o último
      await menu.locator('a,button').first().focus()
      await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => document.activeElement === document.querySelector('#mobile-menu nav a:last-child'))).toBe(true)

      await page.keyboard.press('Escape')
      await expect(menu).toHaveCount(0)
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toBeFocused()
    })
  }

  test('[AC-051] botão Fechar do menu devolve o foco ao botão que abriu', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    const trigger = page.locator('button.menu-trigger')
    await trigger.click()
    await page.locator('#mobile-menu .menu-close').click()
    await expect(page.locator('#mobile-menu')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('[AC-023] link do menu mobile fecha o menu e leva à âncora', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.locator('button.menu-trigger').click()
    await page.locator('#mobile-menu a[href="#capacidades"]').click()
    await expect(page.locator('#mobile-menu')).toHaveCount(0)
    await expect(page).toHaveURL(/#capacidades$/)
    await expect(page.locator('#capacidades')).toBeInViewport({ ratio: 0.05 })
  })

  test('[AC-052] menu mobile: foco visível em cada item do painel', async ({ page }) => {
    await openPage(page, HOME['pt-br'])
    await page.locator('button.menu-trigger').focus()
    await page.keyboard.press('Enter') // abertura por teclado: o foco programático passa a casar com :focus-visible
    const count = await page.locator('#mobile-menu a,#mobile-menu button').count()
    for (let i = 0; i < count; i++) {
      const info = await page.evaluate(readFocus)
      expect(info?.outlineStyle, info?.label).not.toBe('none')
      expect(info?.contrast ?? 0, info?.label).toBeGreaterThanOrEqual(3)
      await page.keyboard.press('Tab')
    }
  })
})

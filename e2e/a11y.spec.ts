import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { HOME, LOCALES, PAGES, VIEWPORTS, openPage } from './helpers'

// wcag21a incluído além das tags pedidas: WCAG 2.2 AA exige também os critérios A de 2.1.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const axeDir = path.join(process.cwd(), 'evidence', 'axe')

test.beforeAll(() => { mkdirSync(axeDir, { recursive: true }); mkdirSync(path.join(process.cwd(), 'evidence', 'screens'), { recursive: true }) })

async function audit(page: Page, name: string, disableRules: string[] = []) {
  // Animações de entrada (GSAP) deixam opacidade parcial por instantes; mede-se só o estado assentado (0 = ainda oculto, 1 = revelado).
  await page.waitForFunction(() => [...document.querySelectorAll('.capabilities *')].every(el => { const o = Number(getComputedStyle(el).opacity); return o === 0 || o === 1 }), undefined, { timeout: 8000 })
  let builder = new AxeBuilder({ page }).withTags(TAGS)
  if (disableRules.length) builder = builder.disableRules(disableRules)
  const results = await builder.analyze()
  const violations = results.violations.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.map(n => ({ target: n.target.join(' '), html: n.html.slice(0, 200), summary: n.failureSummary?.split('\n').slice(0, 3).join(' ') })),
  }))
  writeFileSync(path.join(axeDir, `${name}.json`), JSON.stringify({
    name, url: page.url(), axe: results.testEngine, tags: TAGS,
    passes: results.passes.length, incomplete: results.incomplete.map(i => ({ id: i.id, nodes: i.nodes.map(n => n.target.join(' ')) })), violations,
  }, null, 2) + '\n')
  return violations.flatMap(v => v.nodes.map(n => `${v.id} [${v.impact}] ${n.target} — ${v.help}`))
}

const profiles = [
  { key: 'desktop', use: { viewport: VIEWPORTS.desktop } },
  { key: 'mobile', use: { viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true } },
] as const

const modes = [
  { key: 'padrao', use: {} },
  { key: 'reduced-motion', use: { reducedMotion: 'reduce' as const } },
  { key: 'forced-colors', use: { forcedColors: 'active' as const } },
]

for (const profile of profiles) {
  for (const mode of modes) {
    test.describe(`axe — ${profile.key} / ${mode.key}`, () => {
      test.use({ ...profile.use, ...mode.use })
      for (const p of PAGES) {
        test(`[AC-056][AC-050][AC-053][AC-054] ${p.path} (${profile.key}, ${mode.key}): zero violações axe WCAG 2.x A/AA`, async ({ page }) => {
          await openPage(page, p.path)
          await page.waitForTimeout(800)
          // Em forced-colors o navegador substitui as cores do autor por cores do sistema; o axe avalia as cores
          // AUTORAIS e reporta falso positivo de color-contrast (verificado visualmente: texto preto sobre fundo
          // branco, ver evidence/screens/forced-colors-*.png). Supressão restrita a essa regra e a esse modo (plano §10.9).
          const forced = mode.key === 'forced-colors'
          if (forced) await page.screenshot({ path: path.join(process.cwd(), 'evidence', 'screens', `forced-colors-${p.name}-${profile.key}.png`) })
          expect(await audit(page, `${p.name}-${profile.key}-${mode.key}`, forced ? ['color-contrast'] : [])).toEqual([])
        })
      }
    })
  }
}

test.describe('axe — estados do formulário e do menu', () => {
  for (const locale of LOCALES) {
    const submit = locale === 'en' ? 'Prepare request' : 'Preparar solicitação'
    test(`[AC-056][AC-043] ${HOME[locale]}: formulário em estado de erro`, async ({ page }) => {
      await openPage(page, HOME[locale])
      await page.getByRole('button', { name: submit }).click()
      await expect(page.locator('#name-error')).toBeVisible()
      await page.waitForTimeout(400)
      expect(await audit(page, `form-erro-${locale}`)).toEqual([])
    })
    test(`[AC-056][AC-043] ${HOME[locale]}: formulário em estado de sucesso local`, async ({ page }) => {
      await openPage(page, HOME[locale])
      await page.locator('#name').fill('Pessoa de Teste')
      await page.locator('#contact').fill('teste@example.invalid')
      await page.locator('#context').fill('Contexto de teste.')
      await page.locator('#consent').check()
      await page.getByRole('button', { name: submit }).click()
      await expect(page.locator('.local-summary')).toBeVisible()
      await page.waitForTimeout(400)
      expect(await audit(page, `form-sucesso-${locale}`)).toEqual([])
    })
  }

  test.describe('menu mobile aberto', () => {
    test.use({ viewport: VIEWPORTS.mobile, isMobile: true, hasTouch: true })
    for (const locale of LOCALES) {
      test(`[AC-056][AC-051] ${HOME[locale]}: menu mobile aberto`, async ({ page }) => {
        await openPage(page, HOME[locale])
        await page.locator('button.menu-trigger').click()
        await expect(page.locator('#mobile-menu')).toBeVisible()
        await page.waitForTimeout(300)
        expect(await audit(page, `menu-mobile-${locale}`)).toEqual([])
      })
    }
  })
})

test.describe('Zoom, reflow e espaçamento de texto', () => {
  test('[AC-032][AC-054] reflow 320px (zoom 400%): zero violações axe', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 })
    await openPage(page, HOME['pt-br'])
    await page.waitForTimeout(500)
    expect(await audit(page, 'reflow-320-pt-br')).toEqual([])
  })

  for (const viewport of [VIEWPORTS.desktop, VIEWPORTS.mobile]) {
    for (const p of PAGES) {
      test(`[AC-054] ${p.path} @${viewport.width}px: espaçamento de texto WCAG 1.4.12 não corta nem sobrepõe conteúdo`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await openPage(page, p.path)
        await page.addStyleTag({ content: '*{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important}p{margin-bottom:2em !important}' })
        await page.waitForTimeout(300)
        const result = await page.evaluate(() => {
          const clipped = [...document.querySelectorAll<HTMLElement>('body *')]
            .filter(el => !(el instanceof SVGElement) && (el.textContent ?? '').trim().length > 0)
            .filter(el => { const s = getComputedStyle(el); return /hidden|clip/.test(s.overflowX + s.overflowY) && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) })
            .map(el => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} (${el.scrollWidth}x${el.scrollHeight} > ${el.clientWidth}x${el.clientHeight})`)
          return { clipped, scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }
        })
        expect(result.clipped, 'elementos com texto cortado').toEqual([])
        expect(result.scrollWidth, 'overflow horizontal com espaçamento ampliado').toBeLessThanOrEqual(result.innerWidth)
      })
    }
  }

  test('[AC-032][AC-054] tamanho do texto 200% (font-size raiz 32px): sem overflow horizontal e conteúdo presente', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await openPage(page, HOME['pt-br'])
    await page.addStyleTag({ content: 'html{font-size:200% !important}' })
    await page.waitForTimeout(300)
    const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
    expect(o.sw).toBeLessThanOrEqual(o.iw)
    await expect(page.locator('h1')).toBeVisible()
  })
})

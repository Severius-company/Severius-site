import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * Auditoria automática (axe-core) — cobre WCAG 2.0/2.1/2.2 A e AA + best-practices.
 * Contraste AAA (1.4.6) é checado à parte com a regra color-contrast-enhanced.
 * O que o axe NÃO cobre (ex.: 1.4.8, 2.4.9, 3.1.5) está na revisão manual descrita no README.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']

const PATHS = ['/', '/services', '/work', '/work/chic-boutique', '/process', '/about', '/contact']
const ROUTES = [...PATHS, ...PATHS.map(p => (p === '/' ? '/pt-br' : `/pt-br${p}`)), '/nao-existe', '/pt-br/nao-existe']
const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
]

async function scan(page: Page, opts: { aaa?: boolean } = {}) {
  // rola até o fim para revelar tudo (Reveal) e volta ao topo
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(700)
  const builder = new AxeBuilder({ page }).withTags(TAGS)
  const res = await builder.analyze()
  const violations = res.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map(n => n.target.join(' ')) }))
  let aaa: typeof violations = []
  if (opts.aaa) {
    const r2 = await new AxeBuilder({ page }).withRules(['color-contrast-enhanced']).analyze()
    aaa = r2.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 5).map(n => `${n.target.join(' ')} :: ${n.any[0]?.message ?? ''}`) }))
  }
  return { violations, aaa }
}

for (const vp of VIEWPORTS) {
  test.describe(`axe ${vp.name}px`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })
    for (const route of ROUTES) {
      test(`${route} sem violações (A/AA/best-practice + contraste AAA)`, async ({ page }) => {
        await page.goto(route)
        const { violations, aaa } = await scan(page, { aaa: true })
        expect(violations, JSON.stringify(violations, null, 1)).toEqual([])
        expect(aaa, JSON.stringify(aaa, null, 1)).toEqual([])
      })
    }
  })
}

test.describe('axe em estados e modos especiais', () => {
  test('reduced-motion em todas as rotas (en e pt)', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    for (const route of ROUTES) {
      await page.goto(route)
      const { violations, aaa } = await scan(page, { aaa: true })
      expect(violations, `${route} ${JSON.stringify(violations)}`).toEqual([])
      expect(aaa, `${route} ${JSON.stringify(aaa)}`).toEqual([])
    }
    await ctx.close()
  })

  test('forced-colors e prefers-contrast: more', async ({ page }) => {
    for (const media of [{ forcedColors: 'active' as const }, { contrast: 'more' as const }]) {
      await page.emulateMedia(media)
      for (const route of ['/', '/pt-br/contact', '/services']) {
        await page.goto(route)
        const { violations } = await scan(page)
        expect(violations, `${JSON.stringify(media)} ${route} ${JSON.stringify(violations)}`).toEqual([])
        await expect(page.locator('h1')).toBeVisible()
      }
    }
  })

  test('menu mobile aberto (en e pt)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const [route, label] of [['/', 'Open menu'], ['/pt-br/about', 'Abrir menu']]) {
      await page.goto(route)
      await page.getByRole('button', { name: label }).click()
      const res = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(res.violations.map(v => v.id), route).toEqual([])
    }
  })

  test('formulário em erro e em sucesso (en e pt)', async ({ page }) => {
    for (const [route, send, name, email] of [
      ['/contact', 'Send Message', 'Full Name', 'Email'],
      ['/pt-br/contact', 'Enviar mensagem', 'Nome completo', 'E-mail'],
    ]) {
      await page.goto(route)
      await page.getByRole('button', { name: send }).click()
      let res = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(res.violations.map(v => v.id), `${route} erro`).toEqual([])
      res = await new AxeBuilder({ page }).withRules(['color-contrast-enhanced']).analyze()
      expect(res.violations.map(v => v.id), `${route} erro AAA`).toEqual([])
      await page.getByLabel(name).fill('Ana Souza')
      await page.getByRole('textbox', { name: new RegExp(`^${email}`) }).fill('ana@example.com')
      await page.getByRole('button', { name: send }).click()
      await expect(page.getByRole('status')).toBeVisible()
      res = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(res.violations.map(v => v.id), `${route} sucesso`).toEqual([])
    }
  })
})

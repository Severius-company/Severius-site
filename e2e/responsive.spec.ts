import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { ARTICLE, HOME, LOCALES, PAGES, openPage } from './helpers'

const SIZES = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]
const screensDir = path.join(process.cwd(), 'evidence', 'screens')

/** Elementos cuja borda direita ultrapassa a viewport (diagnóstico de overflow horizontal). */
async function overflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const width = window.innerWidth
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > width + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' })
      .slice(0, 8)
      .map(el => `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} right=${Math.round(el.getBoundingClientRect().right)}`)
    return { scrollWidth: doc.scrollWidth, bodyScrollWidth: document.body.scrollWidth, innerWidth: width, offenders }
  })
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
}

test.beforeAll(() => { mkdirSync(screensDir, { recursive: true }) })

test.describe('Responsividade: overflow e screenshots full-page', () => {
  for (const locale of LOCALES) {
    for (const size of SIZES) {
      test(`[AC-032] ${HOME[locale]} @${size.width}px: sem overflow horizontal + screenshot`, async ({ page }) => {
        await page.setViewportSize(size)
        await openPage(page, HOME[locale])
        await settle(page)
        const o = await overflow(page)
        await page.screenshot({ path: path.join(screensDir, `${locale}-${size.width}.png`), fullPage: true })
        expect(o.scrollWidth, `documentElement.scrollWidth vs innerWidth; ofensores: ${o.offenders.join(' | ')}`).toBeLessThanOrEqual(o.innerWidth)
        expect(o.bodyScrollWidth, 'body.scrollWidth').toBeLessThanOrEqual(o.innerWidth)
      })
    }
  }

  for (const page_ of PAGES.filter(p => p.kind === 'article')) {
    for (const size of SIZES) {
      test(`[AC-032] ${page_.path} @${size.width}px: sem overflow horizontal`, async ({ page }) => {
        await page.setViewportSize(size)
        await openPage(page, page_.path)
        await settle(page)
        const o = await overflow(page)
        expect(o.scrollWidth, `ofensores: ${o.offenders.join(' | ')}`).toBeLessThanOrEqual(o.innerWidth)
      })
    }
  }

  test('[AC-032] estados de erro e de resumo do formulário em EN @320px não geram overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await openPage(page, HOME.en)
    await page.getByRole('button', { name: 'Prepare request' }).click()
    await expect(page.locator('#name-error')).toBeVisible()
    await settle(page)
    let o = await overflow(page)
    expect(o.scrollWidth, `estado de erro; ofensores: ${o.offenders.join(' | ')}`).toBeLessThanOrEqual(o.innerWidth)
    await page.locator('#diagnostico').screenshot({ path: path.join(screensDir, 'en-320-form-errors.png') })

    await page.locator('#name').fill('A very long name that keeps going and going without any spaces at all'.replace(/ /g, '_'))
    await page.locator('#contact').fill('averyveryverylongemailaddressthatshouldwrapinsteadofoverflowing@subdomain.example.invalid')
    await page.locator('#context').fill('Unbrokenlongwordunbrokenlongwordunbrokenlongwordunbrokenlongwordunbrokenlongwordunbrokenlongword and a long URL https://example.invalid/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
    await page.locator('#consent').check()
    await page.getByRole('button', { name: 'Prepare request' }).click()
    await expect(page.locator('.local-summary')).toBeVisible()
    await settle(page)
    o = await overflow(page)
    expect(o.scrollWidth, `estado de sucesso; ofensores: ${o.offenders.join(' | ')}`).toBeLessThanOrEqual(o.innerWidth)
    await page.locator('#diagnostico').screenshot({ path: path.join(screensDir, 'en-320-form-summary.png') })
  })

  test('[AC-032] reflow: viewport 320×256 (equivale a zoom 400% em 1280×1024) mantém conteúdo, CTA e formulário utilizáveis sem rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 })
    await openPage(page, HOME['pt-br'])
    await settle(page)
    const o = await overflow(page)
    expect(o.scrollWidth, `ofensores: ${o.offenders.join(' | ')}`).toBeLessThanOrEqual(o.innerWidth)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('button.menu-trigger')).toBeVisible()
    await page.locator('.hero-actions a.button').scrollIntoViewIfNeeded()
    await page.locator('.hero-actions a.button').click()
    await expect(page.locator('#name')).toBeVisible()
    await page.locator('#name').scrollIntoViewIfNeeded()
    const box = await page.locator('#name').boundingBox()
    expect(box && box.x >= 0 && box.x + box.width <= 320).toBe(true)
    await page.screenshot({ path: path.join(screensDir, 'pt-br-320x256-reflow400.png') })
  })

  test('[AC-032] artigo mantém a mesma garantia de reflow a 320×256', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 })
    await openPage(page, ARTICLE['pt-br'])
    const o = await overflow(page)
    expect(o.scrollWidth, `ofensores: ${o.offenders.join(' | ')}`).toBeLessThanOrEqual(o.innerWidth)
  })
})

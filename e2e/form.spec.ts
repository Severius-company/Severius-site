import { expect, test, type Page, type Request } from '@playwright/test'
import { HOME, LOCALES, openPage, sameOrigin, type Locale } from './helpers'

const SUBMIT: Record<Locale, string> = { 'pt-br': 'Preparar solicitação', en: 'Prepare request' }
const EDIT: Record<Locale, string> = { 'pt-br': 'Editar respostas', en: 'Edit answers' }
const SUCCESS: Record<Locale, RegExp> = { 'pt-br': /Nada foi enviado/, en: /Nothing was sent/ }

const form = (page: Page) => page.locator('form.diagnostic-form')
const submit = (page: Page, locale: Locale) => form(page).getByRole('button', { name: SUBMIT[locale] })

async function fillValid(page: Page, values: Partial<{ name: string; contact: string; context: string; stage: string; consent: boolean }> = {}) {
  const v = { name: 'Pessoa de Teste', contact: 'teste@example.invalid', context: 'Preciso organizar um projeto de software.', stage: 'defining', consent: true, ...values }
  await page.locator('#name').fill(v.name)
  await page.locator('#contact').fill(v.contact)
  await page.locator('#context').fill(v.context)
  await page.locator('#stage').selectOption(v.stage)
  if (v.consent) await page.locator('#consent').check()
}

for (const locale of LOCALES) {
  test.describe(`Formulário ${locale}`, () => {
    test.beforeEach(async ({ page }) => { await openPage(page, HOME[locale]) })

    test('[AC-043] envio vazio: alerta geral, aria-invalid e aria-describedby ligam cada erro ao campo', async ({ page }) => {
      await submit(page, locale).click()
      await expect(page.locator('form .form-error[role="alert"]')).toBeVisible()

      const pairs: [string, string][] = [['#name', 'name-error'], ['#contact', 'contact-error'], ['#context', 'context-error'], ['#consent', 'consent-error']]
      for (const [selector, errorId] of pairs) {
        const field = page.locator(selector)
        await expect(field, `${selector} aria-invalid`).toHaveAttribute('aria-invalid', 'true')
        const describedBy = (await field.getAttribute('aria-describedby')) ?? ''
        expect(describedBy.split(/\s+/), `${selector} aria-describedby`).toContain(errorId)
        const error = page.locator(`#${errorId}`)
        await expect(error).toBeVisible()
        expect(((await error.textContent()) ?? '').trim().length).toBeGreaterThan(8)
      }
      // O campo opcional (momento) não fica inválido.
      await expect(page.locator('#stage')).not.toHaveAttribute('aria-invalid', 'true')
      await expect(page.locator('.local-summary')).toHaveCount(0)
    })

    test('[AC-043] erro tem mensagem de texto visível (não depende só de cor)', async ({ page }) => {
      await submit(page, locale).click()
      const text = await page.locator('#name-error').innerText()
      expect(text.trim().length).toBeGreaterThan(8)
    })

    test('[AC-044] após envio inválido o foco vai ao primeiro campo inválido ou ao resumo de erros', async ({ page }) => {
      await submit(page, locale).click()
      const focus = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        return { id: el?.id ?? '', role: el?.getAttribute('role') ?? '', tag: el?.tagName ?? '', invalid: el?.getAttribute('aria-invalid') ?? '' }
      })
      const onInvalidField = focus.invalid === 'true'
      const onSummary = focus.role === 'alert' || /form-error/.test(focus.id)
      expect(onInvalidField || onSummary, `foco ficou em ${JSON.stringify(focus)}`).toBe(true)
    })

    test('[AC-044] erro corrigível preserva os campos digitados e a correção limpa os erros', async ({ page }) => {
      await fillValid(page, { consent: false })
      await submit(page, locale).click()
      await expect(page.locator('#consent-error')).toBeVisible()
      await expect(page.locator('#name')).toHaveValue('Pessoa de Teste')
      await expect(page.locator('#contact')).toHaveValue('teste@example.invalid')
      await expect(page.locator('#context')).toHaveValue('Preciso organizar um projeto de software.')
      await expect(page.locator('#stage')).toHaveValue('defining')
      await page.locator('#consent').check()
      await submit(page, locale).click()
      await expect(page.locator('.field-error')).toHaveCount(0)
      await expect(page.locator('.local-summary')).toContainText(SUCCESS[locale])
    })

    test('[AC-040][AC-041] consentimento é obrigatório', async ({ page }) => {
      await fillValid(page, { consent: false })
      await submit(page, locale).click()
      await expect(page.locator('#consent')).toHaveAttribute('aria-invalid', 'true')
      await expect(page.locator('#consent-error')).toBeVisible()
      await expect(page.locator('#name-error')).toHaveCount(0)
      await expect(page.locator('.local-summary')).toHaveCount(0)
    })

    test('[AC-041] contato muito longo: digitação limitada pelo maxlength e 161+ caracteres são rejeitados', async ({ page }) => {
      const contact = page.locator('#contact')
      await fillValid(page, { contact: '' })
      await contact.click()
      await page.keyboard.type('a'.repeat(300))
      expect((await contact.inputValue()).length).toBeLessThanOrEqual(161)
      await submit(page, locale).click()
      await expect(contact).toHaveAttribute('aria-invalid', 'true')
      await expect(page.locator('#contact-error')).toBeVisible()
      // Valor injetado programaticamente (ignora maxlength) continua rejeitado pela validação.
      await contact.fill('b'.repeat(400) + '@example.invalid')
      await submit(page, locale).click()
      await expect(page.locator('#contact-error')).toBeVisible()
      await expect(page.locator('.local-summary')).toHaveCount(0)
    })

    test('[AC-041] contexto: 1500 caracteres aceitos, 1501+ rejeitados com mensagem específica', async ({ page }) => {
      await fillValid(page, { context: 'x'.repeat(1500) })
      await submit(page, locale).click()
      await expect(page.locator('#context-error')).toHaveCount(0)
      await expect(page.locator('.local-summary')).toBeVisible()
      await page.getByRole('button', { name: EDIT[locale] }).click()

      await page.locator('#context').fill('x'.repeat(1501))
      await submit(page, locale).click()
      await expect(page.locator('#context')).toHaveAttribute('aria-invalid', 'true')
      const error = page.locator('#context-error')
      await expect(error).toBeVisible()
      await expect(error).toContainText(locale === 'en' ? /1,500/ : /1\.500/)
      await expect(page.locator('.local-summary')).toHaveCount(0)
    })

    test('[AC-042][AC-043] envio válido: resumo local "Nada foi enviado" e NENHUMA requisição de rede saída', async ({ page, baseURL }) => {
      const all: Request[] = []
      const afterSubmit: Request[] = []
      let recording = false
      page.on('request', r => { all.push(r); if (recording) afterSubmit.push(r) })

      await fillValid(page, { name: 'Zed Unico 7391', contact: 'zed7391@example.invalid', context: 'Contexto exclusivo 7391 para rastrear vazamentos.' })
      await page.waitForLoadState('networkidle') // deixa prefetches de Link terminarem
      recording = true
      await submit(page, locale).click()
      const summary = page.locator('.local-summary')
      await expect(summary).toBeVisible()
      await expect(summary).toContainText(SUCCESS[locale])
      await expect(summary).toHaveAttribute('aria-live', 'polite')
      const text = await summary.locator('textarea').inputValue()
      expect(text).toContain('Zed Unico 7391')
      expect(text).toContain('zed7391@example.invalid')
      await page.waitForTimeout(1500)
      recording = false

      // 1) após o clique de envio: nada do usuário sai. Só pode haver prefetch do Next (GET same-origin de `_rsc`/chunks estáticos),
      //    que o foco/rolagem para o resumo pode disparar ao trazer um <Link> para a viewport — sem método ≠ GET, sem outra origem e sem o texto digitado.
      const isNextPrefetch = (r: Request) => r.method() === 'GET' && sameOrigin(r.url(), baseURL!) && /[?&]_rsc=|\/_next\/static\//.test(r.url())
      expect(afterSubmit.filter(r => !isNextPrefetch(r)).map(r => `${r.method()} ${r.resourceType()} ${r.url()}`), 'requisições após o envio (fora prefetch do Next)').toEqual([])
      expect(afterSubmit.filter(r => /7391|zed/i.test(r.url()) || /7391|zed/i.test(r.postData() ?? '')).map(r => r.url()), 'dado digitado em URL ou corpo').toEqual([])
      // 2) durante toda a sessão: nada além de GET same-origin
      expect(all.filter(r => r.method() !== 'GET').map(r => `${r.method()} ${r.url()}`), 'requisições não-GET').toEqual([])
      expect(all.filter(r => !sameOrigin(r.url(), baseURL!)).map(r => r.url()), 'requisições para outras origens').toEqual([])
      expect(all.filter(r => ['xhr', 'websocket', 'eventsource', 'ping'].includes(r.resourceType())).map(r => r.url())).toEqual([])
      // 3) dados digitados não vão para URL, storage nem cookies
      expect(page.url()).not.toMatch(/7391|zed/i)
      expect(all.some(r => /7391|zed/i.test(r.url()) || /7391|zed/i.test(r.postData() ?? ''))).toBe(false)
      const storage = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage }, c: document.cookie }))
      expect(storage).not.toMatch(/7391|zed/i)
      expect(await page.context().cookies()).toEqual([])
      // 4) o form não tem action de rede
      expect(await form(page).getAttribute('action')).toBeNull()
    })

    test('[AC-044] "Editar respostas" oculta o resumo e mantém os dados preenchidos', async ({ page }) => {
      await fillValid(page)
      await submit(page, locale).click()
      await page.getByRole('button', { name: EDIT[locale] }).click()
      await expect(page.locator('.local-summary')).toHaveCount(0)
      await expect(page.locator('#name')).toHaveValue('Pessoa de Teste')
    })

    test('[AC-083] texto com <script>/HTML é tratado como texto: não executa e aparece literal no resumo', async ({ page }) => {
      const dialogs: string[] = []
      page.on('dialog', d => { dialogs.push(d.message()); void d.dismiss() })
      const payload = '<script>window.__pwned=1</script><img src=x onerror="window.__pwned=2"><svg onload="window.__pwned=3">'
      await fillValid(page, { name: '<b>negrito</b>', context: payload })
      await submit(page, locale).click()
      const summary = page.locator('.local-summary')
      await expect(summary).toBeVisible()
      const text = await summary.locator('textarea').inputValue()
      expect(text).toContain('<script>window.__pwned=1</script>')
      expect(text).toContain('<img src=x onerror="window.__pwned=2">')
      expect(text).toContain('<b>negrito</b>')
      await page.waitForTimeout(500)
      expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined()
      expect(dialogs).toEqual([])
      expect(await summary.locator('script, img, svg[onload], b').count()).toBe(0)
      expect(await page.locator('main img[src="x"]').count()).toBe(0)
    })

    test('[AC-083] CRLF é normalizado e caracteres de controle são rejeitados', async ({ page }) => {
      await fillValid(page, { context: 'linha 1\r\nlinha 2\r\nlinha 3' })
      await submit(page, locale).click()
      const text = await page.locator('.local-summary textarea').inputValue()
      expect(text).not.toContain('\r')
      expect(text).toContain('linha 1\nlinha 2\nlinha 3')
      await page.getByRole('button', { name: EDIT[locale] }).click()
      await page.locator('#name').fill('NomeInvalido')
      await submit(page, locale).click()
      await expect(page.locator('#name')).toHaveAttribute('aria-invalid', 'true')
      await expect(page.locator('.local-summary')).toHaveCount(0)
    })
  })
}

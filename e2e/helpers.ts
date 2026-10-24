import type { Page } from '@playwright/test'

export const LOCALES = ['pt-br', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const HOME: Record<Locale, string> = { 'pt-br': '/pt-br', en: '/en' }
export const ARTICLE: Record<Locale, string> = {
  'pt-br': '/pt-br/insights/como-tirar-uma-ideia-do-campo-da-incerteza',
  en: '/en/insights/from-uncertainty-to-a-buildable-software-project',
}
export const HTML_LANG: Record<Locale, string> = { 'pt-br': 'pt-BR', en: 'en' }
export const PAGES = [
  { name: 'home-pt-br', locale: 'pt-br' as Locale, path: HOME['pt-br'], kind: 'home' as const },
  { name: 'home-en', locale: 'en' as Locale, path: HOME.en, kind: 'home' as const },
  { name: 'article-pt-br', locale: 'pt-br' as Locale, path: ARTICLE['pt-br'], kind: 'article' as const },
  { name: 'article-en', locale: 'en' as Locale, path: ARTICLE.en, kind: 'article' as const },
]

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
}

/** Assinaturas estáveis (strings que sobrevivem à minificação) dos chunks pesados. */
export const THREE_SIGNATURE = /THREE\.WebGLRenderer/
export const GSAP_SIGNATURE = /GSAP target|GreenSock/

/** Aguarda hidratação do React (os nós do DOM ganham __reactFiber$*) e a rede assentar. */
export async function waitHydrated(page: Page) {
  await page.waitForLoadState('networkidle')
  const hasClient = await page.locator('button.menu-trigger').count()
  if (hasClient) {
    await page.waitForFunction(() => {
      const el = document.querySelector('button.menu-trigger')
      return !!el && Object.keys(el).some(key => key.startsWith('__reactFiber'))
    })
  }
  // Effects de seleção de modo do Signal rodam logo após a hidratação.
  await page.waitForTimeout(400)
}

export async function openPage(page: Page, path: string) {
  const response = await page.goto(path)
  await waitHydrated(page)
  return response
}

export async function hasWebGL(page: Page) {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  })
}

export type ScriptInfo = { url: string; bytes: number; three: boolean; gsap: boolean }

/** Registra todos os scripts carregados e classifica pelo conteúdo (nomes de chunk são hashes). */
export function trackScripts(page: Page) {
  const pending: Promise<ScriptInfo | null>[] = []
  page.on('response', response => {
    if (response.request().resourceType() !== 'script') return
    pending.push((async () => {
      try {
        const text = await response.text()
        return { url: response.url(), bytes: text.length, three: THREE_SIGNATURE.test(text), gsap: GSAP_SIGNATURE.test(text) }
      } catch { return null }
    })())
  })
  return { async result() { return (await Promise.all(pending)).filter((s): s is ScriptInfo => s !== null) } }
}

export async function signalMode(page: Page) {
  return page.locator('.signal').getAttribute('data-mode')
}

export function sameOrigin(url: string, baseURL: string) {
  if (url.startsWith('data:') || url.startsWith('blob:')) return true
  return new URL(url).origin === new URL(baseURL).origin
}

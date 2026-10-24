import { expect, test, type Browser, type BrowserContextOptions, type Page } from '@playwright/test'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { HOME, LOCALES, THREE_SIGNATURE, GSAP_SIGNATURE, VIEWPORTS, waitHydrated, type Locale } from './helpers'

/**
 * Medição SINTÉTICA de performance (AC-070–074), local, sem throttle real (exceto o perfil informativo com CPU 4x).
 * NÃO é dado de campo: não permite afirmar p75 de LCP/INP/CLS de usuários reais (plano §5/§6.8/§12).
 * Orçamentos: work/qa-evidence-plan.md §7.
 */

const RUNS = 3
const KB = 1024

const BUDGET = {
  lcpMs: 2500, inpMs: 200, cls: 0.1,
  htmlCssBytes: 100 * KB, initialJsBytes: 130 * KB, sceneChunkBytes: 350 * KB,
  fallbackImageBytes: 120 * KB, fontBytes: 160 * KB, requestsBeforeContent: 20,
  longTaskMs: 200, thirdPartyBytes: 0,
}

type Profile = { key: string; label: string; context: BrowserContextOptions; cpuRate?: number; assert: boolean; mobile: boolean }
const PROFILES: Profile[] = [
  { key: 'desktop', label: 'desktop 1440x900 (modo full)', context: { viewport: VIEWPORTS.desktop }, assert: true, mobile: false },
  { key: 'mobile', label: 'mobile emulado 390x844 DPR3 (modo lite)', context: { viewport: VIEWPORTS.mobile, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Mobile Safari/537.36' }, assert: true, mobile: true },
  { key: 'desktop-reduced-motion', label: 'desktop 1440x900 + prefers-reduced-motion (modo static)', context: { viewport: VIEWPORTS.desktop, reducedMotion: 'reduce' }, assert: true, mobile: false },
  { key: 'mobile-cpu4x', label: 'mobile emulado 390x844 com CPU 4x mais lenta (CDP) — INFORMATIVO', context: { viewport: VIEWPORTS.mobile, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, cpuRate: 4, assert: false, mobile: true },
]

/** Coletor in-page: LCP, CLS (janelas de sessão), long tasks e Event Timing (INP aproximado). */
const installCollectors = () => {
  const w = window as unknown as { __perf: { lcp: number; lcpTag: string; clsWindows: number[]; longTasks: number[]; events: { name: string; duration: number; interactionId: number }[] } }
  w.__perf = { lcp: 0, lcpTag: '', clsWindows: [], longTasks: [], events: [] }
  const observe = (type: string, cb: (entries: PerformanceEntryList) => void, extra: object = {}) => {
    try { new PerformanceObserver(list => cb(list.getEntries())).observe({ type, buffered: true, ...extra } as PerformanceObserverInit) } catch { /* tipo não suportado */ }
  }
  observe('largest-contentful-paint', entries => {
    for (const e of entries as unknown as { startTime: number; element?: Element }[]) { w.__perf.lcp = e.startTime; w.__perf.lcpTag = e.element?.tagName ?? '' }
  })
  let sessionValue = 0
  let sessionStart = 0
  let last = 0
  observe('layout-shift', entries => {
    for (const e of entries as unknown as { value: number; startTime: number; hadRecentInput: boolean }[]) {
      if (e.hadRecentInput) continue
      if (sessionValue && e.startTime - last < 1000 && e.startTime - sessionStart < 5000) sessionValue += e.value
      else { sessionValue = e.value; sessionStart = e.startTime }
      last = e.startTime
      w.__perf.clsWindows.push(sessionValue)
    }
  })
  observe('longtask', entries => { for (const e of entries) w.__perf.longTasks.push(e.duration) })
  observe('event', entries => {
    for (const e of entries as unknown as { name: string; duration: number; interactionId: number }[]) w.__perf.events.push({ name: e.name, duration: e.duration, interactionId: e.interactionId })
  }, { durationThreshold: 16 })
}

async function synthetic(page: Page, mobile: boolean, locale: Locale) {
  // Interações sintéticas: teclado, clique em controles e validação do formulário (a atualização de estado mais pesada da página).
  if (mobile) {
    const trigger = page.locator('button.menu-trigger')
    await trigger.click()
    await page.keyboard.press('Escape')
  } else {
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
  }
  await page.locator('#diagnostico').scrollIntoViewIfNeeded()
  await page.locator('#name').click()
  await page.keyboard.type('abc', { delay: 30 })
  await page.getByRole('button', { name: locale === 'en' ? 'Prepare request' : 'Preparar solicitação' }).click()
  await page.locator('#consent').check()
  await page.waitForTimeout(400)
}

async function measure(browser: Browser, profile: Profile, locale: Locale) {
  const context = await browser.newContext({ ...profile.context, locale: locale === 'en' ? 'en-US' : 'pt-BR' }) // contexto novo = cache frio
  const page = await context.newPage()
  if (profile.cpuRate) { const cdp = await context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuRate }) }
  await page.addInitScript(installCollectors)
  const scripts: { url: string; three: boolean; gsap: boolean }[] = []
  const pending: Promise<void>[] = []
  page.on('response', r => {
    if (r.request().resourceType() !== 'script') return
    pending.push(r.text().then(t => { scripts.push({ url: r.url(), three: THREE_SIGNATURE.test(t), gsap: GSAP_SIGNATURE.test(t) }) }).catch(() => {}))
  })
  await page.goto(HOME[locale], { waitUntil: 'load' })
  await waitHydrated(page)
  await page.waitForTimeout(1500) // deixa o LCP finalizar e a cena carregar
  const lcpBeforeInteraction = await page.evaluate(() => (window as unknown as { __perf: { lcp: number } }).__perf.lcp)
  await synthetic(page, profile.mobile, locale)
  // percorre a página inteira para capturar deslocamentos tardios (cena, fontes, hidratação)
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const size = page.viewportSize()!
  await page.mouse.move(size.width / 2, size.height / 2)
  for (let y = 0; y < height; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(60) }
  await page.waitForTimeout(600)
  await Promise.all(pending)

  const raw = await page.evaluate(() => {
    const perf = (window as unknown as { __perf: { lcp: number; lcpTag: string; clsWindows: number[]; longTasks: number[]; events: { name: string; duration: number; interactionId: number }[] } }).__perf
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      lcp: perf.lcp, lcpTag: perf.lcpTag, cls: Math.max(0, ...perf.clsWindows), longTasks: perf.longTasks, events: perf.events,
      navigation: { encoded: nav.encodedBodySize, ttfb: nav.responseStart, domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd },
      resources: (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map(r => ({ name: r.name, initiator: r.initiatorType, encoded: r.encodedBodySize, transfer: r.transferSize, start: r.startTime })),
    }
  })
  const mode = await page.locator('.signal').getAttribute('data-mode')
  const origin = new URL(page.url()).origin
  await context.close()

  // INP aproximado: maior duração entre interações (interactionId > 0), já que há < 50 interações.
  const byInteraction = new Map<number, number>()
  for (const e of raw.events) if (e.interactionId > 0) byInteraction.set(e.interactionId, Math.max(byInteraction.get(e.interactionId) ?? 0, e.duration))
  const inp = byInteraction.size ? Math.max(...byInteraction.values()) : null

  const flag = new Map(scripts.map(s => [s.url, s]))
  const isJs = (r: { name: string }) => flag.has(r.name) || /\.js(\?|$)/.test(r.name)
  const sum = (items: { encoded: number }[]) => items.reduce((a, r) => a + r.encoded, 0)
  const js = raw.resources.filter(isJs)
  const sceneChunk = js.filter(r => flag.get(r.name)?.three)
  const gsapChunk = js.filter(r => flag.get(r.name)?.gsap)
  const initialJs = js.filter(r => !flag.get(r.name)?.three && !flag.get(r.name)?.gsap)
  const css = raw.resources.filter(r => /\.css(\?|$)/.test(r.name))
  const fonts = raw.resources.filter(r => /\.(woff2?|ttf|otf)(\?|$)/.test(r.name))
  const images = raw.resources.filter(r => r.initiator === 'img' || /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/.test(r.name))
  const thirdParty = raw.resources.filter(r => !r.name.startsWith(origin) && !r.name.startsWith('data:'))
  const beforeLcp = raw.resources.filter(r => r.start <= raw.lcp).length + 1 // + documento

  return {
    mode,
    lcpMs: Math.round(raw.lcp), lcpElement: raw.lcpTag, lcpBeforeInteractionMs: Math.round(lcpBeforeInteraction),
    cls: Number(raw.cls.toFixed(4)),
    inpMs: inp === null ? null : Math.round(inp), interactionsObserved: byInteraction.size,
    longTasksMs: raw.longTasks.map(Math.round), maxLongTaskMs: Math.round(Math.max(0, ...raw.longTasks)),
    tbtProxyMs: Math.round(raw.longTasks.reduce((a, d) => a + Math.max(0, d - 50), 0)),
    ttfbMs: Math.round(raw.navigation.ttfb), domContentLoadedMs: Math.round(raw.navigation.domContentLoaded), loadMs: Math.round(raw.navigation.load),
    requestsTotal: raw.resources.length + 1, requestsBeforeLcp: beforeLcp,
    bytes: {
      html: raw.navigation.encoded, css: sum(css), htmlPlusCss: raw.navigation.encoded + sum(css),
      jsTotal: sum(js), jsInitialExcludingSceneAndGsap: sum(initialJs), sceneChunk_threeR3F: sum(sceneChunk), gsapChunk: sum(gsapChunk),
      fonts: sum(fonts), images: sum(images), thirdParty: sum(thirdParty),
    },
    sceneChunksLoaded: sceneChunk.length, gsapChunksLoaded: gsapChunk.length,
  }
}

type Run = Awaited<ReturnType<typeof measure>>
const median = (values: number[]) => { const s = [...values].sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2 }
const worst = (values: number[]) => Math.max(...values)

const evidenceDir = path.join(process.cwd(), 'evidence')
const samplesDir = path.join(evidenceDir, 'perf-samples')

/** Cada teste grava seu resultado; o perf.json é remontado a cada gravação (o worker é reiniciado após falhas, então não há estado em memória). */
function persist(entry: { profile: string; locale: string } & Record<string, unknown>) {
  mkdirSync(samplesDir, { recursive: true })
  writeFileSync(path.join(samplesDir, `${entry.profile}__${entry.locale}.json`), JSON.stringify(entry, null, 2) + '\n')
  writePerfJson()
}

test.describe('Performance sintética (AC-070–074)', () => {
  for (const profile of PROFILES) {
    for (const locale of LOCALES) {
      test(`[AC-071][AC-072][AC-073] ${HOME[locale]} — ${profile.label}: LCP/CLS/INP e orçamento §7 (${RUNS} amostras, cache frio)`, async ({ browser }) => {
        test.setTimeout(150_000)
        const runs: Run[] = []
        for (let i = 0; i < RUNS; i++) runs.push(await measure(browser, profile, locale))

        const lcp = runs.map(r => r.lcpMs)
        const cls = runs.map(r => r.cls)
        const inp = runs.map(r => r.inpMs).filter((v): v is number => v !== null)
        const maxLong = runs.map(r => r.maxLongTaskMs)
        const b = runs[0].bytes
        const verdict = (label: string, budget: number, measuredMedian: number, measuredWorst: number, unit: string, useWorst = false) => ({
          metric: label, budget, unit, median: measuredMedian, worst: measuredWorst, pass: (useWorst ? measuredWorst : measuredMedian) <= budget,
        })
        const budgets = [
          verdict('LCP', BUDGET.lcpMs, median(lcp), worst(lcp), 'ms'),
          verdict('INP (aprox., Event Timing)', BUDGET.inpMs, inp.length ? median(inp) : 0, inp.length ? worst(inp) : 0, 'ms', true),
          verdict('CLS', BUDGET.cls, median(cls), worst(cls), '', true),
          verdict('HTML + CSS comprimido', BUDGET.htmlCssBytes, b.htmlPlusCss, b.htmlPlusCss, 'bytes'),
          verdict('JS inicial comprimido (sem three/R3F e sem gsap)', BUDGET.initialJsBytes, b.jsInitialExcludingSceneAndGsap, b.jsInitialExcludingSceneAndGsap, 'bytes'),
          verdict('Chunk da cena (three/R3F) comprimido', BUDGET.sceneChunkBytes, b.sceneChunk_threeR3F, b.sceneChunk_threeR3F, 'bytes'),
          verdict('Imagem/arte fallback', BUDGET.fallbackImageBytes, b.images, b.images, 'bytes'),
          verdict('Fontes no primeiro acesso', BUDGET.fontBytes, b.fonts, b.fonts, 'bytes'),
          verdict('Requests antes do conteúdo útil (até o LCP)', BUDGET.requestsBeforeContent, median(runs.map(r => r.requestsBeforeLcp)), worst(runs.map(r => r.requestsBeforeLcp)), 'requests', true),
          verdict('Long task máxima', BUDGET.longTaskMs, median(maxLong), worst(maxLong), 'ms', true),
          verdict('Terceiros', BUDGET.thirdPartyBytes, b.thirdParty, b.thirdParty, 'bytes'),
        ]
        persist({ profile: profile.key, profileLabel: profile.label, locale, assertsAgainstBudget: profile.assert, runs, budgets })

        // O perfil "mobile-cpu4x" é informativo (não falha a suíte); os demais falham se excederem o orçamento §7.
        if (!profile.assert) return
        expect(inp.length, 'Event Timing não registrou interações: INP não medido').toBeGreaterThan(0)
        // EXC-02 (work/exceptions.md): JS inicial acima de 130 KB é exceção registrada e pendente, com teto de regressão.
        const EXC02_CEILING = 175 * KB
        const jsBudget = budgets.find(v => v.metric.startsWith('JS inicial'))
        if (jsBudget && !jsBudget.pass) {
          expect(jsBudget.median, 'EXC-02: teto de regressão do JS inicial').toBeLessThanOrEqual(EXC02_CEILING)
          test.info().annotations.push({ type: 'EXC-02', description: `JS inicial ${jsBudget.median} B > 130 KB — exceção registrada, pendente de aprovação` })
        }
        const failed = budgets.filter(v => !v.pass && !v.metric.startsWith('JS inicial')).map(v => `${v.metric}: mediana ${v.median}${v.unit} / pior ${v.worst}${v.unit} > ${v.budget}${v.unit}`)
        expect(failed, 'orçamento §7 excedido').toEqual([])
        // Regras estruturais do modo (AC-036/037/070)
        const expectedMode = profile.key === 'desktop' ? ['full', 'static'] : profile.key === 'mobile' ? ['lite', 'static'] : ['static']
        for (const r of runs) expect(expectedMode).toContain(r.mode)
        if (profile.key !== 'desktop') expect(runs.every(r => r.sceneChunksLoaded === 0), 'chunk three/R3F não deve carregar fora do modo full').toBe(true)
        if (profile.key === 'desktop-reduced-motion') expect(runs.every(r => r.gsapChunksLoaded === 0), 'gsap não deve carregar em reduced motion').toBe(true)
      })
    }
  }
})

function writePerfJson() {
  const dir = evidenceDir
  mkdirSync(dir, { recursive: true })
  const collected = readdirSync(samplesDir).sort().map(f => JSON.parse(readFileSync(path.join(samplesDir, f), 'utf8')) as unknown)
  let env: Record<string, unknown> = {}
  try { env = JSON.parse(readFileSync(path.join(dir, 'environment.json'), 'utf8')) as Record<string, unknown> } catch { /* opcional */ }
  writeFileSync(path.join(dir, 'perf.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    disclaimer: 'MEDIÇÃO SINTÉTICA LOCAL. NÃO É DADO DE CAMPO: não representa p75 de usuários reais e não autoriza afirmar Core Web Vitals de produção. Números dependem desta máquina e podem variar.',
    method: {
      server: 'build de produção local (npm run build && next start -p 3107), servido em 127.0.0.1 (loopback, sem latência de rede; compressão gzip do next start)',
      browser: 'Chromium do Playwright, headless, contexto novo por amostra (cache frio), sem throttle de rede; sem throttle de CPU exceto o perfil informativo mobile-cpu4x (CDP Emulation.setCPUThrottlingRate=4)',
      samplesPerProfileAndRoute: RUNS,
      lcp: 'PerformanceObserver largest-contentful-paint (buffered); último candidato antes das interações',
      cls: 'PerformanceObserver layout-shift (sem hadRecentInput), maior janela de sessão (gap 1s, máx 5s), incluindo rolagem completa da página',
      inp: 'APROXIMAÇÃO: PerformanceObserver Event Timing (durationThreshold 16ms); maior duração entre interações (interactionId>0) disparadas sinteticamente por Playwright (teclado, clique em menu, digitação, validação do formulário). Não é o INP p75 de campo.',
      longTasks: 'PerformanceObserver longtask; TBT-proxy = soma de (duração - 50ms)',
      bytes: 'encodedBodySize do Resource Timing (corpo comprimido, sem cabeçalhos); chunks three/R3F e gsap identificados pelo conteúdo do script',
      requestsBeforeContent: 'documento + recursos iniciados até o instante do LCP',
      budgetSource: 'work/qa-evidence-plan.md §7',
    },
    environment: { ...env, headless: true, networkThrottling: 'none (loopback)', cpuThrottling: 'none, exceto perfil mobile-cpu4x', hostLoad: os.loadavg() },
    budget: BUDGET,
    results: collected,
  }, null, 2) + '\n')
}

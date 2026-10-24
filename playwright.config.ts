import { defineConfig, devices } from '@playwright/test'

/**
 * Suíte E2E do preview privado (build de produção local, sem rede externa).
 * O plano de referência é work/qa-evidence-plan.md (§4 critérios AC-*, §6 estratégia).
 *
 * Chromium do Playwright (revisão 1243 = Chromium 153) já está em ~/Library/Caches/ms-playwright e
 * casa com o @playwright/test instalado; nenhum `playwright install` é necessário.
 * Firefox/WebKit não estão instalados neste ambiente: ver limitações em evidence/e2e-report.md.
 */
const PORT = 3107
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  // Workers = 1: medições de performance e ordem determinística; sem retries (flaky = falha, plano §10.8).
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['json', { outputFile: 'evidence/results.json' }]],
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    locale: 'pt-BR',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: {} }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${baseURL}/pt-br`,
    reuseExistingServer: true,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})

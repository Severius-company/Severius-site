import { defineConfig, devices } from '@playwright/test'

/**
 * E2E do site Severius contra o build de produção (next build + next start) numa porta isolada.
 * Chromium do Playwright já está no cache local; nenhuma rede externa é usada.
 */
const PORT = 3117
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list']],
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: {} }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})

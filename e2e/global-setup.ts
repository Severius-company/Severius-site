import { chromium } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = process.cwd()

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir).sort()) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

/** Hash do conteúdo versionável (src + config), já que o repositório ainda não tem commit (plano §5 / §10.7). */
export function contentHash() {
  const hash = createHash('sha256')
  const files = [...walk(path.join(root, 'src')), ...['package.json', 'package-lock.json', 'next.config.mjs', 'tsconfig.json'].map(f => path.join(root, f))]
  for (const file of files) { hash.update(path.relative(root, file)); hash.update(readFileSync(file)) }
  return hash.digest('hex').slice(0, 16)
}

const version = (pkg: string) => (JSON.parse(readFileSync(path.join(root, 'node_modules', pkg, 'package.json'), 'utf8')) as { version: string }).version

/** Registra ambiente e versões reais em evidence/environment.json (consumido por evidence/e2e-report.md). */
export default async function globalSetup() {
  const browser = await chromium.launch()
  const chromeVersion = browser.version()
  await browser.close()
  mkdirSync(path.join(root, 'evidence'), { recursive: true })
  writeFileSync(path.join(root, 'evidence', 'environment.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    command: 'npm run test:e2e',
    chromium: chromeVersion,
    playwright: version('@playwright/test'),
    axeCorePlaywright: version('@axe-core/playwright'),
    axeCore: version('axe-core'),
    next: version('next'),
    react: version('react'),
    three: version('three'),
    gsap: version('gsap'),
    node: process.version,
    os: `${os.type()} ${os.release()} ${os.arch()}`,
    cpu: os.cpus()[0]?.model,
    cpuCount: os.cpus().length,
    memoryGB: Math.round(os.totalmem() / 1e9),
    contentHash: contentHash(),
    siteOriginEnv: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? null,
  }, null, 2) + '\n')
}

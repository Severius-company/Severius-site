import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { contentHash } from './global-setup'

/** Detecta se src/ ou a configuração mudou durante a execução (plano §10.7: resultado depende do hash). */
export default async function globalTeardown() {
  const file = path.join(process.cwd(), 'evidence', 'environment.json')
  const env = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
  const end = contentHash()
  writeFileSync(file, JSON.stringify({ ...env, finishedAt: new Date().toISOString(), contentHashEnd: end, sourceChangedDuringRun: end !== env.contentHash }, null, 2) + '\n')
}

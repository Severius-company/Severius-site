import { careersEnabled } from '@/lib/site'
import type { Locale } from '@/lib/i18n'
import { en } from './en'
import { ptBr } from './pt-br'
import { JOB_BASE, NAV_ROUTES, SERVICE_ICONS, SERVICE_IDS, WORK_BASE } from './shared'
import type { Dictionary, Quote, ServiceId, ServiceText, WorkText, WorkType } from './types'

const DICTIONARIES: Record<Locale, Dictionary> = { en, 'pt-br': ptBr }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

export interface Work extends WorkText {
  slug: string
  client: string
  url: string
  type: WorkType
}

export function getWorks(dict: Dictionary): Work[] {
  return WORK_BASE.map((base, i) => ({ ...base, ...dict.works[i] }))
}

export function getWork(dict: Dictionary, slug: string): Work | undefined {
  return getWorks(dict).find(w => w.slug === slug)
}

export function nextWork(dict: Dictionary, slug: string): Work {
  const works = getWorks(dict)
  const i = works.findIndex(w => w.slug === slug)
  return works[(i + 1) % works.length]
}

export function getQuotes(dict: Dictionary): Quote[] {
  return dict.works.flatMap(w => (w.quote ? [w.quote] : [])).slice(0, 4)
}

export interface Service extends ServiceText {
  id: ServiceId
  icon: (typeof SERVICE_ICONS)[ServiceId]
}

export function getServices(dict: Dictionary): Service[] {
  return SERVICE_IDS.map(id => ({ id, icon: SERVICE_ICONS[id], ...dict.services[id] }))
}

export function serviceIndex(id: string | undefined): number {
  const i = SERVICE_IDS.findIndex(s => s === id)
  return i < 0 ? 0 : i
}

export function getJobs(dict: Dictionary) {
  return JOB_BASE.map(base => ({ ...base, ...dict.careers.jobs[base.id] }))
}
export type Job = ReturnType<typeof getJobs>[number]

/** Links de navegação (Careers só entra com a flag ligada). */
export function getNavRoutes() {
  return NAV_ROUTES.filter(r => r.key !== 'careers' || careersEnabled)
}

import type { IconName } from '@/components/Icon'
import { slugify } from '@/lib/slug'
import type { JobGroup, NavKey, ServiceId, WorkType } from './types'

/** Dados que não se traduzem: nomes de clientes, URLs, tipos, ícones e contato. */
export const CONTACT = { email: 'hello@severius.com', phone: '+91 91813 23 2309' } as const

export const WORK_BASE: { slug: string; client: string; url: string; type: WorkType }[] = (
  [
    ['Chic Boutique', 'https://www.chicboutique.com', 'Web'],
    ['HungryBites', 'https://www.hungrybites.com', 'Mobile'],
    ['EventMasters', 'https://www.eventmasters.com', 'Software'],
    ['ProTech Solutions', 'https://www.protechsolutions.com', 'Software'],
    ['Dream Homes Realty', 'https://www.dreamhomesrealty.com', 'Web'],
    ['FitLife Tracker', 'https://www.fitlifetracker.com', 'Mobile'],
    ['Global Logistics Solutions', 'https://www.globallogisticssolutions.com', 'Software'],
    ['EduConnect', 'https://www.educonnect.com', 'Web'],
    ['WanderWise', 'https://www.wanderwise.com', 'Mobile'],
    ['ConnectCRM', 'https://www.connectcrm.com', 'Web'],
  ] as const
).map(([client, url, type]) => ({ slug: slugify(client), client, url, type }))

export const SERVICE_IDS: ServiceId[] = ['design', 'engineering', 'project-management']
export const SERVICE_ICONS: Record<ServiceId, IconName> = { design: 'pen', engineering: 'code', 'project-management': 'brief' }

export const WHY_ICONS: IconName[] = ['award', 'users', 'target', 'link']

export const JOB_BASE: { id: number; group: JobGroup; icon: IconName }[] = (
  [
    ['Design', 'pen'], ['Design', 'users'], ['Design', 'award'],
    ['Development', 'code'], ['Development', 'layers'], ['Development', 'code'],
    ['Management', 'brief'], ['Management', 'cal'], ['Management', 'users'],
    ['QA', 'shield'], ['QA', 'shield'], ['QA', 'target'],
  ] as const
).map(([group, icon], id) => ({ id, group, icon }))

export const NAV_ROUTES: { key: NavKey; href: string }[] = [
  { key: 'home', href: '/' },
  { key: 'services', href: '/services' },
  { key: 'work', href: '/work' },
  { key: 'process', href: '/process' },
  { key: 'about', href: '/about' },
  { key: 'careers', href: '/careers' },
]

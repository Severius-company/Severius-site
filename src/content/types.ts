import type { Locale } from '@/lib/i18n'

export type WorkType = 'Web' | 'Mobile' | 'Software'
export type WorkFilter = 'All' | WorkType
export type JobGroup = 'Design' | 'Development' | 'Management' | 'QA'
export type JobFilter = 'All' | JobGroup
export type ServiceId = 'design' | 'engineering' | 'project-management'
export type HeaderKey = 'services' | 'work' | 'process' | 'about' | 'careers' | 'contact' | 'legal'
export type NavKey = 'home' | 'services' | 'work' | 'process' | 'about' | 'careers'
export type NeedId = 'web-design' | 'mobile-app-design' | 'engineering' | 'collaboration' | 'others'
export type BudgetId = 'under-5k' | '5k-15k' | '15k-50k' | '50k-plus'

export interface Quote {
  title: string
  body: string
  name: string
  role: string
}

/** Parte traduzível de um case (mesma ordem de WORK_BASE). */
export interface WorkText {
  category: string
  desc: string
  tags: string[]
  quote?: Quote
}

export interface ServiceText {
  tab: string
  title: string
  include: string
  body: string
  groups: { title: string; items: string[] }[]
}

export interface TitleBody {
  title: string
  body: string
}

export interface LegalSection extends TitleBody {
  items?: string[]
}

/** Textos de UI usados por componentes client (só strings: serializável). */
export interface NavDict {
  links: Record<NavKey, string>
  contact: string
  mainAria: string
  mobileAria: string
  footerAria: string
  openMenu: string
  closeMenu: string
  homeAria: string
  skip: string
  languageAria: string
  languages: Record<Locale, string>
}

export interface WorkUiDict {
  filters: Record<WorkFilter, string>
  filterAria: string
  /** "{n} projects" */
  count: string
  /** "{type} mockup · {client}" */
  shot: string
  allWork: string
  scope: string
  startSimilar: string
  /** "Next: {client}" */
  next: string
  projectsAria: string
}

export interface CareersDict {
  perksTitle: string
  perks: TitleBody[]
  openingsTitle: string
  filterAria: string
  groups: Record<JobFilter, string>
  /** "{n} open role" / "{n} open roles" */
  countOne: string
  countMany: string
  /** "{group} job opening" */
  opening: string
  apply: string
  applied: string
  /** "Apply Now for {title}" */
  applyAria: string
  /** "Application started for {title}" */
  appliedAria: string
  jobs: { title: string; desc: string }[]
}

export interface ContactFormDict {
  formAria: string
  fullName: string
  email: string
  typeHere: string
  needsLabel: string
  needs: Record<NeedId, string>
  budgetLabel: string
  budgets: Record<BudgetId, string>
  message: string
  messagePlaceholder: string
  send: string
  errors: { name: string; email: string }
  received: string
  /** "Thanks{name}. ... reply{email} within one business day." */
  sent: string
  /** ", " antes do primeiro nome */
  sentNamePrefix: string
  /** " to " antes do e-mail */
  sentEmailPrefix: string
  sendAnother: string
  /** Nota sobre campos obrigatórios */
  requiredNote: string
  /** Texto curto exibido ao lado dos rótulos obrigatórios (ex.: "required") */
  requiredLabel: string
  emailHint: string
}

export interface Dictionary {
  locale: Locale
  meta: { homeTitle: string; homeDescription: string; titleSuffix: string }
  nav: NavDict
  hero: { line1: string; line2: string; for: string; and: string; audiences: [string, string, string, string]; ourWorks: string; startProject: string; trusted: string; scrollCue: string }
  scrollStory: { statement: string; stats: { value: number; suffix: string; label: string }[] }
  home: { servicesTitle: string; servicesBody: string; learnMore: string; learnMoreAria: string; selectedWork: string; seeAll: string; whyTitle: string; whyBody: string; quotesTitle: string; aboutCta: string; testimonialAria: string }
  headers: Record<HeaderKey, TitleBody>
  services: Record<ServiceId, ServiceText>
  servicesUi: { tabsAria: string; detailsAria: string }
  why: TitleBody[]
  works: WorkText[]
  workUi: WorkUiDict
  steps: TitleBody[]
  processAria: string
  stepLabel: string
  about: { title: string; body: string; storyTitle: string }
  story: TitleBody[]
  careers: CareersDict
  contact: {
    detailsAria: string
    getLocation: string
    operatingDays: string
    mondayToFriday: string
    form: ContactFormDict
    faqTitle: string
    /** "Still have questions? ... via {email}" */
    faqBody: string
  }
  faqs: { q: string; a: string }[]
  cta: { title: string; body: string; button: string }
  cookies: { title: string; body: string; accept: string; essential: string; aria: string; policy: string }
  legal: { updated: string; sections: LegalSection[] }
  footer: { rights: string; legal: string }
  notFound: { title: string; body: string; back: string }
}

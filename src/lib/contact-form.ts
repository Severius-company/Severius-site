import type { BudgetId, ContactFormDict, NeedId } from '@/content/types'

export interface ContactValues {
  name: string
  email: string
  needs: NeedId[]
  budget: BudgetId
  message: string
}

/** Estado inicial do protótipo: "Web Design" marcado e orçamento "$15k – $50k". */
export const INITIAL_CONTACT: ContactValues = { name: '', email: '', needs: ['web-design'], budget: '15k-50k', message: '' }
export const CONTACT_DRAFT_KEY = 'severius-contact-draft'

const NEED_IDS: NeedId[] = ['web-design', 'mobile-app-design', 'engineering', 'collaboration', 'others']
const BUDGET_IDS: BudgetId[] = ['under-5k', '5k-15k', '15k-50k', '50k-plus']

/** sessionStorage é entrada não confiável; só restaura campos e opções conhecidos. */
export function parseContactDraft(raw: string | null): ContactValues {
  if (!raw) return { ...INITIAL_CONTACT, needs: [...INITIAL_CONTACT.needs] }
  try {
    const value = JSON.parse(raw) as Partial<ContactValues>
    return {
      name: typeof value.name === 'string' ? value.name : '',
      email: typeof value.email === 'string' ? value.email : '',
      needs: Array.isArray(value.needs) ? value.needs.filter((id): id is NeedId => NEED_IDS.includes(id as NeedId)) : [...INITIAL_CONTACT.needs],
      budget: BUDGET_IDS.includes(value.budget as BudgetId) ? value.budget as BudgetId : INITIAL_CONTACT.budget,
      message: typeof value.message === 'string' ? value.message : '',
    }
  } catch {
    return { ...INITIAL_CONTACT, needs: [...INITIAL_CONTACT.needs] }
  }
}

export const EMAIL_RE = /^\S+@\S+\.\S+$/

export type ContactErrorField = 'name' | 'email'

/** Mesma ordem do protótipo: primeiro o nome, depois o e-mail. Retorna o campo inválido ou null. */
export function validateContact(values: Pick<ContactValues, 'name' | 'email'>): ContactErrorField | null {
  if (!values.name.trim()) return 'name'
  if (!EMAIL_RE.test(values.email.trim())) return 'email'
  return null
}

export function sentText(t: Pick<ContactFormDict, 'sent' | 'sentNamePrefix' | 'sentEmailPrefix'>, name: string, email: string): string {
  const first = name.trim().split(' ')[0]
  return t.sent
    .replace('{name}', first ? `${t.sentNamePrefix}${first}` : '')
    .replace('{email}', email.trim() ? `${t.sentEmailPrefix}${email.trim()}` : '')
}

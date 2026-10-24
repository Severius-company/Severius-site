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

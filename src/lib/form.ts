export const projectStages = ['exploring', 'defining', 'ready', 'progress'] as const
export type ProjectStage = (typeof projectStages)[number]

export type DiagnosticInput = {
  name: string
  contact: string
  context: string
  stage: string
  consent: boolean
}

export type DiagnosticData = Omit<DiagnosticInput, 'stage'> & { stage: ProjectStage | '' }
export type DiagnosticErrors = Partial<Record<keyof DiagnosticInput, 'required' | 'invalid' | 'too_long'>>

const forbiddenControls = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

function normalizeContact(value: string) {
  const trimmed = value.trim()
  const at = trimmed.lastIndexOf('@')
  if (at <= 0 || at === trimmed.length - 1) return trimmed
  return `${trimmed.slice(0, at)}@${trimmed.slice(at + 1).toLowerCase()}`
}

export function validateDiagnostic(input: DiagnosticInput):
  | { success: true; data: DiagnosticData }
  | { success: false; errors: DiagnosticErrors } {
  const data: DiagnosticData = {
    name: input.name.trim(),
    contact: normalizeContact(input.contact),
    context: input.context.replace(/\r\n?/g, '\n').trim(),
    stage: projectStages.includes(input.stage as ProjectStage) ? (input.stage as ProjectStage) : '',
    consent: input.consent,
  }
  const errors: DiagnosticErrors = {}
  if (!data.name) errors.name = 'required'
  else if (data.name.length > 100) errors.name = 'too_long'
  else if (forbiddenControls.test(data.name)) errors.name = 'invalid'
  if (!data.contact) errors.contact = 'required'
  else if (data.contact.length > 160) errors.contact = 'too_long'
  else if (forbiddenControls.test(data.contact)) errors.contact = 'invalid'
  if (!data.context) errors.context = 'required'
  else if (data.context.length > 1500) errors.context = 'too_long'
  else if (forbiddenControls.test(data.context)) errors.context = 'invalid'
  if (input.stage && !projectStages.includes(input.stage as ProjectStage)) errors.stage = 'invalid'
  if (!data.consent) errors.consent = 'required'
  return Object.keys(errors).length ? { success: false, errors } : { success: true, data }
}

const stageLabels = {
  'pt-br': { exploring: 'Explorando', defining: 'Definindo', ready: 'Pronto para começar', progress: 'Em andamento', none: 'Não informado' },
  en: { exploring: 'Exploring', defining: 'Defining', ready: 'Ready to start', progress: 'In progress', none: 'Not provided' },
} as const

export function buildRequestSummary(data: DiagnosticData, locale: 'pt-br' | 'en') {
  const stage = data.stage ? stageLabels[locale][data.stage] : stageLabels[locale].none
  return locale === 'pt-br'
    ? `Solicitação de diagnóstico — Severius\nNome: ${data.name}\nContato: ${data.contact}\nMomento: ${stage}\nContexto:\n${data.context}`
    : `Diagnostic request — Severius\nName: ${data.name}\nContact: ${data.contact}\nStage: ${stage}\nContext:\n${data.context}`
}

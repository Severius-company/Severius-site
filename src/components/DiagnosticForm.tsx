'use client'

import { useEffect, useRef, useState } from 'react'
import { buildRequestSummary, validateDiagnostic, type DiagnosticErrors } from '@/lib/form'
import type { Locale } from '@/lib/site'
import type { SiteCopy } from '@/lib/copy'

export function DiagnosticForm({ locale, text }: { locale: Locale; text: SiteCopy }) {
  const [errors, setErrors] = useState<DiagnosticErrors>({})
  const [summary, setSummary] = useState('')
  const summaryRef = useRef<HTMLElement>(null)
  useEffect(() => { if (summary) summaryRef.current?.focus() }, [summary])
  const [copyState, setCopyState] = useState<'idle'|'copied'|'error'>('idle')

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Campos lidos por id, sem atributo `name`: um submit nativo (sem JS) nunca leva dados para a URL.
    const form = event.currentTarget.elements
    const value = (id: string) => (form.namedItem(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value
    const result = validateDiagnostic({
      name: value('name'), contact: value('contact'), context: value('context'), stage: value('stage'),
      consent: (form.namedItem('consent') as HTMLInputElement).checked,
    })
    if (!result.success) {
      setErrors(result.errors); setSummary('')
      const first = ['name', 'contact', 'context', 'stage', 'consent'].find(id => id in result.errors)
      if (first) document.getElementById(first)?.focus()
      return
    }
    setErrors({})
    setSummary(buildRequestSummary(result.data, locale))
  }

  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setCopyState('copied') }
    catch { setCopyState('error') }
  }

  const errorText = (field: keyof DiagnosticErrors) => {
    if (!errors[field]) return ''
    if (field === 'context' && errors.context === 'too_long') return text.form.errors.contextLong
    return text.form.errors[field as keyof typeof text.form.errors] ?? text.form.generalError
  }

  return <form className="diagnostic-form" onSubmit={onSubmit} noValidate>
    {Object.keys(errors).length > 0 && <p className="form-error" role="alert">{text.form.generalError}</p>}
    <div className="field"><label htmlFor="name">{text.form.labels.name} <span aria-hidden="true">*</span></label><input id="name" autoComplete="name" maxLength={101} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}/>{errors.name && <p id="name-error" className="field-error">{errorText('name')}</p>}</div>
    <div className="field"><label htmlFor="contact">{text.form.labels.contact} <span aria-hidden="true">*</span></label><input id="contact" autoComplete="email" maxLength={161} placeholder={text.form.placeholders.contact} aria-invalid={!!errors.contact} aria-describedby={errors.contact ? 'contact-error' : undefined}/>{errors.contact && <p id="contact-error" className="field-error">{errorText('contact')}</p>}</div>
    <div className="field"><label htmlFor="context">{text.form.labels.context} <span aria-hidden="true">*</span></label><textarea id="context" rows={6} maxLength={1501} placeholder={text.form.placeholders.context} aria-invalid={!!errors.context} aria-describedby={`privacy-help${errors.context ? ' context-error' : ''}`}/>{errors.context && <p id="context-error" className="field-error">{errorText('context')}</p>}</div>
    <div className="field"><label htmlFor="stage">{text.form.labels.stage}</label><select id="stage" defaultValue=""><option value="">{text.form.stages[0]}</option>{['exploring','defining','ready','progress'].map((value, index) => <option key={value} value={value}>{text.form.stages[index+1]}</option>)}</select></div>
    <label className="consent"><input type="checkbox" id="consent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? 'consent-error' : undefined}/><span>{text.form.consent}</span></label>
    {errors.consent && <p id="consent-error" className="field-error">{errorText('consent')}</p>}
    <p id="privacy-help" className="privacy-help">{text.form.privacy}</p>
    <button className="button" type="submit">{text.form.submit}</button>
    {summary && <section className="local-summary" ref={summaryRef} tabIndex={-1} aria-live="polite"><p><strong>{text.form.success}</strong></p><textarea aria-label={text.form.success} readOnly value={summary} rows={8}/><div className="summary-actions"><button className="button button-light" type="button" onClick={copySummary}>{text.form.copy}</button><button className="text-button" type="button" onClick={() => setSummary('')}>{text.form.edit}</button></div>{copyState === 'copied' && <p role="status">{text.form.copied}</p>}{copyState === 'error' && <p role="alert">{text.form.copyError}</p>}</section>}
  </form>
}

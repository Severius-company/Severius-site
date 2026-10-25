'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Icon } from '@/components/Icon'
import type { BudgetId, ContactFormDict, NeedId } from '@/content/types'
import { INITIAL_CONTACT, sentText, validateContact, type ContactErrorField, type ContactValues } from '@/lib/contact-form'
import { toggleInList } from '@/lib/filters'

const NEED_IDS: NeedId[] = ['web-design', 'mobile-app-design', 'engineering', 'collaboration', 'others']
const BUDGET_IDS: BudgetId[] = ['under-5k', '5k-15k', '15k-50k', '50k-plus']

const INPUT =
  'min-h-[52px] rounded-rb border border-field-border bg-bg px-4 text-base text-text transition-colors duration-150 hover:border-hero-muted aria-[invalid=true]:border-2 aria-[invalid=true]:border-err'

export function ContactForm({ t }: { t: ContactFormDict }) {
  const [values, setValues] = useState<ContactValues>(INITIAL_CONTACT)
  const [error, setError] = useState<ContactErrorField | null>(null)
  const [sent, setSent] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  const set = (patch: Partial<ContactValues>) => setValues(v => ({ ...v, ...patch }))

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const err = validateContact(values)
    setError(err)
    if (err) {
      ;(err === 'name' ? nameRef : emailRef).current?.focus()
      return
    }
    setSent(true)
    requestAnimationFrame(() => doneRef.current?.focus())
  }

  const reset = () => {
    setValues(v => ({ ...v, name: '', email: '', message: '' }))
    setSent(false)
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-3.5 py-5">
        <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-mark-l bg-accent text-[30px] text-on-accent">
          <Icon name="check" />
        </span>
        <h2 ref={doneRef} tabIndex={-1} className="m-0 text-[28px] font-semibold tracking-[-0.01em]">{t.received}</h2>
        <p className="m-0 max-w-[52ch] text-base leading-[1.6] text-muted">{sentText(t, values.name, values.email)}</p>
        <Button variant="secondary" onClick={reset} className="min-h-12 px-5">{t.sendAnother}</Button>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-label={t.formAria} className="flex flex-col gap-[22px]">
      <p id="contact-required-note" className="m-0 text-[15px] leading-[1.5] text-muted">{t.requiredNote}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-medium">{t.fullName} <span aria-hidden="true" className="text-accent">*</span><span className="sr-only">({t.requiredLabel})</span></span>
          <input
            ref={nameRef}
            name="name"
            autoComplete="name"
            required
            aria-required="true"
            value={values.name}
            onChange={e => { set({ name: e.target.value }); setError(null) }}
            placeholder={t.typeHere}
            aria-invalid={error === 'name'}
            aria-describedby={error === 'name' ? 'contact-error' : undefined}
            className={INPUT}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-medium">{t.email} <span aria-hidden="true" className="text-accent">*</span><span className="sr-only">({t.requiredLabel})</span></span>
          <input
            ref={emailRef}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            required
            aria-required="true"
            value={values.email}
            onChange={e => { set({ email: e.target.value }); setError(null) }}
            placeholder={t.typeHere}
            aria-invalid={error === 'email'}
            aria-describedby={error === 'email' ? 'contact-email-hint contact-error' : 'contact-email-hint'}
            className={INPUT}
          />
          <span id="contact-email-hint" className="text-sm leading-[1.5] text-muted">{t.emailHint}</span>
        </label>
      </div>
      <div role="group" aria-labelledby="needs-label" className="flex flex-col gap-2.5">
        <span id="needs-label" className="text-[15px] font-medium">{t.needsLabel}</span>
        <div className="flex flex-wrap gap-2">
          {NEED_IDS.map(o => (
            <Chip key={o} on={values.needs.includes(o)} className="min-h-11 px-4" onClick={() => set({ needs: toggleInList(values.needs, o) })}>{t.needs[o]}</Chip>
          ))}
        </div>
      </div>
      <div role="group" aria-labelledby="budget-label" className="flex flex-col gap-2.5">
        <span id="budget-label" className="text-[15px] font-medium">{t.budgetLabel}</span>
        <div className="flex flex-wrap gap-2">
          {BUDGET_IDS.map(o => (
            <Chip key={o} on={values.budget === o} className="min-h-11 px-4" onClick={() => set({ budget: o })}>{t.budgets[o]}</Chip>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-medium">{t.message}</span>
        <textarea
          name="message"
          rows={4}
          value={values.message}
          onChange={e => set({ message: e.target.value })}
          placeholder={t.messagePlaceholder}
          className="resize-y rounded-rb border border-line2 bg-bg px-4 py-3.5 text-base leading-[1.5] text-text transition-colors duration-150 hover:border-[#4a4a4a]"
        />
      </label>
      {error ? (
        <p id="contact-error" role="alert" className="m-0 flex items-center gap-2 text-[15px] text-err">
          <span aria-hidden="true" className="flex text-lg"><Icon name="x" /></span>
          {t.errors[error]}
        </p>
      ) : null}
      <Button type="submit" className="min-h-14 self-start px-7 text-base">{t.send}</Button>
    </form>
  )
}

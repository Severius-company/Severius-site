import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getDictionary } from '@/content'
import { CONTACT_DRAFT_KEY } from '@/lib/contact-form'
import { ContactForm } from './ContactForm'

const copy = getDictionary('pt-br').contact.form

beforeEach(() => sessionStorage.clear())
afterEach(cleanup)

describe('ContactForm session draft', () => {
  it('restaura os campos após remontar o formulário', async () => {
    const first = render(<ContactForm t={copy} />)
    await userEvent.type(screen.getByLabelText(/Nome completo/), 'Ana Silva')
    await userEvent.type(screen.getByLabelText(/E-mail/), 'ana@empresa.com')
    await userEvent.type(screen.getByLabelText('Sua mensagem'), 'Precisamos de um CRM')
    expect(sessionStorage.getItem(CONTACT_DRAFT_KEY)).toContain('Ana Silva')
    first.unmount()

    render(<ContactForm t={copy} />)
    await waitFor(() => expect(screen.getByLabelText(/Nome completo/)).toHaveValue('Ana Silva'))
    expect(screen.getByLabelText(/E-mail/)).toHaveValue('ana@empresa.com')
    expect(screen.getByLabelText('Sua mensagem')).toHaveValue('Precisamos de um CRM')
  })

  it('mantém os dados ao escolher enviar outra mensagem', async () => {
    render(<ContactForm t={copy} />)
    await userEvent.type(screen.getByLabelText(/Nome completo/), 'Ana Silva')
    await userEvent.type(screen.getByLabelText(/E-mail/), 'ana@empresa.com')
    await userEvent.click(screen.getByRole('button', { name: copy.send }))
    await userEvent.click(screen.getByRole('button', { name: copy.sendAnother }))
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue('Ana Silva')
    expect(screen.getByLabelText(/E-mail/)).toHaveValue('ana@empresa.com')
  })
})

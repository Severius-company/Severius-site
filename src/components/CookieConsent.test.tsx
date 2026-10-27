import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CookieConsent } from './CookieConsent'

const copy = { title: 'Cookies', body: 'Cookie policy.', accept: 'Accept all', essential: 'Essential only', aria: 'Cookie preferences', policy: 'Read policy' }

beforeEach(() => { document.cookie = 'severius-cookie-consent=; Max-Age=0; Path=/' })
afterEach(cleanup)

describe('CookieConsent', () => {
  it('salva a escolha e fecha o aviso', async () => {
    render(<CookieConsent copy={copy} locale="en" />)
    expect(await screen.findByRole('link', { name: 'Read policy' })).toHaveAttribute('href', '/legal')
    await userEvent.click(await screen.findByRole('button', { name: 'Essential only' }))
    expect(screen.queryByLabelText('Cookie preferences')).not.toBeInTheDocument()
    expect(document.cookie).toContain('severius-cookie-consent=essential')
  })

  it('não reaparece quando já existe consentimento', async () => {
    document.cookie = 'severius-cookie-consent=all; Path=/'
    render(<CookieConsent copy={copy} locale="en" />)
    expect(screen.queryByLabelText('Cookie preferences')).not.toBeInTheDocument()
  })
})

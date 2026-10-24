import { describe, expect, it } from 'vitest'
import { getDictionary } from '@/content'
import { INITIAL_CONTACT, sentText, validateContact } from './contact-form'

describe('validateContact', () => {
  it('exige o nome primeiro', () => {
    expect(validateContact({ name: '  ', email: 'bad' })).toBe('name')
  })
  it('valida o e-mail com /^\\S+@\\S+\\.\\S+$/', () => {
    for (const email of ['', 'a@b', 'a b@c.d', 'ab.c']) expect(validateContact({ name: 'Ana', email })).toBe('email')
    expect(validateContact({ name: 'Ana', email: ' ana@site.com ' })).toBeNull()
  })
  it('estado inicial igual ao protótipo', () => {
    expect(INITIAL_CONTACT.needs).toEqual(['web-design'])
    expect(INITIAL_CONTACT.budget).toBe('15k-50k')
  })
  it('mensagens por idioma', () => {
    const en = getDictionary('en').contact.form
    const pt = getDictionary('pt-br').contact.form
    expect(en.errors).toEqual({ name: 'Please add your name.', email: 'Please enter a valid email address.' })
    expect(pt.errors).toEqual({ name: 'Informe seu nome.', email: 'Informe um e-mail válido.' })
    expect(sentText(en, 'Ana Souza', 'ana@site.com')).toBe('Thanks, Ana. A producer from our team will reply to ana@site.com within one business day.')
    expect(sentText(pt, 'Ana Souza', 'ana@site.com')).toBe('Obrigado, Ana! Alguém do nosso time vai responder para ana@site.com em até um dia útil.')
    expect(sentText(en, '', '')).toBe('Thanks. A producer from our team will reply within one business day.')
  })
})

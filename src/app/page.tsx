import { redirect } from 'next/navigation'

/** Idioma padrão. É uma página (não `redirects()` do next.config) para que os headers de segurança também cubram `/`. */
export default function Root() { redirect('/pt-br') }

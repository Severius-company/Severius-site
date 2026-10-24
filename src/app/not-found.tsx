import Link from 'next/link'

/** 404 raiz bilíngue porque o idioma solicitado é desconhecido. */
export default function RootNotFound() {
  return (
    <main className="state-page">
      <p className="wordmark">Severius<i aria-hidden="true" /></p>
      <h1>Esta página não foi encontrada.</h1>
      <p lang="en">This page could not be found.</p>
      <p><Link className="button" href="/pt-br">Voltar ao início</Link> <Link className="text-link" lang="en" href="/en">Back to the homepage</Link></p>
    </main>
  )
}

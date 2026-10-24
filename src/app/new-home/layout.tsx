import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { copy } from '@/lib/copy'
import './new-home.css'

// Rota de referência/rascunho: recria a ESTRUTURA das 7 páginas do template do Figma
// ("Digital Agency Company Website UI Design Template", comunidade), mas só com conteúdo
// já aprovado da Severius (copy.ts) — nenhum texto, logo, foto ou depoimento do template.
// Não faz parte do site público: sem link no header/footer real, sem entrada no sitemap,
// e com noindex explícito (o robots.txt do site já bloqueia tudo, isto é redundância deliberada).
export const metadata: Metadata = { title: 'Rascunho — estrutura do template (referência interna)', robots: { index: false, follow: false, nocache: true } }

const t = copy.en
const PAGES: [string, string][] = [
  ['Home', '/new-home'], ['Services', '/new-home/services'], ['Work', '/new-home/work'],
  ['Process', '/new-home/process'], ['About', '/new-home/about'], ['Careers', '/new-home/careers'], ['Contact', '/new-home/contact'],
]

export default function NewHomeLayout({ children }: { children: ReactNode }) {
  return <div className="nh">
    <p className="nh-banner">Reference layout only — structural inspiration from a third-party Figma community template, rebuilt with Severius&rsquo;s own real content. Not linked from the public site, not indexed, not a final design.</p>

    <header className="nh-header">
      <Link className="nh-wordmark" href="/new-home">Severius</Link>
      <nav aria-label="Reference pages">{PAGES.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </header>

    <main>{children}</main>

    <footer className="nh-footer">
      <p>{t.footer.promise}</p>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </footer>
  </div>
}

import Link from 'next/link'
import { copy } from '@/lib/copy'

const t = copy.en

// O template lista vagas de emprego fictícias em cards por departamento. A Severius não
// contrata funcionários (o trabalho é feito por uma célula de agentes sob direção do
// fundador — AGENTS.md) e não tem vagas reais abertas, então inventar cards de vaga
// seria exatamente o tipo de claim fabricado que o projeto proíbe. Isto explica o modelo
// real em vez de simular um quadro de vagas.
export default function CareersPage() {
  return <>
    <section className="nh-page-hero"><h1>How Severius is staffed</h1><p>{t.help.note}</p></section>

    <section className="nh-services">
      <h2>No traditional job openings — and that&rsquo;s intentional</h2>
      <p className="nh-lead">{t.help.note}</p>
      <p className="nh-note">Severius does not currently have open positions to list here. If a template like this one shows job cards, treat that as a structural idea, not as real openings for this project — we won&rsquo;t publish placeholder jobs that don&rsquo;t exist.</p>
    </section>

    <section className="nh-cta-banner">
      <h2>Are you a specialist who wants to talk?</h2>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </section>
  </>
}

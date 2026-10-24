import Link from 'next/link'
import { copy } from '@/lib/copy'
import { insightSlugs } from '@/lib/site'

const t = copy.en

// A página "Work" do template mostra 10 clientes/projetos fictícios com logos e capturas
// de tela — a Severius ainda não tem nenhum cliente real autorizado a divulgar, então isso
// vira Severius Labs (explorações reais, já rotuladas como conceituais) mais o insight
// publicado de verdade, em vez de inventar portfólio.
export default function WorkPage() {
  return <>
    <section className="nh-page-hero"><h1>Our Work</h1><p>{t.labs.label}</p></section>

    <section className="nh-services">
      <h2>{t.labs.title}</h2>
      <p className="nh-lead">{t.labs.body}</p>
      <div className="nh-cards">
        {t.labs.items.map(([title, body, explores]) => (
          <article key={title} className="nh-card nh-work-card">
            <div className="nh-work-thumb" aria-hidden="true"><span/><span/><span/></div>
            <h3>{title}</h3><p>{body}</p><small>{t.labs.explores}: {explores}</small><em>{t.labs.status}</em>
          </article>
        ))}
      </div>
    </section>

    <section className="nh-services">
      <h2>{t.insights.title}</h2>
      <div className="nh-cards">
        <article className="nh-card nh-work-card">
          <div className="nh-work-thumb" aria-hidden="true"><span/><span/><span/></div>
          <p className="nh-eyebrow">{t.insights.topic}</p>
          <h3><Link href={`/en/insights/${insightSlugs.en}`}>{t.insights.article[0]}</Link></h3>
          <p>{t.insights.article[1]}</p>
        </article>
        {t.insights.planned.map(([title, body]) => (
          <article key={title} className="nh-card nh-work-card">
            <div className="nh-work-thumb" aria-hidden="true"><span/><span/><span/></div>
            <p className="nh-eyebrow">{t.insights.pending}</p>
            <h3>{title}</h3><p>{body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="nh-cta-banner">
      <h2>{t.footer.promise}</h2>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </section>
  </>
}

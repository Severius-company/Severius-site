import Link from 'next/link'
import { copy } from '@/lib/copy'

const t = copy.en

// O template conta uma "história" fictícia da empresa ("Once upon a time…"). A Severius não
// tem uma narrativa de fundação documentada, então isso vira "como a Severius trabalha",
// com os 4 princípios reais em vez de uma origem inventada.
export default function AboutPage() {
  return <>
    <section className="nh-page-hero"><h1>About Severius</h1><p>{t.meta.description}</p></section>

    <section className="nh-services">
      <h2>{t.help.title}</h2>
      <p className="nh-lead">{t.help.body}</p>
      <p className="nh-note">{t.help.note}</p>
    </section>

    <section className="nh-services">
      <h2>How we work</h2>
      <div className="nh-principle-grid">
        {t.help.flow.map(([title, body]) => <div key={title}><strong>{title}</strong><span>{body}</span></div>)}
      </div>
    </section>

    <section className="nh-cta-banner">
      <h2>{t.footer.promise}</h2>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </section>
  </>
}

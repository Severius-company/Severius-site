import Link from 'next/link'
import { copy } from '@/lib/copy'

const t = copy.en

export default function ServicesPage() {
  return <>
    <section className="nh-page-hero"><h1>Our Capabilities</h1><p>{t.capabilities.body}</p></section>
    {t.capabilities.groups.map(([title, body, items]) => (
      <section className="nh-services" key={title}>
        <h2>{title}</h2>
        <p className="nh-lead">{body}</p>
        <div className="nh-cards nh-cards-4">
          {items.map(item => <article key={item} className="nh-card nh-card-compact"><h3>{item}</h3></article>)}
        </div>
      </section>
    ))}
    <section className="nh-cta-banner">
      <h2>{t.form.title}</h2>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </section>
  </>
}

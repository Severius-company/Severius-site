import Link from 'next/link'
import { copy } from '@/lib/copy'

const t = copy.en

export default function NewHome() {
  const [define, build, connect] = t.capabilities.groups

  return <>
    <section className="nh-hero">
      <div className="nh-dots" aria-hidden="true">{Array.from({ length: 40 }, (_, i) => {
        const x = (i / 39) * 100
        const y = 55 - 35 * Math.sin((i / 39) * Math.PI)
        return <span key={i} style={{ left: `${x}%`, top: `${y}%` }} />
      })}</div>
      <h1>{t.hero.title}</h1>
      <p>{t.hero.body}</p>
      <div className="nh-hero-actions"><Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link><Link className="nh-link" href="/new-home/services">{t.hero.secondary}</Link></div>
    </section>

    <section className="nh-trust" aria-label="What we do">
      {t.capabilities.groups.map(([title]) => <span key={title} className="nh-trust-item">{title}</span>)}
    </section>

    <section className="nh-services">
      <h2>{t.capabilities.title}</h2>
      <p className="nh-lead">{t.capabilities.body}</p>
      <div className="nh-cards">
        {[define, build, connect].map(([title, body, items]) => (
          <article key={title} className="nh-card">
            <h3>{title}</h3><p>{body}</p>
            <ul>{items.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
      <Link className="nh-link" href="/new-home/services">See all capabilities →</Link>
    </section>

    <section className="nh-cta-banner">
      <div className="nh-dots" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ left: `${(i / 17) * 100}%`, top: `${40 + 20 * Math.sin(i)}%` }} />)}</div>
      <h2>{t.footer.promise}</h2>
      <Link className="nh-cta" href="/new-home/contact">{t.nav.cta}</Link>
    </section>
  </>
}

import Link from 'next/link'
import type { Locale } from '@/lib/site'
import { insightSlugs } from '@/lib/site'
import type { SiteCopy } from '@/lib/copy'
import { Header } from './Header'
import { Signal } from './Signal'
import { DiagnosticForm } from './DiagnosticForm'
import { CapabilitiesMotion } from './CapabilitiesMotion'
import { Faq } from './Faq'
import { FaqMotion } from './FaqMotion'

export function HomePage({ locale, text }: { locale: Locale; text: SiteCopy }) {
  return <>
    <a className="skip-link" href="#conteudo">{text.skip}</a>
    <Header locale={locale} text={text}/>
    <main id="conteudo" tabIndex={-1}>
      <section className="hero dark-field" id="inicio">
        <Signal text={text}/>
        <div className="hero-grid page-grid">
          <div className="hero-copy"><h1>{text.hero.title}</h1><p>{text.hero.body}</p><div className="hero-actions"><a className="button" href="#diagnostico">{text.nav.cta}</a><a className="text-link" href="#processo">{text.hero.secondary}</a></div></div>
          <p className="hero-payoff" aria-hidden="true">{text.hero.payoff}</p>
        </div>
        <div className="hero-scroll" aria-hidden="true">{text.hero.scroll}<svg width="14" height="18" viewBox="0 0 14 18"><path d="M7 1 L7 17 M2 12 L7 17 L12 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div className="hero-progress" aria-hidden="true"><span/></div>
      </section>

      <section className="editorial-section help" id="como-ajudamos">
        <div className="page-grid split-heading"><h2>{text.help.title}</h2><div><p className="lead">{text.help.body}</p><ol className="flow-list">{text.help.flow.map(([title, body]) => <li key={title}><strong>{title}</strong><span>{body}</span></li>)}</ol><p className="factual-note">{text.help.note}</p></div></div>
      </section>

      <section className="editorial-section capabilities" id="capacidades">
        <CapabilitiesMotion/>
        <div className="page-grid"><div className="section-intro"><h2>{text.capabilities.title}</h2><p>{text.capabilities.body}</p></div><div className="capability-field">{text.capabilities.groups.map(([title, body, items], index) => <article className={`capability-group group-${index+1}`} key={title}><header><span className="connection-mark" aria-hidden="true"/><h3>{title}</h3><p>{body}</p></header><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div><a className="text-link contextual-link" href="#diagnostico">{text.nav.cta}</a></div>
      </section>

      <section className="process dark-field" id="processo">
        <div className="page-grid"><h2>{text.process.title}</h2><ol className="process-line">{text.process.steps.map(([title, body, output], index) => <li key={title}><span className="step-number">{index+1}</span><h3>{title}</h3><p>{body}</p><p className="output"><strong>{text.process.output}:</strong> {output}</p></li>)}</ol><p className="process-note">{text.process.note}</p></div>
      </section>

      <section className="editorial-section labs" id="labs">
        <div className="page-grid"><p className="labs-label">{text.labs.label}</p><div className="section-intro"><h2>{text.labs.title}</h2><p>{text.labs.body}</p></div><div className="labs-layout">{text.labs.items.map(([title, body, explores], index) => <article className={`lab lab-${index+1}`} key={title}><div className="lab-diagram" aria-hidden="true"><span/><i/><b/></div><h3>{title}</h3><p>{body}</p><p><strong>{text.labs.explores}:</strong> {explores}</p><small>{text.labs.status}</small></article>)}</div></div>
      </section>

      <section className="editorial-section insights" id="insights">
        <div className="page-grid"><h2>{text.insights.title}</h2><div className="insight-list"><article className="published-insight"><p>{text.insights.topic}</p><h3><Link href={`/${locale}/insights/${insightSlugs[locale]}`}>{text.insights.article[0]}</Link></h3><p>{text.insights.article[1]}</p><Link className="text-link" href={`/${locale}/insights/${insightSlugs[locale]}`}>{text.insights.read}</Link></article>{text.insights.planned.map(([title, body]) => <article key={title}><p>{text.insights.pending}</p><h3>{title}</h3><p>{body}</p></article>)}</div></div>
      </section>

      <Faq text={text}/>
      <FaqMotion/>

      <section className="diagnostic dark-field" id="diagnostico">
        <div className="page-grid diagnostic-layout"><div><h2>{text.form.title}</h2><p className="lead">{text.form.body}</p><h3>{text.form.nextTitle}</h3><ol>{text.form.next.map(item => <li key={item}>{item}</li>)}</ol><p className="preview-notice">{text.form.notice}</p></div><DiagnosticForm locale={locale} text={text}/></div>
      </section>
    </main>
    <footer className="site-footer dark-field"><div className="page-grid footer-grid"><div><p className="wordmark footer-wordmark">Severius<i aria-hidden="true"/></p><p>{text.footer.description}</p><p>{text.footer.promise}</p></div><nav aria-label={text.nav.work}><a href="#como-ajudamos">{text.nav.work}</a><a href="#capacidades">{text.nav.capabilities}</a><a href="#processo">{text.nav.process}</a><a href="#insights">{text.nav.insights}</a><a href="#faq">{text.nav.faq}</a><a href="#diagnostico">{text.nav.cta}</a><Link href={`/${text.otherLocale}`}>{text.localeName}</Link></nav></div><p className="footer-note page-grid">{text.footer.note}</p></footer>
  </>
}

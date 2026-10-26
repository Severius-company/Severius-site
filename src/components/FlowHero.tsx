import { LinkButton } from '@/components/Button'
import { Container } from '@/components/Container'
import { Icon } from '@/components/Icon'
import type { ExperienceCopy } from '@/content/homeExperience'
import { localePath, type Locale } from '@/lib/i18n'

export function FlowHero({ locale, copy }: { locale: Locale; copy: ExperienceCopy['hero'] }) {
  return (
    <section className="flow-hero" aria-labelledby="flow-hero-title">
      <Container className="flow-hero-grid">
        <div className="flow-hero-copy">
          <p className="flow-eyebrow">{copy.eyebrow}</p>
          <h1 id="flow-hero-title">{copy.title}</h1>
          <p className="flow-hero-body">{copy.body}</p>
          <div className="flow-hero-actions">
            <LinkButton href={localePath(locale, '/contact')} className="min-h-14 px-7 text-base">{copy.primary}<Icon name="arrowR" /></LinkButton>
            <a className="flow-text-link" href="#capacidades">{copy.secondary}<span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="flow-console" aria-label="Visualização conceitual de uma operação digital">
          <div className="flow-console-top"><span /><span /><span /><b>severius / operating-system</b></div>
          <div className="flow-console-canvas">
            <div className="flow-orbit flow-orbit-a" />
            <div className="flow-orbit flow-orbit-b" />
            <div className="flow-core"><strong>S</strong><span>system online</span></div>
            <span className="flow-node node-a">CRM</span><span className="flow-node node-b">SaaS</span>
            <span className="flow-node node-c">AI</span><span className="flow-node node-d">DATA</span>
          </div>
          <div className="flow-console-status"><i />{copy.signal}<span>99.9%</span></div>
        </div>
      </Container>
      <div className="flow-marquee" aria-hidden="true">
        <div className="flow-marquee-track">
          {[0, 1].map(group => (
            <div className="flow-marquee-group" key={group}>
              {Array.from({ length: 8 }, (_, index) => <span key={index}>PRODUCT · ENGINEERING · AUTOMATION · INTELLIGENCE · </span>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

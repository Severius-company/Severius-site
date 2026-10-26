import type { Metadata } from 'next'
import { LinkButton } from '@/components/Button'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { FaqList } from '@/components/FaqList'
import { FlowHero } from '@/components/FlowHero'
import { Icon } from '@/components/Icon'
import { InteractivePipeline } from '@/components/InteractivePipeline'
import { KineticRope } from '@/components/KineticRope'
import { ManifestoReveal } from '@/components/ManifestoReveal'
import { MethodDeck } from '@/components/MethodDeck'
import { Reveal } from '@/components/Reveal'
import { RopeServices } from '@/components/RopeServices'
import { ScrollStory } from '@/components/ScrollStory'
import { H2 } from '@/components/SectionHeader'
import { StackedWork } from '@/components/StackedWork'
import { getDictionary, getServices, getWorks } from '@/content'
import { getExperienceCopy } from '@/content/homeExperience'
import { fill, localePath, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

const SECTION = 'pt-[clamp(56px,7vw,96px)]'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  return pageMetadata(locale, '/', d.meta.homeTitle, d.meta.homeDescription, true)
}

export default async function HomePage({ params }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  const x = getExperienceCopy(locale)
  const works = getWorks(d)
  return (
    <div className="severius-flow">
      <KineticRope />
      <FlowHero locale={locale} copy={x.hero} />

      <ManifestoReveal copy={x.manifesto} />

      <ScrollStory t={d.scrollStory} cta={{ href: localePath(locale, '/contact'), label: d.hero.startProject }} />

      <Container><RopeServices copy={x.services} /></Container>
      <Container>
        <nav className="legacy-service-links" aria-label={d.home.servicesTitle}>
          {getServices(d).map(service => (
            <a key={service.id} href={`${localePath(locale, '/services')}?tab=${service.id}`} aria-label={fill(d.home.learnMoreAria, { title: service.title })}>
              <span>{service.title}</span><b aria-hidden="true">↗</b>
            </a>
          ))}
        </nav>
      </Container>
      <Container><InteractivePipeline copy={x.pipeline} /></Container>

      <Container as="section" aria-labelledby="work-title" className={SECTION}>
        <p className="flow-eyebrow">{x.work.eyebrow}</p>
        <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div><h2 id="work-title" className={H2}>{x.work.title}</h2><p className="work-disclaimer">{x.work.disclaimer}</p></div>
          <LinkButton href={localePath(locale, '/work')} variant="secondary" className="min-h-12 px-5">
            {x.work.all}<span className="flex text-lg"><Icon name="arrowR" /></span>
          </LinkButton>
        </Reveal>
        <StackedWork works={works.slice(0, 4)} locale={locale} shotTemplate={d.workUi.shot} />
      </Container>
      <MethodDeck copy={x.method} />
      <Container as="section" className="flow-faq" aria-labelledby="quotes-title">
        <p className="flow-eyebrow">{x.faq.eyebrow}</p><Reveal as="h2" id="quotes-title">{x.faq.title}</Reveal><FaqList faqs={x.faq.items} />
      </Container>
      <CtaBand locale={locale} dict={d} withForm />
    </div>
  )
}

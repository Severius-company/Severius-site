import type { Metadata } from 'next'
import { LinkButton } from '@/components/Button'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { FeatureCard } from '@/components/FeatureCard'
import { HeroHome } from '@/components/HeroHome'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { ScrollStory } from '@/components/ScrollStory'
import { H2, SectionHeader } from '@/components/SectionHeader'
import { ServiceCard } from '@/components/ServiceCard'
import { TestimonialCard } from '@/components/TestimonialCard'
import { WorkCard } from '@/components/WorkCard'
import { getDictionary, getQuotes, getServices, getWorks } from '@/content'
import { WHY_ICONS } from '@/content/shared'
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
  const works = getWorks(d)
  return (
    <>
      <HeroHome locale={locale} dict={d} />

      <ScrollStory t={d.scrollStory} />

      <Container as="section" aria-labelledby="services-title" className={SECTION}>
        <SectionHeader id="services-title" title={d.home.servicesTitle} body={d.home.servicesBody} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-px overflow-hidden rounded-r border border-line bg-line">
          {getServices(d).map((s, i) => (
            <ServiceCard key={s.id} service={s} locale={locale} learnMore={d.home.learnMore} learnMoreAria={d.home.learnMoreAria} delay={i * 80} />
          ))}
        </div>
      </Container>

      <Container as="section" aria-labelledby="work-title" className={SECTION}>
        <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <h2 id="work-title" className={H2}>{d.home.selectedWork}</h2>
          <LinkButton href={localePath(locale, '/work')} variant="secondary" className="min-h-12 px-5">
            {fill(d.home.seeAll, { n: works.length })}<span className="flex text-lg"><Icon name="arrowR" /></span>
          </LinkButton>
        </Reveal>
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-5 p-0">
          {works.slice(0, 4).map((w, i) => (
            <Reveal as="li" key={w.slug} delay={(i % 2) * 80}><WorkCard work={w} locale={locale} shotTemplate={d.workUi.shot} /></Reveal>
          ))}
        </ul>
      </Container>

      <Container as="section" aria-labelledby="why-title" className={SECTION}>
        <SectionHeader id="why-title" title={d.home.whyTitle} body={d.home.whyBody} />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-px overflow-hidden rounded-r border border-line bg-line">
          {d.why.map((y, i) => <FeatureCard key={y.title} icon={WHY_ICONS[i]} title={y.title} body={y.body} delay={i * 80} />)}
        </div>
      </Container>

      <Container as="section" aria-labelledby="quotes-title" className="py-[clamp(56px,7vw,96px)]">
        <Reveal as="h2" id="quotes-title" className={`${H2} mb-9 text-center`}>{d.home.quotesTitle}</Reveal>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-5">
          {getQuotes(d).map((q, i) => <TestimonialCard key={q.name} quote={q} delay={(i % 2) * 80} />)}
        </div>
      </Container>

      <CtaBand locale={locale} dict={d} />
    </>
  )
}

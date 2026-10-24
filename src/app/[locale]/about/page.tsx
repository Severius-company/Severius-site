import type { Metadata } from 'next'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { LogoMark } from '@/components/Logo'
import { PageHeader } from '@/components/PageHeader'
import { Reveal } from '@/components/Reveal'
import { H2 } from '@/components/SectionHeader'
import { StepCard } from '@/components/StepCard'
import { getDictionary } from '@/content'
import type { Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { pad2 } from '@/lib/slug'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.about
  return pageMetadata(locale, '/about', h.title, h.body)
}

export default async function AboutPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  return (
    <>
      <PageHeader title={d.headers.about.title} body={d.headers.about.body} />
      <Container className="py-[clamp(48px,6vw,80px)]">
        <section aria-labelledby="about-title" className="mb-16 grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-x-16 gap-y-10">
          <Reveal className="flex flex-col gap-[18px]">
            <h2 id="about-title" className={H2}>{d.about.title}</h2>
            <p className="m-0 text-[17px] leading-[1.65] text-muted">{d.about.body}</p>
          </Reveal>
          <Reveal delay={80} className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-r border border-line bg-hero">
            <div aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-accent opacity-50" />
            <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px bg-accent opacity-50" />
            <LogoMark size={96} className="relative" />
          </Reveal>
        </section>
        <section aria-labelledby="story-title">
          <Reveal as="h2" id="story-title" className={`${H2} mb-7`}>{d.about.storyTitle}</Reveal>
          <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-px overflow-hidden rounded-r border border-line bg-line p-0">
            {d.story.map((s, i) => <StepCard key={s.title} variant="story" n={pad2(i + 1)} title={s.title} body={s.body} delay={(i % 3) * 80} />)}
          </ol>
        </section>
      </Container>
      <CtaBand locale={locale} dict={d} />
    </>
  )
}

import type { Metadata } from 'next'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { PageHeader } from '@/components/PageHeader'
import { StepCard } from '@/components/StepCard'
import { getDictionary } from '@/content'
import type { Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { pad2 } from '@/lib/slug'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.process
  return pageMetadata(locale, '/process', h.title, h.body)
}

export default async function ProcessPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  return (
    <>
      <PageHeader title={d.headers.process.title} body={d.headers.process.body} />
      <Container as="section" aria-label={d.processAria} className="py-[clamp(48px,6vw,80px)]">
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,460px),1fr))] gap-px overflow-hidden rounded-r border border-line bg-line p-0">
          {d.steps.map((s, i) => <StepCard key={s.title} n={pad2(i + 1)} title={s.title} body={s.body} label={d.stepLabel} delay={(i % 2) * 80} />)}
        </ol>
      </Container>
      <CtaBand locale={locale} dict={d} />
    </>
  )
}

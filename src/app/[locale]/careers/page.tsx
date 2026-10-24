import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CareersJobs } from '@/components/CareersJobs'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { PageHeader } from '@/components/PageHeader'
import { Reveal } from '@/components/Reveal'
import { H2_SM } from '@/components/SectionHeader'
import { getDictionary, getJobs } from '@/content'
import type { Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'
import { careersEnabled } from '@/lib/site'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!careersEnabled) return {}
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.careers
  return pageMetadata(locale, '/careers', h.title, h.body)
}

/** Em standby enquanto `careersEnabled` for false (src/lib/site.ts): responde 404. */
export default async function CareersPage({ params }: Props) {
  if (!careersEnabled) notFound()
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  const t = d.careers
  const perks = t.perks
  return (
    <>
      <PageHeader title={d.headers.careers.title} body={d.headers.careers.body} />
      <Container className="py-[clamp(48px,6vw,80px)]">
        <section aria-labelledby="perks-title">
          <Reveal as="h2" id="perks-title" className={`${H2_SM} mb-7`}>{t.perksTitle}</Reveal>
          <ul className="m-0 mb-[72px] grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-px overflow-hidden rounded-r border border-line bg-line p-0">
            {perks.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80} className="flex flex-col gap-3 bg-bg p-7">
                <h3 className="m-0 text-[19px] font-medium text-accent">{p.title}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-muted">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>
        <CareersJobs jobs={getJobs(d)} t={t} />
      </Container>
      <CtaBand locale={locale} dict={d} />
    </>
  )
}

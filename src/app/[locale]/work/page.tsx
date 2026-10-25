import type { Metadata } from 'next'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { PageHeader } from '@/components/PageHeader'
import { WorkGrid } from '@/components/WorkGrid'
import { getDictionary, getWorks } from '@/content'
import type { Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.work
  return pageMetadata(locale, '/work', h.title, h.body)
}

export default async function WorkPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  const works = getWorks(d).map(({ slug, client, url, type, category }) => ({ slug, client, url, type, category }))
  return (
    <>
      <PageHeader title={d.headers.work.title} body={d.headers.work.body} />
      <Container as="section" aria-labelledby="projects-title" className="pt-9 pb-[clamp(56px,7vw,96px)]">
        <h2 id="projects-title" className="sr-only">{d.workUi.projectsAria}</h2>
        <WorkGrid works={works} locale={locale} t={d.workUi} />
      </Container>
      <CtaBand locale={locale} dict={d} />
    </>
  )
}

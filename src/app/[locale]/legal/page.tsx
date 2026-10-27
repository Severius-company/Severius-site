import type { Metadata } from 'next'
import { Container } from '@/components/Container'
import { PageHeader } from '@/components/PageHeader'
import { Reveal } from '@/components/Reveal'
import { getDictionary } from '@/content'
import type { Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.legal
  return pageMetadata(locale, '/legal', h.title, h.body)
}

export default async function LegalPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)

  return (
    <>
      <PageHeader title={d.headers.legal.title} body={d.headers.legal.body} />
      <Container className="py-[clamp(48px,7vw,96px)]">
        <p className="mb-10 text-sm font-semibold uppercase tracking-[.14em] text-accent">{d.legal.updated}</p>
        <div className="grid gap-px overflow-hidden rounded-r border border-line bg-line md:grid-cols-2">
          {d.legal.sections.map((section, index) => (
            <Reveal as="section" key={section.title} delay={(index % 2) * 70} className="bg-bg p-[clamp(24px,4vw,44px)]">
              <h2 className="text-[clamp(22px,2.4vw,32px)] font-semibold tracking-[-.02em]">{section.title}</h2>
              <p className="mt-4 text-[16px] leading-7 text-muted">{section.body}</p>
              {section.items ? (
                <ul className="mt-5 grid gap-3 pl-5 text-[15px] leading-6 text-muted">
                  {section.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              ) : null}
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  )
}

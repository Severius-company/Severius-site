import type { Metadata } from 'next'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { PageHeader } from '@/components/PageHeader'
import { ServicesTabs } from '@/components/ServicesTabs'
import { getDictionary, getServices, serviceIndex } from '@/content'
import type { Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.services
  return pageMetadata(locale, '/services', h.title, h.body)
}

export default async function ServicesPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  const { tab } = await searchParams
  const index = serviceIndex(typeof tab === 'string' ? tab : undefined)
  const services = getServices(d).map(s => ({ id: s.id, tab: s.tab, title: s.title, include: s.include, body: s.body, groups: s.groups }))
  return (
    <>
      <PageHeader title={d.headers.services.title} body={d.headers.services.body} />
      <Container as="section" aria-label={d.servicesUi.detailsAria} className="pt-10 pb-[clamp(56px,7vw,96px)]">
        <ServicesTabs key={index} services={services} locale={locale} tabsAria={d.servicesUi.tabsAria} initialIndex={index} />
      </Container>
      <CtaBand locale={locale} dict={d} />
    </>
  )
}

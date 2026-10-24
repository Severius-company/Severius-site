import { notFound } from 'next/navigation'
import { HomePage } from '@/components/HomePage'
import { copy } from '@/lib/copy'
import { hasApprovedOrigin, isLocale, siteOrigin } from '@/lib/site'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const jsonLd = { '@context':'https://schema.org', '@type':'Organization', name:'Severius', ...(hasApprovedOrigin ? { url:`${siteOrigin}/${locale}` } : {}), description:copy[locale].meta.description }
  const faqLd = { '@context':'https://schema.org', '@type':'FAQPage', mainEntity: copy[locale].faq.items.map(([question, answer]) => ({ '@type':'Question', name:question, acceptedAnswer:{ '@type':'Answer', text:answer } })) }
  const escape = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escape(jsonLd) }}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escape(faqLd) }}/><HomePage locale={locale} text={copy[locale]}/></>
}

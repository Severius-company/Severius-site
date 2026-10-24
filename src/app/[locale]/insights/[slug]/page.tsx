import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PtArticle from '@/content/pt-br/uncertainty.mdx'
import EnArticle from '@/content/en/uncertainty.mdx'
import { copy } from '@/lib/copy'
import { insightSlugs, isLocale, locales, ogLocale } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() { return locales.map(locale => ({ locale, slug:insightSlugs[locale] })) }

export async function generateMetadata({ params }: { params: Promise<{ locale:string; slug:string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale) || insightSlugs[locale] !== slug) return {}
  return { title:copy[locale].insights.article[0], description:copy[locale].insights.article[1], openGraph:{ title:copy[locale].insights.article[0], description:copy[locale].insights.article[1], type:'article', locale:ogLocale[locale], siteName:'Severius', url:`/${locale}/insights/${slug}` }, alternates:{ canonical:`/${locale}/insights/${slug}`, languages:{ 'pt-BR':`/pt-br/insights/${insightSlugs['pt-br']}`, en:`/en/insights/${insightSlugs.en}`, 'x-default':`/pt-br/insights/${insightSlugs['pt-br']}` } } }
}

export default async function InsightPage({ params }: { params: Promise<{ locale:string; slug:string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale) || insightSlugs[locale] !== slug) notFound()
  const Article = locale === 'pt-br' ? PtArticle : EnArticle
  return <><a className="skip-link" href="#conteudo">{copy[locale].skip}</a><header className="article-header"><Link className="wordmark" href={`/${locale}`}>Severius<i aria-hidden="true"/></Link><nav className="article-nav" aria-label="Severius"><Link href={`/${locale}#insights`}>{locale === 'pt-br' ? 'Voltar aos insights' : 'Back to insights'}</Link><Link href={`/${copy[locale].otherLocale}/insights/${insightSlugs[copy[locale].otherLocale]}`} hrefLang={copy[locale].otherLocale} aria-label={copy[locale].nav.language}>{copy[locale].localeName}</Link></nav></header><main id="conteudo" tabIndex={-1} className="article page-grid"><p className="article-topic">{copy[locale].insights.topic}</p><Article/></main></>
}

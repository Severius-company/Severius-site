import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LinkButton, buttonClasses } from '@/components/Button'
import { Container } from '@/components/Container'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/components/Icon'
import { Reveal } from '@/components/Reveal'
import { Tag } from '@/components/Tag'
import { shotLabel } from '@/components/WorkCard'
import { WorkShot } from '@/components/WorkShot'
import { getDictionary, getWork, nextWork } from '@/content'
import { WORK_BASE } from '@/content/shared'
import { fill, localePath, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string; slug: string }> }

/** Slugs iguais nos dois idiomas; o [locale] vem do layout. */
export function generateStaticParams() {
  return WORK_BASE.map(w => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const work = getWork(getDictionary(locale), slug)
  if (!work) return {}
  return pageMetadata(locale, `/work/${slug}`, `${work.client} — ${work.category}`, work.desc)
}

export default async function CasePage({ params }: Props) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const d = getDictionary(locale)
  const work = getWork(d, slug)
  if (!work) notFound()
  const next = nextWork(d, slug)
  const t = d.workUi

  return (
    <>
      <Container as="article" className="pt-7 pb-[clamp(56px,7vw,96px)]">
        <Link href={localePath(locale, '/work')} className={buttonClasses('secondary', 'mb-7 min-h-[42px] gap-1.5 pr-3.5 pl-2 text-sm')}>
          <span className="flex text-lg"><Icon name="chevL" /></span>{t.allWork}
        </Link>
        <div className="grid animate-hero-in grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-x-16 gap-y-10">
          <div className="flex flex-col items-start gap-[18px]">
            <span className="text-sm font-semibold tracking-[.06em] text-accent uppercase">{work.type}</span>
            <h1 className="m-0 text-[length:clamp(40px,5vw,64px)] leading-[1.05] font-semibold tracking-[-0.01em]">{work.client}</h1>
            <p className="m-0 text-xl leading-[1.5]">{work.category}</p>
            <Tag variant="muted">{work.url}</Tag>
            <p className="m-0 text-[17px] leading-[1.65] text-muted">{work.desc}</p>
            <ul aria-label={t.scope} className="m-0 flex list-none flex-wrap gap-2 p-0">
              {work.tags.map(tag => <li key={tag}><Tag variant="outline">{tag}</Tag></li>)}
            </ul>
          </div>
          <WorkShot label={shotLabel(t.shot, work)} className="aspect-[4/3] rounded-r border border-line" />
        </div>
        {work.quote ? (
          <Reveal as="figure" className="mx-0 mt-14 mb-0 flex flex-col gap-4 rounded-r border border-line bg-surface p-8">
            <blockquote className="m-0 flex flex-col gap-4">
              <p className="m-0 max-w-[40ch] text-[length:clamp(20px,2.2vw,28px)] leading-[1.5] font-medium text-accent">{work.quote.title}</p>
              <p className="m-0 max-w-[70ch] text-base leading-[1.6] text-muted">{work.quote.body}</p>
            </blockquote>
            <figcaption className="text-[15px]">{work.quote.name} · <span className="text-muted">{work.quote.role}</span></figcaption>
          </Reveal>
        ) : null}
        <Reveal className="mt-8 flex flex-wrap gap-3">
          <LinkButton href={localePath(locale, '/contact')} className="min-h-14 px-[26px] text-base">{t.startSimilar}</LinkButton>
          <LinkButton href={localePath(locale, `/work/${next.slug}`)} variant="secondary" className="min-h-14 gap-2.5 px-[22px] text-base">
            {fill(t.next, { client: next.client })}<span className="flex text-lg"><Icon name="arrowR" /></span>
          </LinkButton>
        </Reveal>
      </Container>
      <CtaBand locale={locale} dict={d} />
    </>
  )
}

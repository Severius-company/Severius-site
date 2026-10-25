import type { Metadata } from 'next'
import { ContactForm } from '@/components/ContactForm'
import { Container } from '@/components/Container'
import { FaqList } from '@/components/FaqList'
import { Icon, type IconName } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { Reveal } from '@/components/Reveal'
import { SectionHeader } from '@/components/SectionHeader'
import { getDictionary } from '@/content'
import { CONTACT } from '@/content/shared'
import { fill, type Locale } from '@/lib/i18n'
import { pageMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const h = getDictionary(locale).headers.contact
  return pageMetadata(locale, '/contact', h.title, h.body)
}

const ROW = 'flex min-h-16 items-center gap-3.5 rounded-rb border border-line bg-surface px-5 text-base font-medium'

export default async function ContactPage({ params }: Props) {
  const locale = (await params).locale as Locale
  const d = getDictionary(locale)
  const contacts: { icon: IconName; label: string; href?: string }[] = [
    { icon: 'mail', label: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: 'phone', label: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s+/g, '')}` },
    { icon: 'pin', label: d.contact.getLocation },
  ]
  return (
    <>
      <PageHeader title={d.headers.contact.title} body={d.headers.contact.body} />
      <Container as="section" aria-label={d.contact.detailsAria} className="pt-[clamp(48px,6vw,80px)]">
        <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
          <Reveal className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {contacts.map(c => {
                const inner = <><span className="flex text-[22px] text-accent"><Icon name={c.icon} /></span>{c.label}</>
                return (
                  <li key={c.icon}>
                    {c.href ? (
                      <a href={c.href} className={`${ROW} transition-colors duration-150 hover:border-line2 hover:bg-[#1f1f1f]`}>{inner}</a>
                    ) : (
                      <span className={ROW}>{inner}</span>
                    )}
                  </li>
                )
              })}
            </ul>
            <div className="flex items-center justify-between gap-3 px-1 pt-2.5 text-[15px]">
              <span className="text-muted">{d.contact.operatingDays}</span>
              <span className="rounded-tag bg-surface2 px-3 py-2">{d.contact.mondayToFriday}</span>
            </div>
          </Reveal>
          <Reveal delay={80} className="flex min-w-0 flex-[2_1_520px] flex-col gap-[22px] rounded-r border border-line bg-surface p-[clamp(24px,3vw,40px)]">
            <ContactForm t={d.contact.form} />
          </Reveal>
        </div>
      </Container>
      <Container as="section" aria-labelledby="faq-title" className="py-[clamp(56px,7vw,96px)]">
        <SectionHeader id="faq-title" className="mb-8" title={d.contact.faqTitle} body={fill(d.contact.faqBody, { email: CONTACT.email })} />
        <FaqList faqs={d.faqs} />
      </Container>
    </>
  )
}

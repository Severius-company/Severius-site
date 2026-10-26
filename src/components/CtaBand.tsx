import { LinkButton } from '@/components/Button'
import { ContactForm } from '@/components/ContactForm'
import { LogoMark } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import type { Dictionary } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'

export function CtaBand({ locale, dict, withForm = false }: { locale: Locale; dict: Dictionary; withForm?: boolean }) {
  if (withForm) {
    return (
      <section aria-labelledby="cta-band-title" className="cta-form-band bg-band text-text">
        <div className="mx-auto grid max-w-[1280px] min-[1800px]:max-w-[1600px] gap-10 px-[clamp(20px,4vw,48px)] py-[clamp(72px,9vw,130px)] lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)] lg:gap-[clamp(56px,8vw,120px)]">
          <Reveal className="cta-form-copy lg:sticky lg:top-28 lg:self-start">
            <LogoMark size={72} />
            <h2 id="cta-band-title" className="mt-7 mb-0 max-w-[12ch] text-[length:clamp(42px,5.3vw,76px)] leading-[.98] font-semibold tracking-[-0.045em] text-balance">{dict.cta.title}</h2>
            <p className="mt-6 mb-0 max-w-[48ch] text-[17px] leading-[1.65] text-hero-muted">{dict.cta.body}</p>
          </Reveal>
          <Reveal className="cta-form-panel glass-panel rounded-[18px] border p-[clamp(22px,4vw,48px)]">
            <ContactForm t={dict.contact.form} />
          </Reveal>
        </div>
      </section>
    )
  }
  return (
    <section aria-labelledby="cta-band-title" className="bg-band text-text">
      <Reveal className="mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] flex-col items-center gap-[22px] px-[clamp(20px,4vw,48px)] py-[clamp(64px,8vw,110px)] text-center">
        <LogoMark size={72} />
        <h2 id="cta-band-title" className="m-0 max-w-[20ch] text-[length:clamp(34px,4.4vw,60px)] leading-[1.06] font-semibold tracking-[-0.01em] text-balance">
          {dict.cta.title}
        </h2>
        <p className="m-0 max-w-[56ch] text-[17px] leading-[1.6] text-hero-muted">{dict.cta.body}</p>
        <LinkButton href={localePath(locale, '/contact')} className="min-h-14 px-7 text-base">{dict.cta.button}</LinkButton>
      </Reveal>
    </section>
  )
}

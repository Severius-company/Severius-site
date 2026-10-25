import { LinkButton } from '@/components/Button'
import { LogoMark } from '@/components/Logo'
import { Reveal } from '@/components/Reveal'
import type { Dictionary } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'

export function CtaBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
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

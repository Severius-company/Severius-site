import type { CSSProperties } from 'react'
import { LinkButton } from '@/components/Button'
import { LogoMark } from '@/components/Logo'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Tag } from '@/components/Tag'
import type { Dictionary } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'

type MotionStyle = CSSProperties & { '--hero-progress': number }

export function HeroHome({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.hero
  const [a, b, c, d] = t.audiences
  return (
    <section id="home-hero" className="hero-scroll-scene border-b border-line bg-hero" style={{ '--hero-progress': 0 } as MotionStyle}>
      <ScrollProgress targetId="home-hero" variable="--hero-progress" />
      <div className="hero-scroll-stage">
        <div aria-hidden="true" className="hero-sculpture">
          <span className="hero-halo hero-halo-one" />
          <span className="hero-halo hero-halo-two" />
          <span className="hero-halo hero-halo-three" />
          <span className="hero-core"><LogoMark size={96} /></span>
        </div>
        <div className="hero-scroll-copy mx-auto flex max-w-[1280px] min-[1800px]:max-w-[1600px] animate-hero-in flex-col items-center gap-7 px-[clamp(20px,4vw,48px)] text-center">
          <span className="hero-logo-spacer" aria-hidden="true" />
          <h1 className="m-0 max-w-[24ch] text-[length:clamp(34px,5.4vw,80px)] leading-[1.04] font-semibold tracking-[-0.01em] text-balance">
            {t.line1} <br className="max-md:hidden" />{t.line2}
          </h1>
          <p className="m-0 flex flex-wrap items-center justify-center gap-2 text-base text-hero-muted">
            <span>{t.for}</span>
            <Tag>{a}</Tag><Tag>{b}</Tag><Tag>{c}</Tag>
            <span>{t.and}</span><Tag>{d}</Tag>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href={localePath(locale, '/work')} variant="secondary" className="h-14 px-[26px] text-[17px]">{t.ourWorks}</LinkButton>
            <LinkButton href={localePath(locale, '/contact')} className="h-14 px-[26px] text-[17px]">{t.startProject}</LinkButton>
          </div>
          <span className="text-sm text-hero-muted">{t.trusted}</span>
        </div>
        <span aria-hidden="true" className="hero-scroll-cue"><i />Scroll</span>
      </div>
    </section>
  )
}

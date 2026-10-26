import { LinkButton } from '@/components/Button'
import { HeroRings } from '@/components/HeroRings'
import { ScrollProgress, type ScrollPhase } from '@/components/ScrollProgress'
import { Tag } from '@/components/Tag'
import { getQuotes } from '@/content'
import type { Dictionary } from '@/content/types'
import { localePath, type Locale } from '@/lib/i18n'
import { initials, pad2 } from '@/lib/slug'

/** Coreografia da cena (progresso 0→1 da seção inteira). */
const PHASES: ScrollPhase[] = [
  { name: '--hero-tilt', from: 0, to: 0.34 }, // anéis tombam e sobem (painel ainda parado no rodapé)
  { name: '--hero-rise', from: 0.26, to: 0.62 }, // painel sobe por cima; texto do hero sobe e esmaece
  { name: '--hero-fade', from: 0.58, to: 0.96 }, // núcleo/anéis encolhem e somem
]

/** Altura do header sticky (py-3.5 + 44px + borda): o palco fica preso logo abaixo dele. */
export const HEADER_HEIGHT = 73

/**
 * Hero + painel "About" numa cena única guiada pela rolagem:
 * o palco (anéis + texto) fica preso (sticky) e o painel de vidro sobe por cima dele.
 * Ordem do DOM = ordem de leitura; sem JS e com reduced-motion tudo fica em fluxo normal e visível.
 */
export function HeroHome({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const t = dict.hero
  const [a, b, c, d] = t.audiences
  const quotes = getQuotes(dict)
  const quote = quotes[0]
  return (
    <section id="home-hero" className="hero-scene" aria-labelledby="hero-title">
      <ScrollProgress targetId="home-hero" variable="--hero-progress" phases={PHASES} stickyTop={HEADER_HEIGHT} />
      <div className="hero-stage">
        <HeroRings />
        <div className="hero-content mx-auto grid h-full max-w-[1280px] min-[1800px]:max-w-[1600px] items-start gap-10 px-[clamp(20px,4vw,48px)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="hero-text animate-hero-in flex flex-col items-start gap-6">
            <h1 id="hero-title" className="m-0 max-w-[13ch] text-[length:clamp(40px,5.4vw,88px)] leading-[1.02] font-semibold tracking-[-0.02em]">
              {t.line1} {t.line2}
            </h1>
            <p className="m-0 flex flex-wrap items-center gap-2 text-base leading-[1.5] text-hero-muted">
              <span>{t.for}</span>
              <Tag>{a}</Tag><Tag>{b}</Tag><Tag>{c}</Tag>
              <span>{t.and}</span><Tag>{d}</Tag>
            </p>
            <div className="flex flex-wrap gap-3">
              <LinkButton href={localePath(locale, '/work')} variant="secondary" className="min-h-14 px-[26px] text-[17px]">{t.ourWorks}</LinkButton>
              <LinkButton href={localePath(locale, '/contact')} className="min-h-14 px-[26px] text-[17px]">{t.startProject}</LinkButton>
            </div>
            <span className="text-sm leading-[1.5] text-hero-muted">{t.trusted}</span>
          </div>
          <figure aria-label={dict.home.testimonialAria} className="hero-quote animate-hero-in m-0 flex flex-col gap-4 justify-self-end lg:mt-10">
            <div className="flex justify-end">
              <span aria-hidden="true" className="flex -space-x-2">
                {quotes.map(q => (
                  <span key={q.name} className="flex size-9 items-center justify-center rounded-full border-2 border-[#0b0b0b] bg-surface2 text-xs font-semibold">{initials(q.name)}</span>
                ))}
              </span>
            </div>
            <div className="hero-quote-card flex flex-col gap-3 rounded-[18px] p-6">
              <blockquote className="m-0">
                <p className="m-0 text-[17px] leading-[1.5] text-text">{quote.title}</p>
              </blockquote>
              <figcaption className="text-sm leading-[1.5] text-hero-muted">{quote.name} · {quote.role}</figcaption>
            </div>
          </figure>
        </div>
        <span aria-hidden="true" className="hero-scroll-cue"><i />{t.scrollCue}</span>
      </div>

      <div className="hero-panel-wrap mx-auto max-w-[1280px] min-[1800px]:max-w-[1600px] px-[clamp(12px,3vw,40px)]">
        <section aria-labelledby="about-panel-title" className="hero-panel">
          <div className="grid gap-x-16 gap-y-6 lg:grid-cols-2">
            <h2 id="about-panel-title" className="m-0 text-[length:clamp(32px,3.6vw,52px)] leading-[1.1] font-medium tracking-[-0.015em]">{dict.about.title}</h2>
            <div className="flex flex-col items-start gap-6">
              <p className="m-0 text-[17px] leading-[1.6] text-text">{dict.about.body}</p>
              <LinkButton href={localePath(locale, '/about')} className="min-h-12 rounded-full px-6">{dict.home.aboutCta}</LinkButton>
            </div>
          </div>
          <h3 className="mt-12 mb-5 text-[length:clamp(20px,2vw,26px)] leading-[1.3] font-medium">{dict.home.whyTitle}</h3>
          <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-4">
            {dict.why.map((y, i) => (
              <li key={y.title} className="hero-panel-card flex flex-col gap-3 rounded-[18px] p-6">
                <span aria-hidden="true" className="text-sm font-semibold text-accent">{pad2(i + 1)}</span>
                <h4 className="m-0 text-xl leading-[1.3] font-medium">{y.title}</h4>
                <p className="m-0 text-[15px] leading-[1.6] text-muted">{y.body}</p>
              </li>
            ))}
          </ol>
        </section>
        {/* espaço em que o painel fica parado (sticky) espiando no rodapé enquanto os anéis tombam */}
        <div aria-hidden="true" className="hero-panel-hold" />
      </div>
    </section>
  )
}
